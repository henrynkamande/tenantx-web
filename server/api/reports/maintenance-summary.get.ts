export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const query = getQuery(event)
    
    // Parse query parameters
    const propertyId = query.propertyId
    const dateRange = query.dateRange || 'current_month'
    const status = query.status
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    let endDate = new Date(now)
    
    switch (dateRange) {
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'last_3_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case 'last_6_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        break
      case 'current_year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        endDate = new Date(now.getFullYear() - 1, 11, 31)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const { ObjectId } = await import('mongodb')

    // Build match conditions
    const matchConditions: any = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }

    if (status) {
      matchConditions.status = status
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $match: matchConditions
      },
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unitId'
        }
      },
      {
        $unwind: '$unitId'
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'unitId.propertyId',
          foreignField: '_id',
          as: 'unitId.propertyId'
        }
      },
      {
        $unwind: '$unitId.propertyId'
      }
    ]

    // Add property filter if specified
    if (propertyId) {
      pipeline.push({
        $match: {
          'unitId.propertyId._id': new ObjectId(propertyId)
        }
      })
    }

    // Add fields for calculations
    pipeline.push({
      $addFields: {
        resolutionDays: {
          $cond: {
            if: { $eq: ['$status', 'completed'] },
            then: {
              $floor: {
                $divide: [
                  { $subtract: ['$completedAt', '$createdAt'] },
                  86400000 // milliseconds in a day
                ]
              }
            },
            else: null
          }
        },
        cost: {
          $cond: {
            if: { $gt: ['$actualCost', 0] },
            then: '$actualCost',
            else: '$estimatedCost'
          }
        }
      }
    })

    // Get maintenance requests
    const maintenanceRequests = await db.collection('maintenance_requests')
      .aggregate([
        ...pipeline,
        {
          $sort: { createdAt: -1 }
        },
        {
          $limit: 50 // Limit to recent 50 requests
        }
      ])
      .toArray()

    // Get category breakdown
    const categoryBreakdown = await db.collection('maintenance_requests')
      .aggregate([
        ...pipeline,
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalCost: { $sum: '$cost' },
            avgCost: { $avg: '$cost' },
            avgDays: {
              $avg: {
                $cond: {
                  if: { $ne: ['$resolutionDays', null] },
                  then: '$resolutionDays',
                  else: null
                }
              }
            }
          }
        },
        {
          $project: {
            category: '$_id',
            count: 1,
            totalCost: { $round: ['$totalCost', 0] },
            avgCost: { $round: ['$avgCost', 0] },
            avgDays: { $round: ['$avgDays', 0] }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
      .toArray()

    // Get property breakdown
    const propertyBreakdown = await db.collection('maintenance_requests')
      .aggregate([
        ...pipeline,
        {
          $group: {
            _id: '$unitId.propertyId._id',
            propertyName: { $first: '$unitId.propertyId.name' },
            totalRequests: { $sum: 1 },
            totalCost: { $sum: '$cost' },
            avgCost: { $avg: '$cost' },
            completedRequests: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            },
            avgResolutionDays: {
              $avg: {
                $cond: {
                  if: { $ne: ['$resolutionDays', null] },
                  then: '$resolutionDays',
                  else: null
                }
              }
            }
          }
        },
        {
          $addFields: {
            completionRate: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$completedRequests', '$totalRequests'] },
                    100
                  ]
                },
                0
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            propertyName: 1,
            totalRequests: 1,
            totalCost: { $round: ['$totalCost', 0] },
            avgCost: { $round: ['$avgCost', 0] },
            completionRate: 1,
            avgResolutionDays: { $round: ['$avgResolutionDays', 0] }
          }
        },
        {
          $sort: { totalRequests: -1 }
        }
      ])
      .toArray()

    // Calculate summary statistics
    const summaryStats = await db.collection('maintenance_requests')
      .aggregate([
        ...pipeline,
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalCost: { $sum: '$cost' },
            completedRequests: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            },
            avgResolutionDays: {
              $avg: {
                $cond: {
                  if: { $ne: ['$resolutionDays', null] },
                  then: '$resolutionDays',
                  else: null
                }
              }
            }
          }
        },
        {
          $project: {
            totalRequests: 1,
            totalCost: { $round: ['$totalCost', 0] },
            completionRate: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$completedRequests', '$totalRequests'] },
                    100
                  ]
                },
                0
              ]
            },
            avgResolutionDays: { $round: ['$avgResolutionDays', 0] }
          }
        }
      ])
      .toArray()

    const summary = summaryStats.length > 0 ? summaryStats[0] : {
      totalRequests: 0,
      totalCost: 0,
      completionRate: 0,
      avgResolutionDays: 0
    }

    return {
      success: true,
      data: {
        maintenanceRequests,
        categoryBreakdown,
        propertyBreakdown,
        filteredCount: maintenanceRequests.length,
        summary,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    }

  } catch (error) {
    console.error('Maintenance summary report error:', error)
    return {
      success: false,
      error: 'Failed to generate maintenance summary report'
    }
  }
})
