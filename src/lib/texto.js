export const primeiroNome = (nome) => (nome ?? '').trim().split(/\s+/)[0] ?? ''

// Sem diferenciar maiúsculas, acentos e pontuação.
export const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
