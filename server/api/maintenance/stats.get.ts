import { connectToDatabase } from '../../utils/database'
import Maintenance from '../../models/Maintenance'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Calculate statistics
    const [
      openRequests,
      inProgress,
      completed,
      totalCostResult
    ] = await Promise.all([
      // Open requests
      Maintenance.countDocuments({ status: 'Open' }),
      
      // In progress
      Maintenance.countDocuments({ status: 'In Progress' }),
      
      // Completed
      Maintenance.countDocuments({ status: 'Completed' }),
      
      // Total cost (actual costs of completed requests)
      Maintenance.aggregate([
        {
          $match: {
            status: 'Completed',
            actualCost: { $exists: true, $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$actualCost' }
          }
        }
      ])
    ])

    const totalCost = totalCostResult.length > 0 ? totalCostResult[0].total : 0

    return {
      success: true,
      data: {
        openRequests,
        inProgress,
        completed,
        totalCost,
        totalRequests: openRequests + inProgress + completed
      }
    }
  } catch (error: any) {
    console.error('Get maintenance stats error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
