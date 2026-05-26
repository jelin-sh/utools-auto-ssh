export function generateId(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function isValidPort(port) {
  const num = Number(port)
  return Number.isInteger(num) && num >= 1 && num <= 65535
}

export function now() {
  return Date.now()
}
