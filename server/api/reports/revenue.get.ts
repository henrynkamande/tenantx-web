import { connectToDatabase } from '../../utils/database'
import Payment from '../../models/Payment'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const query = getQuery(event)
    const startDate = query.startDate as string
    const endDate = query.endDate as string
    const propertyId = query.propertyId as string
    const paymentType = query.paymentType as string
    
    // Build match criteria
    let matchCriteria: any = {
      status: 'Completed'
    }
    
    // Date range filter
    if (startDate || endDate) {
      matchCriteria.paymentDate = {}
      if (startDate) matchCriteria.paymentDate.$gte = new Date(startDate)
      if (endDate) matchCriteria.paymentDate.$lte = new Date(endDate)
    }
    
    // Property filter
    if (propertyId) {
      matchCriteria['unitId.propertyId'] = propertyId
    }
    
    // Payment type filter
    if (paymentType) {
      matchCriteria.paymentType = paymentType
    }
    
    // Get detailed payment data
    const payments = await Payment.find(matchCriteria)
      .populate([
        { 
          path: 'tenantId', 
          select: 'personalInfo' 
        },
        { 
          path: 'unitId', 
          select: 'unitNumber propertyId',
          populate: {
            path: 'propertyId',
            select: 'name'
          }
        }
      ])
      .sort({ paymentDate: -1 })
      .lean()
    
    // Calculate summary statistics
    const summary = {
      totalRevenue: 0,
      rentRevenue: 0,
      lateFees: 0,
      totalPayments: payments.length
    }
    
    payments.forEach(payment => {
      summary.totalRevenue += payment.amount
      if (payment.paymentType === 'Rent') {
        summary.rentRevenue += payment.amount
      }
      if (payment.paymentType === 'Late Fee') {
        summary.lateFees += payment.amount
      }
    })
    
    // Generate monthly breakdown
    const monthlyMap = new Map()
    
    payments.forEach(payment => {
      const date = new Date(payment.paymentDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthLabel,
          revenue: 0
        })
      }
      
      monthlyMap.get(monthKey).revenue += payment.amount
    })
    
    // Convert to array and sort by date
    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, data]) => data)
      .slice(-12) // Last 12 months
    
    return {
      success: true,
      data: {
        payments,
        summary,
        monthlyBreakdown
      }
    }
  } catch (error: any) {
    console.error('Get revenue report error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
