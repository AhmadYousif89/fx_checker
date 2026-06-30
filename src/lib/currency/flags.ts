import { FLAG_CODE_SET } from './lists'

export function getFlagUrl(isoCode: string) {
  const code = isoCode.slice(0, 2).toLowerCase()
  if (!FLAG_CODE_SET.has(code)) return ''
  return `/assets/images/flags/${code}.webp`
}
