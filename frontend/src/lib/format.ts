const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const wholeMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const dateTime = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

export const formatMoney = (cents: number) =>
  cents % 100 === 0 ? wholeMoney.format(cents / 100) : money.format(cents / 100)

export const formatCount = (value: number) => compact.format(value)

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`
