const PHONE_REGEX = /^\+994\s(10|50|51|55|60|70|77|99)\s\d{3}-\d{2}-\d{2}$/
export const PHONE_PREFIX = '+994 '

export function formatAzerbaijanPhone(value: string): string {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('994')) {
    digits = digits.slice(3)
  }

  digits = digits.slice(0, 9)

  const part1 = digits.slice(0, 2)
  const part2 = digits.slice(2, 5)
  const part3 = digits.slice(5, 7)
  const part4 = digits.slice(7, 9)
  let formatted = '+994'

  if (part1) formatted += ` ${part1}`
  if (part2) formatted += ` ${part2}`
  if (part3) formatted += `-${part3}`
  if (part4) formatted += `-${part4}`

  return formatted
}

export function isValidAzerbaijanPhone(value: string): boolean {
  return PHONE_REGEX.test(value)
}
