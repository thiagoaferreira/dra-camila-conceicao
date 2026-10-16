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

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

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

type CampoTextoProps = {
  id: keyof Lead
  rotulo: string
  valor: string
  erro: boolean
  msgErro: string
  onChange: (v: string) => void
  tipo?: string
  autoComplete?: string
  placeholder?: string
  inputMode?: 'numeric'
}

/* Todos os campos de texto se comportam igual: obrigatorios, com a mesma marcacao de erro
   e o mesmo aria. Um componente so evita repetir isso cinco vezes. */
function CampoTexto({
  id,
  rotulo,
  valor,
  erro,
  msgErro,
  onChange,
  tipo = 'text',
  autoComplete,
  placeholder,
  inputMode,
}: CampoTextoProps) {
  const idErro = `erro-${id}`
  return (
    <label className="campo" htmlFor={id}>
      <span className="campo-rotulo">
        {rotulo} <em>*</em>
      </span>
      <input
        id={id}
        name={id}
        type={tipo}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={erro ? 'campo-input campo-input--erro' : 'campo-input'}
        aria-invalid={erro}
        aria-describedby={erro ? idErro : undefined}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      />
      {erro && (
        <span className="campo-erro" id={idErro}>
          {msgErro}
        </span>
      )}
    </label>
  )
}

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
      const alvo = document.getElementById(falhas[0])
      /* O radio e invisivel e tem tamanho zero: focar nele nao rola a pagina.
         Rolamos o bloco que o contem e so entao damos o foco. */
      alvo?.closest('fieldset, label')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      alvo?.focus({ preventScroll: true })
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

    /* O clique no botao tambem dispara quando a validacao barra o envio. Este evento so
       sai depois que o lead foi aceito, entao e ele que vale como conversao no GTM. */
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'pre_avaliacao_enviada',
      objetivo: lead.objetivo,
      origem: lead.origem,
      prazo: lead.prazo,
    })

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

      <form id="form_pre_avaliacao" className="form" onSubmit={enviar} noValidate>
        <h2 className="form-titulo">Faça sua Pré-Avaliação</h2>
        <p className="form-intro">
          Preencha os dados abaixo para a equipe entender o seu caso e indicar qual protocolo
          atende o seu objetivo.
        </p>

        <CampoTexto
          id="nome"
          rotulo="Nome"
          autoComplete="name"
          valor={lead.nome}
          erro={erro('nome')}
          msgErro="Escreva o seu nome."
          onChange={(v) => set('nome', v)}
        />

        <CampoTexto
          id="whatsapp"
          rotulo="WhatsApp"
          tipo="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(71) 99999-9999"
          valor={lead.whatsapp}
          erro={erro('whatsapp')}
          msgErro="Informe o WhatsApp com DDD."
          onChange={(v) => set('whatsapp', mascaraTelefone(v))}
        />

        <CampoTexto
          id="email"
          rotulo="E-mail"
          tipo="email"
          autoComplete="email"
          valor={lead.email}
          erro={erro('email')}
          msgErro="Informe um e-mail válido."
          onChange={(v) => set('email', v)}
        />

        <div className="campo-dupla">
          <CampoTexto
            id="cidade"
            rotulo="Cidade"
            autoComplete="address-level2"
            valor={lead.cidade}
            erro={erro('cidade')}
            msgErro="Informe a sua cidade."
            onChange={(v) => set('cidade', v)}
          />

          <CampoTexto
            id="profissao"
            rotulo="Profissão"
            valor={lead.profissao}
            erro={erro('profissao')}
            msgErro="Informe a sua profissão."
            onChange={(v) => set('profissao', v)}
          />
        </div>

        {GRUPOS.map((grupo) => {
          const comErro = erro(grupo.campo)
          const idErro = `erro-${grupo.campo}`
          return (
            <fieldset
              className={comErro ? 'grupo grupo--erro' : 'grupo'}
              key={grupo.campo}
              aria-invalid={comErro}
              aria-describedby={comErro ? idErro : undefined}
            >
              <legend className="grupo-titulo">
                {grupo.titulo} <em>*</em>
              </legend>
              {grupo.opcoes.map((opcao, i) => (
                <label className="opcao" key={opcao}>
                  <input
                    /* o id vai no primeiro radio: e ele que recebe o foco quando o grupo
                       e o primeiro campo em falta */
                    id={i === 0 ? grupo.campo : undefined}
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
              {comErro && (
                <span className="campo-erro" id={idErro}>
                  Escolha uma opção.
                </span>
              )}
            </fieldset>
          )
        })}

        <button
          id="enviar_pre_avaliacao"
          type="submit"
          className="botao botao--principal"
          disabled={enviando}
        >
          {enviando ? 'Enviando...' : 'Quero fazer a pré-avaliação'}
        </button>
      </form>

      <footer className="rodape">
        <p>© Dra. Camila Conceição · Pré-avaliação de consulta</p>
        <a href="/politica-de-privacidade.html">Política de Privacidade</a>
      </footer>
    </main>
  )
}
