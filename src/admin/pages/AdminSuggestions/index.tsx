import { useEffect, useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import {
  PurchaseSuggestionsService,
  type PurchaseSuggestion,
  type PurchaseSuggestionStatus,
} from "../../../services/purchaseSuggestionsService.ts";
import styles from "../../styles/cms.module.css";

const STATUS_LABELS: Record<PurchaseSuggestionStatus, string> = {
  pendente: "Pendente",
  avaliando: "Em avaliação",
  aprovada: "Aprovada",
  adquirida: "Adquirida",
  recusada: "Recusada",
};

export default function AdminSuggestions() {
  const [items, setItems] = useState<PurchaseSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"todos" | PurchaseSuggestionStatus>("todos");

  useEffect(() => {
    PurchaseSuggestionsService.getAll()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    statusFilter === "todos" ? items : items.filter((item) => item.status === statusFilter);

  const handleStatusChange = async (id: string, status: PurchaseSuggestionStatus) => {
    await PurchaseSuggestionsService.updateStatus(id, status);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const handleDelete = async (id: string) => {
    await PurchaseSuggestionsService.remove(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Sugestões de Compras da Comunidade</h1>
          <p className={styles.subtitle}>
            Acompanhe as indicações de livros enviadas pelos usuários em <code>/#/sugerir</code>.
          </p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={statusFilter === "todos" ? styles.primaryBtn : styles.secondaryBtn}
          onClick={() => setStatusFilter("todos")}
        >
          Todas ({items.length})
        </button>
        {(Object.keys(STATUS_LABELS) as PurchaseSuggestionStatus[]).map((st) => (
          <button
            key={st}
            type="button"
            className={statusFilter === st ? styles.primaryBtn : styles.secondaryBtn}
            onClick={() => setStatusFilter(st)}
          >
            {STATUS_LABELS[st]} ({items.filter((i) => i.status === st).length})
          </button>
        ))}
      </div>

      <section className={styles.card}>
        {loading ? (
          <p>Carregando sugestões...</p>
        ) : filtered.length === 0 ? (
          <p className={styles.mutedSmall}>Nenhuma sugestão registrada neste filtro.</p>
        ) : (
          <div className={styles.listStack}>
            {filtered.map((item) => (
              <div key={item.id} className={styles.listRow}>
                <div style={{ flex: 1 }}>
                  <strong>{item.titulo}</strong>{" "}
                  {item.autor ? `— ${item.autor}` : ""}
                  <div className={styles.mutedSmall}>
                    {item.categoria}
                    {item.editoraOuIsbn ? ` • ${item.editoraOuIsbn}` : ""}
                    {item.solicitanteNome ? ` • Solicitante: ${item.solicitanteNome}` : ""}
                  </div>
                  {item.justificativa && (
                    <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
                      &ldquo;{item.justificativa}&rdquo;
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value as PurchaseSuggestionStatus)
                    }
                    aria-label={`Status de ${item.titulo}`}
                  >
                    {(Object.keys(STATUS_LABELS) as PurchaseSuggestionStatus[]).map((st) => (
                      <option key={st} value={st}>
                        {STATUS_LABELS[st]}
                      </option>
                    ))}
                  </select>

                  {item.solicitanteEmail && (
                    <a
                      href={`mailto:${encodeURIComponent(item.solicitanteEmail)}?subject=${encodeURIComponent(
                        `Sobre sua sugestão de livro: ${item.titulo}`,
                      )}`}
                      className={styles.secondaryBtn}
                      title="Responder solicitante por e-mail"
                    >
                      <Mail size={14} />
                      Responder
                    </a>
                  )}

                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Excluir sugestão ${item.titulo}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
