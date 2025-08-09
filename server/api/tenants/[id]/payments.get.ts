import { connectToDatabase } from '../../../utils/database'
import Payment from '../../../models/Payment'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const tenantId = getRouterParam(event, 'id')
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const skip = (page - 1) * limit
    
    console.log('Fetching payments for tenant:', tenantId)
    
    if (!tenantId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tenant ID is required'
      })
    }

    // First, let's check if any payments exist for this tenant
    const totalPayments = await Payment.countDocuments({ tenantId })
    console.log(`Total payments found for tenant ${tenantId}:`, totalPayments)
    
    // Also check all payments in the database
    const allPayments = await Payment.countDocuments({})
    console.log('Total payments in database:', allPayments)

    // Get payments for this tenant with pagination
    const [payments, total] = await Promise.all([
      Payment.find({ tenantId })
        .populate({
          path: 'unitId',
          select: 'unitNumber',
          populate: {
            path: 'propertyId',
            select: 'name'
          }
        })
        .sort({ dueDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments({ tenantId })
    ])
    
    console.log('Payments found:', payments.length)
    console.log('First payment sample:', payments[0])

    return {
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Get tenant payments error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
