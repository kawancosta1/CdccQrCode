
import './styles/global.css'
import './styles/theme.css'
import { Nav } from './components/Nav'

const shelves = [
  { estante: 1, range: '001.4 - 001.6' },
  { estante: 2, range: '020 - 160' },
  { estante: 3, range: '200 - 340' },
  { estante: 4, range: '342 - 370.15' },
  { estante: 5, range: '371 - 375' },
  { estante: 6, range: '378 - 514' },
  { estante: 7, range: '515 - 520' },
  { estante: 8, range: '523 - 573' },
  { estante: 9, range: '574 - 610' },
  { estante: 10, range: '611 - 630' },
  { estante: 11, range: '869 - 907.2' },
  { estante: 12, range: '909 - 981.64' },
]

export function App(){
  return <>
    <Nav/>
    <main style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#93536c', marginBottom: '1rem', fontSize: '2.5rem' }}>
        Catálogo QR Code CDCC
      </h1>

      {/* Instruções */}
      <section style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '1.5rem', 
        borderRadius: '0.8rem',
        marginBottom: '2rem',
        borderLeft: '4px solid #93536c'
      }}>
        <h2 style={{ color: '#93536c', marginTop: 0 }}>📚 Como usar:</h2>
        <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
          <li><strong>Digite o código do livro</strong> na barra de pesquisa (ex: <code style={{ backgroundColor: '#ddd', padding: '0.2rem 0.5rem', borderRadius: '0.3rem' }}>333.7</code>)</li>
          <li><strong>Pressione ENTER</strong> para buscar</li>
          <li>Você verá a <strong>localização exata na estante</strong> e a imagem do QR Code</li>
          <li>Se houver <strong>múltiplas imagens</strong>, use os botões ◀ e ▶ para navegar</li>
        </ul>
      </section>

      {/* Estantes */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#93536c', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
          📖 Navegue pelas Estantes
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {shelves.map((shelf) => (
            <div
              key={shelf.estante}
              style={{
                backgroundColor: '#93536c',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '0.8rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(147, 83, 108, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(147, 83, 108, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 83, 108, 0.2)';
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Estante {shelf.estante}
              </div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                {shelf.range}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Exemplos de busca */}
      <section style={{
        backgroundColor: '#f9f9f9',
        padding: '1.5rem',
        borderRadius: '0.8rem',
        marginBottom: '2rem',
        borderLeft: '4px solid #93536c'
      }}>
        <h2 style={{ color: '#93536c', marginTop: 0 }}>💡 Exemplos de busca:</h2>
        <p style={{ marginBottom: '1rem' }}>
          Tente procurar por esses códigos:
        </p>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.8rem',
        }}>
          {['333.7', '540', '981.64', '869', '612'].map((code) => (
            <code
              key={code}
              style={{
                backgroundColor: '#93536c',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.95rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(147, 83, 108, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Clique na barra de pesquisa e copie este código"
            >
              {code}
            </code>
          ))}
        </div>
      </section>

      {/* Dica */}
      <section style={{
        backgroundColor: '#fff3cd',
        padding: '1rem',
        borderRadius: '0.8rem',
        borderLeft: '4px solid #ffc107',
        marginBottom: '2rem',
      }}>
        <p style={{ margin: 0, color: '#856404', fontSize: '0.95rem' }}>
          <strong>💬 Dica:</strong> Você pode buscar pelo código completo (ex: 333.7) ou parcial (ex: 333) para ver todas as variações.
        </p>
      </section>
    </main>
  </>
}

