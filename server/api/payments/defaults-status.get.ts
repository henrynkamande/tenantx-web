import { getLandlordFromToken } from '~/server/utils/getLandlord'
import Payment from '~/server/models/Payment'

export default defineEventHandler(async (event) => {
  try {
    const landlord = await getLandlordFromToken(event)
    
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Get counts of different payment statuses for this landlord
    const paymentStats = await Payment.aggregate([
      {
        $match: {
          landlordId: landlord._id,
          paymentType: 'Rent'
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalPenalty: { $sum: '$penaltyAmount' }
        }
      }
    ])

    // Get recent defaulted payments (last 30 days)
    const recentDefaulted = await Payment.find({
      landlordId: landlord._id,
      paymentType: 'Rent',
      status: 'Defaulted',
      defaultedDate: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }).select('amount penaltyAmount defaultedDate unitId tenantId')
    .populate('unitId', 'unitNumber')
    .populate('tenantId', 'firstName lastName')
    .sort({ defaultedDate: -1 })
    .limit(10)

    // Format the statistics
    const stats = {
      pending: { count: 0, totalAmount: 0, totalPenalty: 0 },
      overdue: { count: 0, totalAmount: 0, totalPenalty: 0 },
      defaulted: { count: 0, totalAmount: 0, totalPenalty: 0 },
      completed: { count: 0, totalAmount: 0, totalPenalty: 0 }
    }

    paymentStats.forEach(stat => {
      const status = stat._id.toLowerCase()
      if (stats[status]) {
        stats[status] = {
          count: stat.count,
          totalAmount: stat.totalAmount,
          totalPenalty: stat.totalPenalty || 0
        }
      }
    })

    return {
      success: true,
      data: {
        stats,
        recentDefaulted,
        automationEnabled: true,
        lastChecked: new Date().toISOString(),
        nextCheck: 'Every 4 hours during business hours (8 AM - 8 PM) and daily at 6 AM'
      }
    }
  } catch (error) {
    console.error('Error fetching defaults status:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
