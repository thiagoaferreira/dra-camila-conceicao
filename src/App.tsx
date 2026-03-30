import './App.css'

const links = [
  {
    id: 1,
    label: 'AGENDAR\nCONSULTA',
    href: '#',
    featured: true,
    img: '/agendar-consulta.png',
  },
  {
    id: 2,
    label: 'MENTORIA',
    href: '#',
    img: '/mentoria.png',
  },
  {
    id: 3,
    label: 'FULL FACE',
    href: '#',
    img: '/full-face.png',
  },
  {
    id: 4,
    label: 'PROTOCOLO\nCCR',
    href: '#',
    img: '/protocolo-ccr.png',
  },
  {
    id: 5,
    label: 'ARQUEAMENTO\nDE SOBRANCELHAS',
    href: '#',
    img: '/arqueamento-de-sobrancelhas.png',
  },
  {
    id: 6,
    label: 'RINOMODELAÇÃO\nESTRUTURADA',
    href: '#',
    img: '/rinomodelacao-estruturada.png',
  },
]

export default function App() {
  return (
    <div className="app-wrapper">
      <div className="page-container">

        {/* Foto hero com borda arredondada e dourada */}
        <div className="hero-photo-wrapper">
          <div className="hero-photo-border">
            <div className="hero-photo-inner">
              <img
                src="/dra-camila.png"
                alt="Dra. Camila Conceição"
                className="hero-photo"
              />
            </div>
          </div>
        </div>

        {/* Grid de botões / cards */}
        <div className="links-grid">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
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

        {/* Logo footer */}
        <div className="footer-logo">
          <img src="/logo-dra-camila.png" alt="Dra. Camila Conceição" className="footer-logo-img" />
        </div>

      </div>
    </div>
  )
}
