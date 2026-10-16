import { useState } from 'react'
import './Consultas.css'
import {
  coletarUtms,
  leadVazio,
  mascaraTelefone,
  montarMensagemWhatsApp,
  montarPayloadCrm,
  validar,
  type Lead,
} from './lead'

const WHATSAPP = '5571997003399'

/* Webhook do CRM da Dra. Camila. O token e DESTE cliente: nunca reaproveitar em outro site.
   O CRM deduplica por telefone — o mesmo numero atualiza o lead em vez de criar outro. */
const CRM_WEBHOOK =
  'https://pajblplxhgebssydyesb.supabase.co/functions/v1/crm-lead-webhook' +
  '?token=1238350095d7451e920ad06b95589298586d88b7bb604262bfcefbf71ffee49f' +
  '&crm=e8518714-76d7-408f-bd80-2d18b88c4c5a'

const OBJETIVOS = [
  'Harmonização facial completa (Full Face)',
  'Rinomodelação Estruturada',
  'Lipo de Papada',
  'Arqueamento de Sobrancelhas',
  'Protocolo CCR',
  'Ainda não sei, quero orientação da Dra. Camila',
  'Sou profissional e quero saber da Mentoria',
]

const FAIXAS = ['Menos de 20 anos', '20 a 30 anos', '30 a 40 anos', '40 a 60 anos', 'Acima de 60 anos']

const DECISOES = [
  'Decido sozinha',
  'Preciso da opinião do parceiro ou de um parente',
  'Dependo financeiramente de outra pessoa',
]

const PRAZOS = ['Imediatamente', 'Em até 30 dias', 'Em até 3 meses', 'Ainda este ano']

const ORIGENS = ['Instagram', 'TikTok', 'YouTube', 'Google', 'Indicação de alguém']

type Grupo = { campo: keyof Lead; titulo: string; opcoes: string[] }

const GRUPOS: Grupo[] = [
  { campo: 'objetivo', titulo: 'Qual o seu objetivo?', opcoes: OBJETIVOS },
  { campo: 'faixaEtaria', titulo: 'Faixa etária', opcoes: FAIXAS },
  { campo: 'decisao', titulo: 'A decisão de investir em você é sua?', opcoes: DECISOES },
  { campo: 'prazo', titulo: 'Qual o prazo ideal para iniciar?', opcoes: PRAZOS },
  { campo: 'origem', titulo: 'Como você nos conheceu?', opcoes: ORIGENS },
]

