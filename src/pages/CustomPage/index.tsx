import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin, Sparkles } from "lucide-react";
import { getCustomPageBySlug } from "../../services/pagesService.ts";
import type { CustomPage } from "../../types/content.ts";
import styles from "./style.module.css";

export default function CustomPageView() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));

  useEffect(() => {
    if (!slug) return;
    let active = true;
    getCustomPageBySlug(slug)
      .then((found) => {
        if (active) setPage(found && found.publicada ? found : null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.notFound}>Carregando página...</div>
      </main>
    );
  }

  if (!page) {
    return (
      <main className={styles.page}>
        <div className={styles.notFound}>
          <h1>Página não encontrada</h1>
          <p>Este conteúdo não está disponível ou foi despublicado pela equipe da biblioteca.</p>
          <Link to="/" className={styles.bookLink}>
            <ArrowLeft size={15} aria-hidden="true" /> Voltar para a Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {page.bannerUrl && (
        <div className={styles.banner}>
          <img src={page.bannerUrl} alt={page.titulo} />
        </div>
      )}

      <header className={styles.header}>
        <h1 className={styles.title}>{page.titulo}</h1>
        {page.subtitulo && <p className={styles.subtitle}>{page.subtitulo}</p>}
      </header>

      <div className={styles.blocks}>
        {page.blocos.map((block) => {
          if (block.tipo === "alerta_bentinho") {
            return (
              <section key={block.id} className={styles.bentinhoAlert}>
                <Sparkles size={22} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  {block.titulo && <h2>{block.titulo}</h2>}
                  {block.conteudo && <p>{block.conteudo}</p>}
                </div>
              </section>
            );
          }

          if (block.tipo === "link_externo" && block.linkUrl) {
            return (
              <section key={block.id} className={styles.externalCard}>
                <div>
                  {block.titulo && <h2>{block.titulo}</h2>}
                  {block.conteudo && <p>{block.conteudo}</p>}
                </div>
                <a
                  href={block.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalBtn}
                >
                  {block.linkLabel || "Acessar"} <ExternalLink size={15} aria-hidden="true" />
                </a>
              </section>
            );
          }

          if (block.tipo === "grade_livros") {
            return (
              <section key={block.id} className={styles.textBlock}>
                {block.titulo && <h2>{block.titulo}</h2>}
                {block.conteudo && <p>{block.conteudo}</p>}
                <div className={styles.bookGrid}>
                  {(block.livros ?? []).map((livro) => (
                    <article key={livro.id} className={styles.bookCard}>
                      {livro.capaUrl && (
                        <img
                          src={livro.capaUrl}
                          alt={livro.titulo}
                          style={{
                            width: "100%",
                            height: 140,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      )}
                      <h3>{livro.titulo}</h3>
                      <p className={styles.bookMeta}>
                        {livro.autor} • {livro.categoria}
                      </p>
                      <p className={styles.bookMeta}>
                        CDU: <strong>{livro.codigoDedalus}</strong> ({livro.salaEstante})
                      </p>
                      <Link
                        to={`/?q=${encodeURIComponent(livro.codigoDedalus)}`}
                        className={styles.bookLink}
                      >
                        <MapPin size={14} aria-hidden="true" /> Ver na Estante
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            );
          }

          return (
            <section key={block.id} className={styles.textBlock}>
              {block.titulo && <h2>{block.titulo}</h2>}
              {block.conteudo && <p>{block.conteudo}</p>}
            </section>
          );
        })}
      </div>
    </main>
  );
}
