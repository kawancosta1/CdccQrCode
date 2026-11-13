import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookPlus, CheckCircle2, Copy, Mail, Send } from "lucide-react";
import { Container } from "../../components/Container";
import {
  buildSuggestionMailtoUrl,
  LIBRARY_SUGGESTION_EMAIL,
  PurchaseSuggestionsService,
} from "../../services/purchaseSuggestionsService";
import style from "./style.module.css";

const CATEGORIES = [
  "Física / Astronomia",
  "Matemática / Computação",
  "Química / Biologia",
  "Literatura / Vestibular",
  "Infantojuvenil / HQ",
  "Educação & Divulgação Científica",
  "Outro",
];

export function SugestaoCompra() {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [editoraOuIsbn, setEditoraOuIsbn] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIES[0]);
  const [justificativa, setJustificativa] = useState("");
  const [solicitanteNome, setSolicitanteNome] = useState("");
  const [solicitanteEmail, setSolicitanteEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedMailto, setSubmittedMailto] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError("Informe pelo menos o título do livro sugerido.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        autor: autor.trim(),
        editoraOuIsbn: editoraOuIsbn.trim() || undefined,
        categoria,
        justificativa: justificativa.trim() || undefined,
        solicitanteNome: solicitanteNome.trim() || undefined,
        solicitanteEmail: solicitanteEmail.trim() || undefined,
      };
      await PurchaseSuggestionsService.submit(payload);
      const mailto = buildSuggestionMailtoUrl(payload);
      setSubmittedMailto(mailto);
    } catch {
      setError("Não foi possível registrar agora. Você ainda pode enviar diretamente por e-mail.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(LIBRARY_SUGGESTION_EMAIL);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      setCopiedEmail(false);
    }
  };

  const handleReset = () => {
    setTitulo("");
    setAutor("");
    setEditoraOuIsbn("");
    setJustificativa("");
    setSubmittedMailto(null);
    setError("");
  };

  return (
    <Container>
      <div className={style.page}>
        <Link to="/novidades" className={style.backLink}>
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar para Novos no Acervo
        </Link>

        <div className={style.layout}>
          <section className={style.card}>
            <header className={style.header}>
              <span className={style.eyebrow}>
                <BookPlus size={14} aria-hidden="true" />
                PARTICIPAÇÃO DA COMUNIDADE
              </span>
              <h1 className={style.title}>Sugestão de Compra de Livros</h1>
              <p className={style.subtitle}>
                Sente falta de alguma obra no acervo do CDCC-USP? Envie sua sugestão para a equipe da
                biblioteca e, se preferir, encaminhe também direto pelo seu e-mail.
              </p>
            </header>

            {submittedMailto ? (
              <div className={style.successBox} role="status">
                <CheckCircle2 size={32} className={style.successIcon} aria-hidden="true" />
                <h2 className={style.successTitle}>Sugestão registrada com sucesso!</h2>
                <p className={style.successDesc}>
                  Sua indicação já aparece no painel da Biblioteca CDCC. Clique abaixo se desejar
                  também enviar a mensagem formal por e-mail para{" "}
                  <strong>{LIBRARY_SUGGESTION_EMAIL}</strong>:
                </p>

                <div className={style.successActions}>
                  <a href={submittedMailto} className={style.emailCta}>
                    <Mail size={17} aria-hidden="true" />
                    Enviar por E-mail para a Biblioteca
                  </a>
                  <button type="button" className={style.secondaryBtn} onClick={handleReset}>
                    Sugerir outro livro
                  </button>
                </div>
              </div>
            ) : (
              <form className={style.form} onSubmit={handleSubmit}>
                {error && (
                  <p className={style.errorBanner} role="alert">
                    {error}
                  </p>
                )}

                <div className={style.row2}>
                  <label className={style.field}>
                    <span>Título do livro *</span>
                    <input
                      type="text"
                      required
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ex: O Mundo Assombrado pelos Demônios"
                    />
                  </label>

                  <label className={style.field}>
                    <span>Autor(a)</span>
                    <input
                      type="text"
                      value={autor}
                      onChange={(e) => setAutor(e.target.value)}
                      placeholder="Ex: Carl Sagan"
                    />
                  </label>
                </div>

                <div className={style.row2}>
                  <label className={style.field}>
                    <span>Área / Categoria</span>
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={style.field}>
                    <span>Editora ou ISBN (opcional)</span>
                    <input
                      type="text"
                      value={editoraOuIsbn}
                      onChange={(e) => setEditoraOuIsbn(e.target.value)}
                      placeholder="Ex: Companhia das Letras / 978-..."
                    />
                  </label>
                </div>

                <label className={style.field}>
                  <span>Por que este livro seria importante no acervo? (opcional)</span>
                  <textarea
                    rows={3}
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    placeholder="Ex: Referência para disciplina de Física, preparação para vestibular ou divulgação científica..."
                  />
                </label>

                <div className={style.row2}>
                  <label className={style.field}>
                    <span>Seu nome (opcional)</span>
                    <input
                      type="text"
                      value={solicitanteNome}
                      onChange={(e) => setSolicitanteNome(e.target.value)}
                      placeholder="Estudante / Docente / Visitante"
                    />
                  </label>

                  <label className={style.field}>
                    <span>Seu e-mail para retorno (opcional)</span>
                    <input
                      type="email"
                      value={solicitanteEmail}
                      onChange={(e) => setSolicitanteEmail(e.target.value)}
                      placeholder="voce@usp.br"
                    />
                  </label>
                </div>

                <div className={style.submitRow}>
                  <button type="submit" className={style.submitBtn} disabled={submitting}>
                    <Send size={16} aria-hidden="true" />
                    {submitting ? "Enviando..." : "Registrar sugestão"}
                  </button>
                  <a
                    href={buildSuggestionMailtoUrl({
                      titulo: titulo || "(Informe o título)",
                      autor,
                      editoraOuIsbn,
                      categoria,
                      justificativa,
                      solicitanteNome,
                      solicitanteEmail,
                    })}
                    className={style.secondaryBtn}
                  >
                    <Mail size={16} aria-hidden="true" />
                    Abrir direto no meu e-mail
                  </a>
                </div>
              </form>
            )}
          </section>

          <aside className={style.infoPanel}>
            <h2 className={style.infoTitle}>Contato direto da Biblioteca</h2>
            <p className={style.infoText}>
              Você também pode escrever diretamente para a equipe bibliotecária do CDCC-USP:
            </p>
            <div className={style.emailBox}>
              <code>{LIBRARY_SUGGESTION_EMAIL}</code>
              <button type="button" className={style.copyBtn} onClick={handleCopyEmail}>
                <Copy size={14} aria-hidden="true" />
                {copiedEmail ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <p className={style.infoNote}>
              Todas as sugestões passam por avaliação de orçamento, demanda didática e disponibilidade
              no sistema Dedalus USP.
            </p>
          </aside>
        </div>
      </div>
    </Container>
  );
}
