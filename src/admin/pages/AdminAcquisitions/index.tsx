import { useEffect, useState, type FormEvent } from "react";
import { Gift, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { RoomId } from "../../../config/roomConstants.ts";
import {
  AcquisitionsService,
  type AcquisitionItem,
  type AcquisitionOrigin,
} from "../../../services/acquisitionsService.ts";
import styles from "../../styles/cms.module.css";

export default function AdminAcquisitions() {
  const [items, setItems] = useState<AcquisitionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [origem, setOrigem] = useState<AcquisitionOrigin>("compra");
  const [doadorOuFornecedor, setDoadorOuFornecedor] = useState("");
  const [codigoDedalus, setCodigoDedalus] = useState("");
  const [sala, setSala] = useState<RoomId>(1);
  const [estante, setEstante] = useState("Estante 1");
  const [dataEntrada, setDataEntrada] = useState(() => new Date().toISOString().slice(0, 10));
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      setItems(await AcquisitionsService.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !codigoDedalus.trim()) return;
    setSaving(true);
    try {
      await AcquisitionsService.create({
        titulo: titulo.trim(),
        autor: autor.trim() || "Autor não informado",
        origem,
        doadorOuFornecedor: doadorOuFornecedor.trim() || undefined,
        codigoDedalus: codigoDedalus.trim(),
        sala,
        estante: estante.trim() || "Estante 1",
        dataEntrada,
        observacao: observacao.trim() || undefined,
        destaque: true,
      });
      setTitulo("");
      setAutor("");
      setDoadorOuFornecedor("");
      setCodigoDedalus("");
      setObservacao("");
      await loadItems();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await AcquisitionsService.remove(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Novos no Acervo (Compras & Doações)</h1>
          <p className={styles.subtitle}>
            Cadastre livros recém-adquiridos ou doados para exibição na página pública{" "}
            <code>/#/novidades</code>.
          </p>
        </div>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Cadastrar nova entrada</h2>
        <form onSubmit={handleAdd} className={styles.formGrid}>
          <label className={styles.field}>
            <span>Título *</span>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Breves Respostas para Grandes Questões"
            />
          </label>
          <label className={styles.field}>
            <span>Autor(a)</span>
            <input
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Ex: Stephen Hawking"
            />
          </label>
          <label className={styles.field}>
            <span>Origem *</span>
            <select
              value={origem}
              onChange={(e) => setOrigem(e.target.value as AcquisitionOrigin)}
            >
              <option value="compra">Compra</option>
              <option value="doacao">Doação</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>{origem === "compra" ? "Fonte / Edital (opcional)" : "Doador (opcional)"}</span>
            <input
              type="text"
              value={doadorOuFornecedor}
              onChange={(e) => setDoadorOuFornecedor(e.target.value)}
              placeholder={origem === "compra" ? "Aquisição USP / CDCC" : "Doação de Docente"}
            />
          </label>
          <label className={styles.field}>
            <span>Código Dedalus / CDU *</span>
            <input
              type="text"
              required
              value={codigoDedalus}
              onChange={(e) => setCodigoDedalus(e.target.value)}
              placeholder="Ex: 530.1 H392b"
            />
          </label>
          <label className={styles.field}>
            <span>Sala</span>
            <select value={sala} onChange={(e) => setSala(Number(e.target.value) as RoomId)}>
              <option value={1}>Sala 1</option>
              <option value={2}>Sala 2</option>
              <option value={3}>Sala 3</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Estante</span>
            <input
              type="text"
              value={estante}
              onChange={(e) => setEstante(e.target.value)}
              placeholder="Ex: Estante 8"
            />
          </label>
          <label className={styles.field}>
            <span>Data de entrada</span>
            <input
              type="date"
              value={dataEntrada}
              onChange={(e) => setDataEntrada(e.target.value)}
            />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Observação (opcional)</span>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Breve descrição da novidade no acervo"
            />
          </label>
          <div className={styles.fullWidth}>
            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              <Plus size={16} />
              {saving ? "Salvando..." : "Adicionar ao Novos no Acervo"}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Itens publicados ({items.length})</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className={styles.listStack}>
            {items.map((item) => (
              <div key={item.id} className={styles.listRow}>
                <div>
                  <span className={styles.badge}>
                    {item.origem === "compra" ? <ShoppingBag size={12} /> : <Gift size={12} />}{" "}
                    {item.origem === "compra" ? "Compra" : "Doação"}
                  </span>{" "}
                  <strong>{item.titulo}</strong> — {item.autor}
                  <div className={styles.mutedSmall}>
                    Sala {item.sala} • {item.estante} • Código <code>{item.codigoDedalus}</code> •{" "}
                    {item.dataEntrada}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={() => handleDelete(item.id)}
                  aria-label={`Remover ${item.titulo}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
