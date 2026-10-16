import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  coletarUtms,
  emailValido,
  leadVazio,
  mascaraTelefone,
  montarMensagemWhatsApp,
  montarPayloadCrm,
  telefoneE164,
  telefoneValido,
  validar,
} from './lead.ts'

test('mascara de telefone acompanha a digitacao', () => {
  assert.equal(mascaraTelefone('7'), '7')
  assert.equal(mascaraTelefone('71'), '71')
  assert.equal(mascaraTelefone('71997'), '(71) 997')
  assert.equal(mascaraTelefone('7199700339'), '(71) 9970-0339')
  assert.equal(mascaraTelefone('71997003399'), '(71) 99700-3399')
  assert.equal(mascaraTelefone('719970033999999'), '(71) 99700-3399', 'corta no 11o digito')
  assert.equal(mascaraTelefone('(71) 99700-3399'), '(71) 99700-3399', 'remascarar nao quebra')
})

test('telefone aceita fixo e celular, recusa o resto', () => {
  assert.equal(telefoneValido('(71) 3333-4444'), true)
  assert.equal(telefoneValido('(71) 99700-3399'), true)
  assert.equal(telefoneValido('99700339'), false)
  assert.equal(telefoneValido(''), false)
})

test('email agora e obrigatorio: vazio nao passa', () => {
  assert.equal(emailValido(''), false)
  assert.equal(emailValido('camila@clinica.com.br'), true)
  assert.equal(emailValido('camila@clinica'), false)
  assert.equal(emailValido('arroba-nenhum.com'), false)
})

const leadCompleto = {
  nome: 'Ana',
  whatsapp: '71997003399',
  email: 'ana@exemplo.com',
  cidade: 'Salvador',
  profissao: 'Advogada',
  objetivo: 'Lipo de Papada',
  faixaEtaria: '30 a 40 anos',
  decisao: 'Decido sozinha',
  prazo: 'Imediatamente',
  origem: 'Instagram',
}

test('lead completo passa', () => {
  assert.deepEqual(validar(leadCompleto), [])
})

test('todo campo e obrigatorio: o formulario vazio reclama de todos', () => {
  assert.deepEqual(validar(leadVazio), [
    'nome',
    'whatsapp',
    'email',
    'cidade',
    'profissao',
    'objetivo',
    'faixaEtaria',
    'decisao',
    'prazo',
    'origem',
  ])
})

test('cada campo faltando aparece sozinho na lista', () => {
  for (const campo of Object.keys(leadCompleto) as (keyof typeof leadCompleto)[]) {
    assert.deepEqual(validar({ ...leadCompleto, [campo]: '' }), [campo], `faltou ${campo}`)
  }
})

test('os erros saem na ordem visual, para o foco cair no primeiro', () => {
  const erros = validar({ ...leadCompleto, email: '', nome: '', prazo: '' })
  assert.deepEqual(erros, ['nome', 'email', 'prazo'])
})

test('telefone para o wa.me sai com 55 e sem duplicar', () => {
  assert.equal(telefoneE164('(71) 99700-3399'), '5571997003399')
  assert.equal(telefoneE164('5571997003399'), '5571997003399')
})

test('utms da URL vencem as da sessao, e a sessao preenche o que falta', () => {
  const utms = coletarUtms(
    '?utm_source=ig&fbclid=abc',
    JSON.stringify({ utm_source: 'google', medium: 'social', utm_campaign: 'outubro' }),
  )
  assert.equal(utms.utm_source, 'ig')
  assert.equal(utms.utm_medium, 'social', 'aceita a chave curta que o pixel grava')
  assert.equal(utms.utm_campaign, 'outubro')
  assert.equal(utms.utm_term, '')
  assert.equal(utms.fbclid, 'abc')
})

test('sessao com JSON corrompido nao derruba a coleta', () => {
  const utms = coletarUtms('?utm_source=ig', '{isso nao e json')
  assert.equal(utms.utm_source, 'ig')
  assert.equal(utms.utm_medium, '')
})

test('payload do CRM manda o telefone normalizado, que e a chave de deduplicacao', () => {
  const p = montarPayloadCrm(
    { ...leadVazio, nome: ' Ana ', whatsapp: '(71) 99700-3399', objetivo: 'Full Face' },
    { utm_source: 'ig' },
    'https://dracamilaconceicao.com.br/consultas',
  )
  assert.equal(p.telefone, '5571997003399')
  assert.equal(p.nome, 'Ana')
  assert.equal(p.objetivo, 'Full Face')
  assert.equal(p.utm_source, 'ig')
})

test('mensagem do WhatsApp omite os campos em branco', () => {
  const msg = montarMensagemWhatsApp({
    ...leadVazio,
    nome: 'Ana',
    whatsapp: '71997003399',
    objetivo: 'Full Face',
  })
  assert.match(msg, /Nome: Ana/)
  assert.match(msg, /WhatsApp: \(71\) 99700-3399/)
  assert.match(msg, /Objetivo: Full Face/)
  assert.doesNotMatch(msg, /Cidade/)
  assert.doesNotMatch(msg, /E-mail/)
})
