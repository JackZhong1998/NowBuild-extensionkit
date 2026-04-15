export function requireEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (!value || String(value).trim() === '') {
    throw new Error(
      `Missing ${String(name)}. Copy .env.example to .env and fill values.`,
    )
  }
  return String(value)
}

export function optionalEnv(name: keyof ImportMetaEnv): string | undefined {
  const value = import.meta.env[name]
  if (!value || String(value).trim() === '') return undefined
  return String(value)
}
