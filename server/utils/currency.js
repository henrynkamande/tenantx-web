// Server-side currency formatting utilities

// Currency symbol mapping
const currencySymbols = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CHF: 'CHF', CAD: 'C$', AUD: 'A$', CNY: '¥',
  BRL: 'R$', MXN: '$', ARS: '$', CLP: '$', COP: '$', PEN: 'S/', UYU: '$U',
  NOK: 'kr', SEK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei',
  BGN: 'лв', HRK: 'kn', RUB: '₽', TRY: '₺', UAH: '₴',
  INR: '₹', SGD: 'S$', HKD: 'HK$', NZD: 'NZ$', KRW: '₩', THB: '฿', MYR: 'RM',
  IDR: 'Rp', PHP: '₱', VND: '₫', TWD: 'NT$', PKR: '₨', BDT: '৳', LKR: '₨',
  SAR: '﷼', AED: 'د.إ', QAR: '﷼', KWD: 'د.ك', BHD: 'د.ب', OMR: '﷼',
  ILS: '₪', EGP: '£', ZAR: 'R', NGN: '₦', KES: 'KSh', GHS: '₵', MAD: 'د.م.', TND: 'د.ت'
}

// Get currency symbol
export function getCurrencySymbol(currency = 'USD') {
  return currencySymbols[currency] || currency
}

// Format currency amount with symbol
export function formatCurrencyAmount(amount, currency = 'USD') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${getCurrencySymbol(currency)}0`
  }
  
  const symbol = getCurrencySymbol(currency)
  const formatted = new Intl.NumberFormat('en-US').format(amount)
  
  return `${symbol}${formatted}`
}
