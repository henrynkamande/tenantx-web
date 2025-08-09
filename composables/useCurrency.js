// Currency formatting composable
export const useCurrency = () => {
  // Default currency - load from user preferences or fallback to USD
  const defaultCurrency = ref('USD')

  // Currency symbol mapping
  const currencySymbols = {
    // Major Currencies
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CHF: 'CHF',
    CAD: 'C$',
    AUD: 'A$',
    CNY: '¥',
    
    // Americas
    BRL: 'R$',
    MXN: '$',
    ARS: '$',
    CLP: '$',
    COP: '$',
    PEN: 'S/',
    UYU: '$U',
    
    // Europe
    NOK: 'kr',
    SEK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    RON: 'lei',
    BGN: 'лв',
    HRK: 'kn',
    RUB: '₽',
    TRY: '₺',
    UAH: '₴',
    
    // Asia Pacific
    INR: '₹',
    SGD: 'S$',
    HKD: 'HK$',
    NZD: 'NZ$',
    KRW: '₩',
    THB: '฿',
    MYR: 'RM',
    IDR: 'Rp',
    PHP: '₱',
    VND: '₫',
    TWD: 'NT$',
    PKR: '₨',
    BDT: '৳',
    LKR: '₨',
    
    // Middle East & Africa
    SAR: '﷼',
    AED: 'د.إ',
    QAR: '﷼',
    KWD: 'د.ك',
    BHD: 'د.ب',
    OMR: '﷼',
    ILS: '₪',
    EGP: '£',
    ZAR: 'R',
    NGN: '₦',
    KES: 'KSh',
    GHS: '₵',
    MAD: 'د.م.',
    TND: 'د.ت'
  }

  // Currency formatting options
  const currencyOptions = {
    // Currencies with no decimal places
    noDecimals: ['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'HUF'],
    
    // Currencies with 3 decimal places
    threeDecimals: ['BHD', 'KWD', 'OMR'],
    
    // Right-to-left currencies
    rtlCurrencies: ['SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR']
  }

  // Get user's preferred currency
  const getUserCurrency = () => {
    const { user } = useAuth()
    console.log('getUserCurrency - user:', user.value)
    console.log('getUserCurrency - preferredCurrency:', user.value?.preferredCurrency)
    if (user.value?.preferredCurrency) {
      console.log('Returning user preferred currency:', user.value.preferredCurrency)
      return user.value.preferredCurrency
    }
    console.log('Returning default currency:', defaultCurrency.value)
    return defaultCurrency.value
  }

  // Get currency symbol
  const getCurrencySymbol = (currency = getUserCurrency()) => {
    return currencySymbols[currency] || currency
  }

  // Get decimal places for currency
  const getDecimalPlaces = (currency = defaultCurrency.value) => {
    if (currencyOptions.noDecimals.includes(currency)) return 0
    if (currencyOptions.threeDecimals.includes(currency)) return 3
    return 2
  }

  // Format currency amount
  const formatCurrency = (amount, currency = getUserCurrency(), options = {}) => {
    const {
      showSymbol = true,
      showCode = false,
      locale = 'en-US',
      minimumFractionDigits = null,
      maximumFractionDigits = null
    } = options

    if (amount === null || amount === undefined || isNaN(amount)) {
      return showSymbol ? `${getCurrencySymbol(currency)}0` : '0'
    }

    const decimalPlaces = getDecimalPlaces(currency)
    const minDecimals = minimumFractionDigits !== null ? minimumFractionDigits : decimalPlaces
    const maxDecimals = maximumFractionDigits !== null ? maximumFractionDigits : decimalPlaces

    try {
      // Use Intl.NumberFormat for proper localization
      const formatter = new Intl.NumberFormat(locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: currency,
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals
      })

      if (showSymbol) {
        return formatter.format(amount)
      } else {
        const formatted = formatter.format(amount)
        return showCode ? `${formatted} ${currency}` : formatted
      }
    } catch (error) {
      // Fallback formatting if Intl fails
      console.warn(`Currency formatting failed for ${currency}:`, error)
      const symbol = showSymbol ? getCurrencySymbol(currency) : ''
      const formatted = Number(amount).toFixed(decimalPlaces)
      const code = showCode ? ` ${currency}` : ''
      
      // Handle RTL currencies
      if (currencyOptions.rtlCurrencies.includes(currency)) {
        return `${formatted}${code} ${symbol}`
      }
      
      return `${symbol}${formatted}${code}`
    }
  }

  // Format currency with short code (e.g. "1,234.56 KES")
  const formatCurrencyWithCode = (amount, currency = getUserCurrency(), options = {}) => {
    const {
      locale = 'en-US',
      minimumFractionDigits = null,
      maximumFractionDigits = null
    } = options

    if (amount === null || amount === undefined || isNaN(amount)) {
      return `0 ${currency}`
    }

    const decimalPlaces = getDecimalPlaces(currency)
    const minDecimals = minimumFractionDigits !== null ? minimumFractionDigits : decimalPlaces
    const maxDecimals = maximumFractionDigits !== null ? maximumFractionDigits : decimalPlaces

    try {
      // Use Intl.NumberFormat for proper number formatting
      const formatter = new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals
      })

      const formatted = formatter.format(amount)
      return `${formatted} ${currency}`
    } catch (error) {
      // Fallback formatting if Intl fails
      console.warn(`Currency formatting failed for ${currency}:`, error)
      const formatted = Number(amount).toFixed(decimalPlaces)
      return `${formatted} ${currency}`
    }
  }

  // Format currency with compact notation (K, M, B)
  const formatCurrencyCompact = (amount, currency = getUserCurrency(), options = {}) => {
    const { locale = 'en-US' } = options

    if (amount === null || amount === undefined || isNaN(amount)) {
      return formatCurrency(0, currency, options)
    }

    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        notation: 'compact',
        maximumFractionDigits: 1
      })

      return formatter.format(amount)
    } catch (error) {
      // Fallback to regular formatting
      return formatCurrency(amount, currency, options)
    }
  }

  // Parse currency string to number
  const parseCurrency = (currencyString, currency = defaultCurrency.value) => {
    if (!currencyString) return 0
    
    // Remove currency symbols and non-numeric characters except decimal points and minus
    const cleaned = currencyString
      .replace(/[^\d.-]/g, '')
      .replace(/^-/, 'MINUS')
      .replace(/-/g, '')
      .replace(/MINUS/, '-')
    
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  // Set user's preferred currency
  const setCurrency = (currency) => {
    defaultCurrency.value = currency
    // Store in localStorage for persistence
    if (process.client) {
      localStorage.setItem('preferredCurrency', currency)
    }
  }

  // Load currency from localStorage
  const loadCurrency = () => {
    if (process.client) {
      const stored = localStorage.getItem('preferredCurrency')
      if (stored && currencySymbols[stored]) {
        defaultCurrency.value = stored
      }
    }
  }

  // Get list of all supported currencies
  const getSupportedCurrencies = () => {
    return Object.keys(currencySymbols).map(code => ({
      code,
      symbol: currencySymbols[code],
      decimals: getDecimalPlaces(code)
    }))
  }

  // Initialize currency from storage
  if (process.client) {
    loadCurrency()
  }

  // Computed property for current user's currency symbol
  const currencySymbol = computed(() => {
    const { user } = useAuth()
    const userCurrency = user.value?.preferredCurrency
    console.log('currencySymbol computed - userCurrency:', userCurrency)
    
    if (userCurrency && currencySymbols[userCurrency]) {
      console.log('Using user currency symbol:', currencySymbols[userCurrency])
      return currencySymbols[userCurrency]
    }
    
    console.log('Using default currency symbol:', currencySymbols[defaultCurrency.value])
    return currencySymbols[defaultCurrency.value] || '$'
  })

  return {
    defaultCurrency: readonly(defaultCurrency),
    currencySymbol: readonly(currencySymbol),
    getUserCurrency,
    getCurrencySymbol,
    getDecimalPlaces,
    formatCurrency,
    formatCurrencyWithCode,
    formatCurrencyCompact,
    parseCurrency,
    setCurrency,
    loadCurrency,
    getSupportedCurrencies
  }
}
