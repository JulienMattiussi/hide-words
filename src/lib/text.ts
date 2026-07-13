const LETTERS = 'A-Za-z0-9àâäéèêëîïôöùûüÿçÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇ'
const UNSUPPORTED_LETTER = new RegExp(`[^${LETTERS}]`, 'g')
const UNSUPPORTED_LINE = new RegExp(`[^${LETTERS} ]`, 'g')

export function normalizeLetters(input: string): string {
  return input.normalize('NFC').replace(UNSUPPORTED_LETTER, '')
}

export function normalizeTextLines(input: string): string[] {
  return input
    .normalize('NFC')
    .split(/\r?\n/)
    .map((line) => line.replace(UNSUPPORTED_LINE, '').replace(/ +/g, ' ').trim())
}
