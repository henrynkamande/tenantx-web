import { connectToDatabase } from '~/server/utils/database'
import { Expense } from '~/server/models/Expense'
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
    const properties = await Property.find({ landlordId: user._id }).select('_id')
    const propertyIds = properties.map(p => p._id.toString())
    
    if (propertyIds.length === 0) {
      // No properties, no expenses
      return {
        success: true,
        data: {
          thisMonth: 0,
          lastMonth: 0,
          pendingCount: 0,
          yearToDate: 0
        }
      }
    }
    
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    const yearStart = new Date(now.getFullYear(), 0, 1)
    
    // Get expense statistics - filter by landlord's properties
    const [thisMonthResult] = await Expense.aggregate([
      {
        $match: {
          propertyId: { $in: propertyIds },
          date: { $gte: thisMonthStart },
          status: { $in: ['approved', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ])
    
    const [lastMonthResult] = await Expense.aggregate([
      {
        $match: {
          propertyId: { $in: propertyIds },
          date: { 
            $gte: lastMonthStart,
            $lte: lastMonthEnd
          },
          status: { $in: ['approved', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ])
    
    const pendingCount = await Expense.countDocuments({ 
      propertyId: { $in: propertyIds },
      status: 'pending' 
    })
    
    const [yearToDateResult] = await Expense.aggregate([
      {
        $match: {
          propertyId: { $in: propertyIds },
          date: { $gte: yearStart },
          status: { $in: ['approved', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ])
    
    const stats = {
      thisMonth: thisMonthResult?.total || 0,
      lastMonth: lastMonthResult?.total || 0,
      pendingCount: pendingCount || 0,
      yearToDate: yearToDateResult?.total || 0
    }
    
    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('Expense stats error:', error)
    return {
      success: false,
      error: 'Failed to fetch expense statistics'
    }
  }
})
