import './App.css'

const links = [
  {
    id: 1,
    label: 'AGENDAR\nCONSULTA',
    href: '#',
    featured: true,
  },
  {
    id: 2,
    label: 'MENTORIA',
    href: '#',
  },
  {
    id: 3,
    label: 'FULL FACE',
    href: '#',
  },
  {
    id: 4,
    label: 'PROTOCOLO\nCCR',
    href: '#',
  },
  {
    id: 5,
    label: 'ARQUEAMENTO\nDE SOBRANCELHAS',
    href: '#',
  },
  {
    id: 6,
    label: 'RINOMODELAÇÃO\nESTRUTURADA',
    href: '#',
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
              <div className="hero-overlay" />
              <div className="hero-text">
                <p className="hero-subtitle">REALCE SUA BELEZA COM</p>
                <h1 className="hero-title">DRA. CAMILA<br />CONCEIÇÃO</h1>
              </div>
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
              {link.featured && (
                <span className="link-card-badge">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="13" fill="#C9922A" stroke="#F5D98B" strokeWidth="1.5"/>
                    <text x="14" y="18.5" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff" fontFamily="Montserrat, sans-serif">1</text>
                  </svg>
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
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="24" stroke="#C9922A" strokeWidth="1.5"/>
            <path d="M26 14 C26 14 15 22 15 30 C15 38 20 43 26 43 C32 43 37 38 37 30 C37 22 26 14 26 14Z" fill="none" stroke="#C9922A" strokeWidth="1.5"/>
            <path d="M19 30 C19 30 22 35 26 30 C30 25 33 30 33 30" stroke="#C9922A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div className="footer-logo-text">
            <span className="footer-brand-line1">Dra. Camila</span>
            <span className="footer-brand-line2">Conceição</span>
          </div>
        </div>

      </div>
    </div>
  )
}
