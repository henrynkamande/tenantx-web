import { connectToDatabase } from '~/server/utils/database'
import { Invoice } from '~/server/models/Invoice'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get authenticated user
    const user = await getCurrentUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    // Ensure the user is a tenant
    if (user.role !== 'tenant') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied - Tenant access required'
      })
    }
    
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Base filter for tenant's invoices
    const baseMatch = { tenantId: user._id }
    
    // Aggregate invoice statistics for this tenant
    const pipeline = [
      {
        $facet: {
          outstanding: [
            {
              $match: {
                ...baseMatch,
                status: { $in: ['sent', 'overdue'] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$totalAmount' }
              }
            }
          ],
          paidThisMonth: [
            {
              $match: {
                ...baseMatch,
                status: 'paid',
                paidAt: { $gte: thisMonthStart }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$totalAmount' }
              }
            }
          ],
          overdue: [
            {
              $match: {
                ...baseMatch,
                status: 'overdue'
              }
            },
            {
              $count: 'count'
            }
          ]
        }
      }
    ]
    
    const [result] = await Invoice.aggregate(pipeline)
    
    const stats = {
      outstanding: result.outstanding[0]?.total || 0,
      paidThisMonth: result.paidThisMonth[0]?.total || 0,
      overdueCount: result.overdue[0]?.count || 0
    }
    
    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('Tenant invoice stats error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch invoice statistics'
    })
  }
})
