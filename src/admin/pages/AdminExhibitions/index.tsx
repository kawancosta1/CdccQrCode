import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, QrCode, Sparkles, Trash2 } from "lucide-react";
import {
  ExhibitionsService,
  type ExhibitionItem,
} from "../../../services/exhibitionsService.ts";
import styles from "../../styles/cms.module.css";

export default function AdminExhibitions() {
  const [items, setItems] = useState<ExhibitionItem[]>([]);
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("Exposição Temática do Mês");
  const [descricao, setDescricao] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [tema, setTema] = useState("");
  const [codigosRaw, setCodigosRaw] = useState("530, 520");
  const [ativa, setAtiva] = useState(true);

  const load = async () => {
    setItems(await ExhibitionsService.getAll());
  };

  useEffect(() => {
    let active = true;
    ExhibitionsService.getAll()
      .then((list) => {
        if (active) setItems(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    const codigosDestaque = codigosRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await ExhibitionsService.create({
      titulo: titulo.trim(),
      subtitulo: subtitulo.trim() || "Exposição Temática",
      descricao: descricao.trim(),
      periodo: periodo.trim() || "Em cartaz",
      tema: tema.trim() || "Acervo CDCC",
      codigosDestaque,
      ativa,
    });
    setTitulo("");
    setDescricao("");
    setPeriodo("");
    setTema("");
    await load();
  };

  const toggleActive = async (item: ExhibitionItem) => {
    await ExhibitionsService.update(item.id, { ativa: !item.ativa });
    await load();
  };

  const handleDelete = async (id: string) => {
    await ExhibitionsService.remove(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Exposições Temáticas & Vitrines</h1>
          <p className={styles.subtitle}>
            Ative exposições temáticas para destacar obras e códigos CDU direto na página inicial.
          </p>
        </div>
        <Link to="/admin/qrcodes" className={styles.secondaryBtn}>
          <QrCode size={16} />
          Gerar QR Code para cartaz
        </Link>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Nova exposição temática</h2>
        <form onSubmit={handleCreate} className={styles.formGrid}>
          <label className={styles.field}>
            <span>Título da exposição *</span>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Semana Nacional de Ciência e Tecnologia"
            />
          </label>
          <label className={styles.field}>
            <span>Subtítulo / Etiqueta</span>
            <input
              type="text"
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Período e local</span>
            <input
              type="text"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              placeholder="Outubro • Hall da Sala 1"
            />
          </label>
          <label className={styles.field}>
            <span>Códigos CDU em destaque (separados por vírgula)</span>
            <input
              type="text"
              value={codigosRaw}
              onChange={(e) => setCodigosRaw(e.target.value)}
              placeholder="530, 520, 869.3"
            />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Descrição</span>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Resumo para os visitantes do portal"
            />
          </label>
          <label className={styles.field} style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" checked={ativa} onChange={(e) => setAtiva(e.target.checked)} />
            <span>Exibir imediatamente na Home</span>
          </label>
          <div className={styles.fullWidth}>
            <button type="submit" className={styles.primaryBtn}>
              <Plus size={16} />
              Criar Exposição
            </button>
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Exposições cadastradas ({items.length})</h2>
        <div className={styles.listStack}>
          {items.map((item) => (
            <div key={item.id} className={styles.listRow}>
              <div>
                <span className={styles.badge}>
                  <Sparkles size={12} /> {item.ativa ? "Ativa na Home" : "Pausada"}
                </span>{" "}
                <strong>{item.titulo}</strong> ({item.periodo})
                <div className={styles.mutedSmall}>
                  Códigos: {item.codigosDestaque.join(", ") || "Nenhum"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => toggleActive(item)}
                >
                  {item.ativa ? "Pausar" : "Ativar"}
                </button>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={() => handleDelete(item.id)}
                  aria-label={`Remover ${item.titulo}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
