import { connectToDatabase } from '../../utils/database'
import Payment from '../../models/Payment'
import Tenant from '../../models/Tenant'
import Unit from '../../models/Unit'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    
    // Get current month revenue
    const monthlyRevenueResult = await Payment.aggregate([
      {
        $match: {
          monthFor: currentMonth,
          status: 'Completed',
          paymentType: 'Rent'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ])
    
    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0

    // Get total units and occupied units
    const totalUnits = await Unit.countDocuments()
    const occupiedUnits = await Unit.countDocuments({ occupancyStatus: 'Occupied' })
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

    // Get total tenants
    const totalTenants = await Tenant.countDocuments({ status: 'Active' })

    // Get overdue payments count
    const overduePayments = await Payment.countDocuments({
      status: 'Overdue'
    })

    return {
      success: true,
      data: {
        monthlyRevenue,
        occupancyRate,
        totalTenants,
        overduePayments
      }
    }
  } catch (error: any) {
    console.error('Get quick stats error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
