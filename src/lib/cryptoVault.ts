const textEncoder = new TextEncoder()

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey('raw', textEncoder.encode(passphrase), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { name: 'PBKDF2', salt: salt as any, iterations: 120000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string) {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  return arr
}

export async function encryptString(plain: string, passphrase: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await deriveKey(passphrase, salt)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, textEncoder.encode(plain))

  const cipherArray = new Uint8Array(cipher)
  const cipherString = Array.from(cipherArray).map(b => String.fromCharCode(b)).join('')
  const base64Cipher = btoa(cipherString)

  const out = {
    s: toHex(salt),
    i: toHex(iv),
    c: base64Cipher,
  }
  return JSON.stringify(out)
}

export async function decryptString(enc: string, passphrase: string) {
  const parsed = JSON.parse(enc)
  const salt = fromHex(parsed.s)
  const iv = fromHex(parsed.i)
  const key = await deriveKey(passphrase, salt)

  const cipherString = atob(parsed.c)
  const cipherBytes = new Uint8Array(cipherString.length)
  for (let i = 0; i < cipherString.length; i++) {
    cipherBytes[i] = cipherString.charCodeAt(i)
  }

  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes)
  return new TextDecoder().decode(plain)
}

export async function encryptBackup(data: Record<string, unknown>, passphrase: string) {
  return encryptString(JSON.stringify(data), passphrase)
}

export async function decryptBackup(enc: string, passphrase: string) {
  const plain = await decryptString(enc, passphrase)
  return JSON.parse(plain)
}