export default function Consultas() {
  const [lead, setLead] = useState<Lead>(leadVazio)
  const [erros, setErros] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)

  function set(campo: keyof Lead, valor: string) {
    setLead((atual) => ({ ...atual, [campo]: valor }))
    if (erros.length) setErros((e) => e.filter((c) => c !== campo))
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    const falhas = validar(lead)
    setErros(falhas)
    if (falhas.length) {
      document.getElementById(falhas[0])?.focus()
      return
    }

    setEnviando(true)
    const utms = coletarUtms(window.location.search, sessionStorage.getItem('_tkutms'))
    const payload = montarPayloadCrm(lead, utms, window.location.href)

    /* O CRM nao pode segurar a pessoa: se o webhook falhar ou demorar, ela segue para o
       WhatsApp do mesmo jeito. O pixel ja registra o submit por conta propria. */
    if (CRM_WEBHOOK) {
      try {
        await fetch(CRM_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        })
      } catch {
        /* falha de rede nao bloqueia o atendimento */
      }
    }

    const texto = encodeURIComponent(montarMensagemWhatsApp(lead))
    window.location.href = `https://wa.me/${WHATSAPP}?text=${texto}`
  }

  const erro = (campo: string) => erros.includes(campo)

  return (
    <main className="consultas">
      <header className="consultas-topo">
        <img src="/logo-dra-camila.png" alt="Dra. Camila Conceição" className="consultas-logo" />
      </header>

      <section className="perfil">
        <div className="perfil-foto-wrap">
          <img src="/dra-camila.png" alt="Dra. Camila Conceição" className="perfil-foto" />
          <span className="perfil-selo">Profissional da clínica</span>
        </div>
        <h1 className="perfil-nome">Dra. Camila Conceição</h1>
        {/* TODO Thiago: falta o registro profissional (CRO ou CRM) ao lado das tres areas. */}
        <p className="perfil-cargo">
          Harmonização Facial · Rinomodelação · Lipo de Papada
        </p>
        {/* TODO Thiago: trocar pelo texto que a Dra. Camila aprovar. Nao inventar numeros. */}
        <p className="perfil-bio">
          Atendimento em três frentes: harmonização facial, rinomodelação e lipo de papada. A
          leitura é individual, feita a partir dos seus traços: nada de protocolo pronto. O plano
          é montado na consulta, de acordo com o resultado que você quer alcançar.
        </p>
      </section>

      <form className="form" onSubmit={enviar} noValidate>
        <h2 className="form-titulo">Faça sua Pré-Avaliação</h2>
        <p className="form-intro">
          Preencha os dados abaixo para a equipe entender o seu caso e indicar qual protocolo
          atende o seu objetivo.
        </p>

        <label className="campo" htmlFor="nome">
          <span className="campo-rotulo">
            Nome <em>*</em>
          </span>
          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            className={erro('nome') ? 'campo-input campo-input--erro' : 'campo-input'}
            aria-invalid={erro('nome')}
            aria-describedby={erro('nome') ? 'erro-nome' : undefined}
            value={lead.nome}
            onChange={(e) => set('nome', e.target.value)}
          />
          {erro('nome') && (
            <span className="campo-erro" id="erro-nome">
              Escreva o seu nome.
            </span>
          )}
        </label>

        <label className="campo" htmlFor="whatsapp">
          <span className="campo-rotulo">
            WhatsApp <em>*</em>
          </span>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="(71) 99999-9999"
            className={erro('whatsapp') ? 'campo-input campo-input--erro' : 'campo-input'}
            aria-invalid={erro('whatsapp')}
            aria-describedby={erro('whatsapp') ? 'erro-whatsapp' : undefined}
            value={lead.whatsapp}
            onChange={(e) => set('whatsapp', mascaraTelefone(e.target.value))}
          />
          {erro('whatsapp') && (
            <span className="campo-erro" id="erro-whatsapp">
              Informe o WhatsApp com DDD.
            </span>
          )}
        </label>

        <label className="campo" htmlFor="email">
          <span className="campo-rotulo">E-mail</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={erro('email') ? 'campo-input campo-input--erro' : 'campo-input'}
            aria-invalid={erro('email')}
            aria-describedby={erro('email') ? 'erro-email' : undefined}
            value={lead.email}
            onChange={(e) => set('email', e.target.value)}
          />
          {erro('email') && (
            <span className="campo-erro" id="erro-email">
              Confira o e-mail digitado.
            </span>
          )}
        </label>

        <div className="campo-dupla">
          <label className="campo" htmlFor="cidade">
            <span className="campo-rotulo">Cidade</span>
            <input
              id="cidade"
              name="cidade"
              type="text"
              autoComplete="address-level2"
              className="campo-input"
              value={lead.cidade}
              onChange={(e) => set('cidade', e.target.value)}
            />
          </label>

          <label className="campo" htmlFor="profissao">
            <span className="campo-rotulo">Profissão</span>
            <input
              id="profissao"
              name="profissao"
              type="text"
              className="campo-input"
              value={lead.profissao}
              onChange={(e) => set('profissao', e.target.value)}
            />
          </label>
        </div>

        {GRUPOS.map((grupo) => (
          <fieldset className="grupo" key={grupo.campo}>
            <legend className="grupo-titulo">{grupo.titulo}</legend>
            {grupo.opcoes.map((opcao) => (
              <label className="opcao" key={opcao}>
                <input
                  type="radio"
                  name={grupo.campo}
                  value={opcao}
                  checked={lead[grupo.campo] === opcao}
                  onChange={() => set(grupo.campo, opcao)}
                />
                <span className="opcao-marca" aria-hidden="true" />
                <span className="opcao-texto">{opcao}</span>
              </label>
            ))}
          </fieldset>
        ))}

        <button type="submit" className="botao botao--principal" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Quero fazer a pré-avaliação'}
        </button>

        <a
          className="botao botao--secundario"
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
            'Olá, vim pelo site e gostaria de saber como funciona a pré-avaliação com a Dra. Camila.',
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          id="whatsapp_click"
        >
          Buscar mais informações no WhatsApp
        </a>
      </form>

      <footer className="rodape">
        <p>© Dra. Camila Conceição · Pré-avaliação de consulta</p>
        <a href="/politica-de-privacidade.html">Política de Privacidade</a>
      </footer>
    </main>
  )
}
