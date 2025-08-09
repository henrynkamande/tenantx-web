export default defineNuxtPlugin(() => {
  const { formatCurrencyWithCode, formatCurrency, getUserCurrency } = useCurrency()
  
  return {
    provide: {
      // Format currency with short code (e.g. "1,234.56 KES")
      formatMoney: (amount: number | string | null | undefined) => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
        return formatCurrencyWithCode(numericAmount)
      },
      
      // Format currency with symbol (e.g. "KSh 1,234.56")
      formatCurrency: (amount: number | string | null | undefined) => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
        return formatCurrency(numericAmount)
      },
      
      // Get user's current currency code
      getCurrency: () => getUserCurrency()
    }
  }
})
