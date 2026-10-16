/* Logica pura da pre-avaliacao: mascara, validacao e montagem do lead.
   Fica fora do componente para poder ser testada sem navegador (src/lead.test.ts). */

export type Lead = {
  nome: string
  whatsapp: string
  email: string
  cidade: string
  profissao: string
  objetivo: string
  faixaEtaria: string
  decisao: string
  prazo: string
  origem: string
}

export const leadVazio: Lead = {
  nome: '',
  whatsapp: '',
  email: '',
  cidade: '',
  profissao: '',
  objetivo: '',
  faixaEtaria: '',
  decisao: '',
  prazo: '',
  origem: '',
}

export function soNumeros(valor: string): string {
  return (valor || '').replace(/\D/g, '')
}

/** (71) 99700-3399 — corta em 11 digitos, que e o maximo de um celular brasileiro. */
export function mascaraTelefone(valor: string): string {
  const d = soNumeros(valor).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Fixo com DDD tem 10 digitos, celular tem 11. */
export function telefoneValido(valor: string): boolean {
  const d = soNumeros(valor)
  return d.length === 10 || d.length === 11
}

export function emailValido(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((valor || '').trim())
}

/** Os cinco grupos de escolha, na mesma ordem em que aparecem na pagina. */
export const CAMPOS_ESCOLHA = ['objetivo', 'faixaEtaria', 'decisao', 'prazo', 'origem'] as const

/** Nome de cada campo com problema, na ordem visual: o primeiro e o que recebe o foco.
   Vazio = pode enviar. Todo campo do formulario e obrigatorio. */
export function validar(lead: Lead): string[] {
  const erros: string[] = []
  if (lead.nome.trim().length < 2) erros.push('nome')
  if (!telefoneValido(lead.whatsapp)) erros.push('whatsapp')
  if (!emailValido(lead.email)) erros.push('email')
  if (!lead.cidade.trim()) erros.push('cidade')
  if (!lead.profissao.trim()) erros.push('profissao')
  for (const campo of CAMPOS_ESCOLHA) {
    if (!lead[campo]) erros.push(campo)
  }
  return erros
}

/** Numero no formato que o wa.me espera: 55 + DDD + numero. */
export function telefoneE164(valor: string): string {
  const d = soNumeros(valor)
  return d.startsWith('55') ? d : '55' + d
}

type Utms = Record<string, string>

/** UTMs da URL atual; cai para as que o pixel guardou na sessao quando a URL nao tem. */
export function coletarUtms(search: string, salvas: string | null): Utms {
  const chaves = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
  const p = new URLSearchParams(search)
  const out: Utms = {}
  let doSession: Utms = {}
  try {
    doSession = salvas ? JSON.parse(salvas) : {}
  } catch {
    doSession = {}
  }
  for (const k of chaves) {
    const curta = k.replace('utm_', '')
    out[k] = p.get(k) || doSession[k] || doSession[curta] || ''
  }
  for (const k of ['fbclid', 'gclid', 'ttclid']) {
    const v = p.get(k)
    if (v) out[k] = v
  }
  return out
}

export function montarPayloadCrm(
  lead: Lead,
  utms: Utms,
  origemUrl: string,
): Record<string, string> {
  return {
    nome: lead.nome.trim(),
    telefone: telefoneE164(lead.whatsapp),
    email: lead.email.trim(),
    cidade: lead.cidade.trim(),
    profissao: lead.profissao.trim(),
    objetivo: lead.objetivo,
    faixa_etaria: lead.faixaEtaria,
    decisao: lead.decisao,
    prazo: lead.prazo,
    origem_conheceu: lead.origem,
    pagina: origemUrl,
    ...utms,
  }
}

/** Mensagem que ja chega escrita no WhatsApp da clinica. */
export function montarMensagemWhatsApp(lead: Lead): string {
  const linhas = [
    'Olá, vim pelo site e fiz minha pré-avaliação.',
    '',
    `Nome: ${lead.nome.trim()}`,
    `WhatsApp: ${mascaraTelefone(lead.whatsapp)}`,
  ]
  const opcionais: [string, string][] = [
    ['E-mail', lead.email.trim()],
    ['Cidade', lead.cidade.trim()],
    ['Profissão', lead.profissao.trim()],
    ['Objetivo', lead.objetivo],
    ['Faixa etária', lead.faixaEtaria],
    ['Decisão de investir', lead.decisao],
    ['Prazo para iniciar', lead.prazo],
    ['Como conheceu', lead.origem],
  ]
  for (const [rotulo, valor] of opcionais) {
    if (valor) linhas.push(`${rotulo}: ${valor}`)
  }
  return linhas.join('\n')
}
