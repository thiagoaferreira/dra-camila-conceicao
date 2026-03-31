import './App.css'

const WA = 'https://wa.me/5571997003399?text='

const links = [
  {
    id: 1,
    label: 'AGENDAR\nCONSULTA',
    href: WA + encodeURIComponent('Olá, vim pelo link na bio e gostaria de agendar uma consulta com a Dra. Camila!'),
    featured: true,
    img: '/agendar-consulta.png',
  },
  {
    id: 2,
    label: 'MENTORIA',
    href: WA + encodeURIComponent('Olá, vim pelo link na bio e tenho interesse em saber mais sobre a Mentoria da Dra. Camila!'),
    img: '/mentoria.png',
  },
  {
    id: 3,
    label: 'FULL FACE',
    href: WA + encodeURIComponent('Olá, vim pelo link na bio e quero saber mais sobre o procedimento Full Face da Dra. Camila!'),
    img: '/full-face.png',
  },
  {
    id: 4,
    label: 'PROTOCOLO\nCCR',
    href: WA + encodeURIComponent('Olá, vim pelo link na bio e quero saber mais sobre o Protocolo CCR da Dra. Camila!'),
    img: '/protocolo-ccr.png',
  },
  {
    id: 5,
    label: 'ARQUEAMENTO\nDE SOBRANCELHAS',
    href: WA + encodeURIComponent('Olá, vim pelo link na bio e quero saber mais sobre o Arqueamento de Sobrancelhas da Dra. Camila!'),
    img: '/arqueamento-de-sobrancelhas.png',
  },
  {
    id: 6,
    label: 'RINOMODELAÇÃO\nESTRUTURADA',
    href: WA + encodeURIComponent('Olá, vim pelo link na bio e quero saber mais sobre a Rinomodelação Estruturada da Dra. Camila!'),
    img: '/rinomodelacao-estruturada.png',
  },
]

export default function App() {
  return (
    <div className="app-wrapper">
      <div className="page-container">

        {/* Seção hero: imagem de fundo + cards sobrepostos */}
        <div className="hero-section">
          <img
            src="/dra-camila.png"
            alt="Dra. Camila Conceição"
            className="hero-bg"
          />
          {/* Gradiente que funde a imagem com o fundo preto */}
          <div className="hero-fade" />

          {/* Cards sobrepostos na parte inferior da imagem */}
          <div className="links-grid">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`link-card${link.featured ? ' link-card--featured' : ''}`}
              >
                {link.img && (
                  <img src={link.img} alt={link.label} className="link-card-bg" />
                )}
                {link.featured && (
                  <span className="link-card-badge">
                    <img src="/icone-1.png" alt="#1" className="link-card-badge-img" />
                  </span>
                )}
                <span className="link-card-label">
                  {link.label.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < link.label.split('\n').length - 1 && <br />}</span>
                  ))}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Logo footer */}
        <div className="footer-logo">
          <img src="/logo-dra-camila.png" alt="Dra. Camila Conceição" className="footer-logo-img" />
        </div>

      </div>
    </div>
  )
}
