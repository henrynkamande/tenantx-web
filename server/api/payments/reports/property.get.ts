import { connectToDatabase } from '../../../utils/database'
import Payment from '../../../models/Payment'
import Property from '../../../models/Property'
import { getLandlordFromToken } from '../../../utils/getLandlord'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Authenticate landlord
    const landlord = await getLandlordFromToken(event)
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please log in'
      })
    }
    
    // Get query parameters
    const query = getQuery(event)
    const propertyId = query.propertyId as string
    const startDate = query.startDate as string
    const endDate = query.endDate as string
    const paymentType = query.paymentType as string
    
    if (!propertyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Property ID is required'
      })
    }

    // Get property details and verify ownership
    const property = await Property.findOne({ 
      _id: propertyId,
      landlordId: landlord._id 
    }).select('name address')
    
    if (!property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found or access denied'
      })
    }

    // Build filter for payments
    let filter: any = {
      propertyId: propertyId
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      filter.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    // Add payment type filter if provided
    if (paymentType) {
      filter.paymentType = paymentType
    }

    // Get payments for the property
    const payments = await Payment.find(filter)
      .populate({
        path: 'tenantId',
        select: 'personalInfo'
      })
      .populate({
        path: 'unitId',
        select: 'unitNumber'
      })
      .sort({ paymentDate: -1 })
      .lean()

    // Calculate summary statistics
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalPayments = payments.length

    // Group by payment type
    const byPaymentType = payments.reduce((acc, payment) => {
      const type = payment.paymentType || 'Other'
      if (!acc[type]) {
        acc[type] = { count: 0, amount: 0 }
      }
      acc[type].count += 1
      acc[type].amount += payment.amount
      return acc
    }, {} as Record<string, { count: number, amount: number }>)

    // Group by status
    const byStatus = payments.reduce((acc, payment) => {
      const status = payment.status || 'Unknown'
      if (!acc[status]) {
        acc[status] = { count: 0, amount: 0 }
      }
      acc[status].count += 1
      acc[status].amount += payment.amount
      return acc
    }, {} as Record<string, { count: number, amount: number }>)

    // Group by month (for trend analysis)
    const byMonth = payments.reduce((acc, payment) => {
      const date = new Date(payment.paymentDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!acc[monthKey]) {
        acc[monthKey] = { count: 0, amount: 0 }
      }
      acc[monthKey].count += 1
      acc[monthKey].amount += payment.amount
      return acc
    }, {} as Record<string, { count: number, amount: number }>)

    return {
      success: true,
      data: {
        property: {
          id: property._id,
          name: property.name,
          address: property.address
        },
        summary: {
          totalAmount,
          totalPayments,
          averagePayment: totalPayments > 0 ? Math.round((totalAmount / totalPayments) * 100) / 100 : 0
        },
        breakdown: {
          byPaymentType,
          byStatus,
          byMonth: Object.keys(byMonth)
            .sort()
            .reduce((acc, key) => {
              acc[key] = byMonth[key]
              return acc
            }, {} as Record<string, { count: number, amount: number }>)
        },
        payments: payments.map(payment => ({
          id: payment._id,
          amount: payment.amount,
          paymentType: payment.paymentType,
          status: payment.status,
          paymentDate: payment.paymentDate,
          monthFor: payment.monthFor,
          tenant: payment.tenantId ? {
            name: `${payment.tenantId.personalInfo?.firstName || ''} ${payment.tenantId.personalInfo?.lastName || ''}`.trim(),
            id: payment.tenantId._id
          } : null,
          unit: payment.unitId ? {
            number: payment.unitId.unitNumber,
            id: payment.unitId._id
          } : null
        }))
      }
    }
  } catch (error: any) {
    console.error('Get property payment report error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
