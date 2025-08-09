export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const query = getQuery(event)
    
    // Parse query parameters
    const propertyId = query.propertyId
    const status = query.status
    const priority = query.priority
    const dateRange = query.dateRange || 'current_month'
    
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

    if (priority) {
      matchConditions.priority = priority
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

    // Add calculated fields
    pipeline.push({
      $addFields: {
        // Generate work order number if not exists
        workOrderNumber: {
          $cond: {
            if: { $ne: ['$workOrderNumber', null] },
            then: '$workOrderNumber',
            else: {
              $concat: [
                'WO-',
                { $dateToString: { format: '%Y%m', date: '$createdAt' } },
                '-',
                { $substr: [{ $toString: '$_id' }, -6, 6] }
              ]
            }
          }
        },
        // Calculate cost (actual if available, otherwise estimated)
        displayCost: {
          $cond: {
            if: { $gt: ['$actualCost', 0] },
            then: '$actualCost',
            else: { $ifNull: ['$estimatedCost', 0] }
          }
        }
      }
    })

    // Sort by creation date (most recent first)
    pipeline.push({
      $sort: { createdAt: -1 }
    })

    // Execute the main query
    const workOrders = await db.collection('maintenance_requests')
      .aggregate(pipeline)
      .toArray()

    // Calculate summary statistics
    const summaryStats = await db.collection('maintenance_requests')
      .aggregate([
        ...pipeline.slice(0, -1), // Remove the sort stage for summary
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
              }
            },
            inProgressOrders: {
              $sum: {
                $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0]
              }
            },
            completedOrders: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            },
            totalCost: { $sum: '$displayCost' }
          }
        }
      ])
      .toArray()

    const summary = summaryStats.length > 0 ? {
      totalOrders: summaryStats[0].totalOrders,
      pendingOrders: summaryStats[0].pendingOrders,
      inProgressOrders: summaryStats[0].inProgressOrders,
      completedOrders: summaryStats[0].completedOrders,
      totalCost: Math.round(summaryStats[0].totalCost || 0)
    } : {
      totalOrders: 0,
      pendingOrders: 0,
      inProgressOrders: 0,
      completedOrders: 0,
      totalCost: 0
    }

    return {
      success: true,
      data: {
        workOrders,
        filteredCount: workOrders.length,
        summary,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    }

  } catch (error) {
    console.error('Work orders report error:', error)
    return {
      success: false,
      error: 'Failed to generate work orders report'
    }
  }
})
