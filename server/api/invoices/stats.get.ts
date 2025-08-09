import { connectToDatabase } from '~/server/utils/database'
import { Invoice } from '~/server/models/Invoice'
import Property from '~/server/models/Property'
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
    
    // Get all properties owned by this landlord
    const landlordProperties = await Property.find({ landlordId: user._id }).select('_id')
    const propertyIds = landlordProperties.map(p => p._id.toString())
    
    if (propertyIds.length === 0) {
      // No properties, return zero stats
      return {
        success: true,
        data: {
          outstanding: 0,
          paidThisMonth: 0,
          overdueCount: 0,
          totalRevenue: 0
        }
      }
    }
    
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Base filter for landlord's properties
    const baseMatch = { propertyId: { $in: propertyIds } }
    
    // Aggregate invoice statistics - filtered by landlord's properties
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
          ],
          totalRevenue: [
            {
              $match: {
                ...baseMatch,
                status: 'paid'
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$totalAmount' }
              }
            }
          ]
        }
      }
    ]
    
    const [result] = await Invoice.aggregate(pipeline)
    
    const stats = {
      outstanding: result.outstanding[0]?.total || 0,
      paidThisMonth: result.paidThisMonth[0]?.total || 0,
      overdueCount: result.overdue[0]?.count || 0,
      totalRevenue: result.totalRevenue[0]?.total || 0
    }
    
    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('Invoice stats error:', error)
    return {
      success: false,
      error: 'Failed to fetch invoice statistics'
    }
  }
})
