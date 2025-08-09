export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const query = getQuery(event)
    
    // Parse query parameters
    const propertyId = query.propertyId
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
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        endDate = new Date(now.getFullYear() - 1, 11, 31)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Build property match condition
    const { ObjectId } = await import('mongodb')
    const propertyMatch = propertyId ? { _id: new ObjectId(propertyId) } : {}

    // Get property performance data
    const propertyPerformance = await db.collection('properties').aggregate([
      {
        $match: propertyMatch
      },
      {
        // Get all units for each property
        $lookup: {
          from: 'units',
          localField: '_id',
          foreignField: 'propertyId',
          as: 'units'
        }
      },
      {
        // Get payments for the date range
        $lookup: {
          from: 'payments',
          let: { propertyId: '$_id' },
          pipeline: [
            {
              $lookup: {
                from: 'tenants',
                localField: 'tenantId',               
                foreignField: '_id',
                as: 'tenant'
              }
            },
            {
              $unwind: '$tenant'
            },
            {
              $lookup: {
                from: 'units',
                localField: 'tenant.unitId',
                foreignField: '_id',
                as: 'unit'
              }
            },
            {
              $unwind: '$unit'
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit.propertyId', '$$propertyId'] },
                    { $gte: ['$paymentDate', startDate] },
                    { $lte: ['$paymentDate', endDate] },
                    { $eq: ['$status', 'completed'] }
                  ]
                }
              }
            }
          ],
          as: 'payments'
        }
      },
      {
        // Get maintenance requests for the date range
        $lookup: {
          from: 'maintenance_requests',
          let: { propertyId: '$_id' },
          pipeline: [
            {
              $lookup: {
                from: 'units',
                localField: 'unitId',
                foreignField: '_id',
                as: 'unit'
              }
            },
            {
              $unwind: '$unit'
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unit.propertyId', '$$propertyId'] },
                    { $gte: ['$createdAt', startDate] },
                    { $lte: ['$createdAt', endDate] },
                    { $in: ['$status', ['completed', 'in_progress']] }
                  ]
                }
              }
            }
          ],
          as: 'maintenanceRequests'
        }
      },
      {
        $addFields: {
          // Calculate basic unit statistics
          totalUnits: { $size: '$units' },
          occupiedUnits: {
            $size: {
              $filter: {
                input: '$units',
                cond: { $eq: ['$$this.status', 'occupied'] }
              }
            }
          },
          vacantUnits: {
            $size: {
              $filter: {
                input: '$units',
                cond: { $eq: ['$$this.status', 'vacant'] }
              }
            }
          },
          // Calculate revenue
          totalRevenue: { $sum: '$payments.amount' },
          // Calculate maintenance costs
          maintenanceCosts: { $sum: '$maintenanceRequests.estimatedCost' },
          // Calculate average rent
          avgRent: { $avg: '$units.rentAmount' }
        }
      },
      {
        $addFields: {
          // Calculate occupancy rate
          occupancyRate: {
            $cond: {
              if: { $gt: ['$totalUnits', 0] },
              then: {
                $round: [
                  { $multiply: [{ $divide: ['$occupiedUnits', '$totalUnits'] }, 100] },
                  1
                ]
              },
              else: 0
            }
          },
          // Calculate net income
          netIncome: { $subtract: ['$totalRevenue', '$maintenanceCosts'] },
          // Calculate ROI (simplified as net income / total potential rent * 100)
          roi: {
            $cond: {
              if: { $gt: [{ $multiply: ['$totalUnits', '$avgRent'] }, 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ['$totalRevenue', '$maintenanceCosts'] },
                          { $multiply: ['$totalUnits', '$avgRent'] }
                        ]
                      },
                      100
                    ]
                  },
                  1
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          totalUnits: 1,
          occupiedUnits: 1,
          vacantUnits: 1,
          occupancyRate: 1,
          totalRevenue: { $round: ['$totalRevenue', 0] },
          avgRent: { $round: ['$avgRent', 0] },
          maintenanceCosts: { $round: ['$maintenanceCosts', 0] },
          netIncome: { $round: ['$netIncome', 0] },
          roi: 1
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]).toArray()

    // Calculate summary statistics
    const summary = {
      totalRevenue: propertyPerformance.reduce((sum, prop) => sum + (prop.totalRevenue || 0), 0),
      avgOccupancy: propertyPerformance.length > 0 ? 
        Math.round(propertyPerformance.reduce((sum, prop) => sum + prop.occupancyRate, 0) / propertyPerformance.length) : 0,
      totalMaintenance: propertyPerformance.reduce((sum, prop) => sum + (prop.maintenanceCosts || 0), 0),
      avgROI: propertyPerformance.length > 0 ?
        Math.round(propertyPerformance.reduce((sum, prop) => sum + prop.roi, 0) / propertyPerformance.length * 10) / 10 : 0
    }

    return {
      success: true,
      data: {
        properties: propertyPerformance,
        summary,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    }

  } catch (error) {
    console.error('Property performance report error:', error)
    return {
      success: false,
      error: 'Failed to generate property performance report'
    }
  }
})
