const UNSUPPORTED = /[^A-Za-z0-9àâäéèêëîïôöùûüÿçÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇ]/g

export function normalizeWord(input: string): string {
  return input.normalize('NFC').replace(UNSUPPORTED, '')
}
