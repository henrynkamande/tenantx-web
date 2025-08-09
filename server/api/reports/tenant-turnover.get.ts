export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const query = getQuery(event)
    
    // Parse query parameters
    const propertyId = query.propertyId
    const dateRange = query.dateRange || 'current_month'
    const activityType = query.activityType
    
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

    // Build pipeline for tenant activities
    const pipeline: any[] = []

    // Get move-ins (lease start dates)
    const moveIns = await db.collection('leases').aggregate([
      {
        $match: {
          startDate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
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
          localField: 'unitId',
          foreignField: '_id',
          as: 'unit'
        }
      },
      {
        $unwind: '$unit'
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'unit.propertyId',
          foreignField: '_id',
          as: 'unit.propertyId'
        }
      },
      {
        $unwind: '$unit.propertyId'
      },
      ...(propertyId ? [{
        $match: {
          'unit.propertyId._id': new ObjectId(propertyId)
        }
      }] : []),
      {
        $addFields: {
          type: 'move_in',
          date: '$startDate',
          monthlyRent: '$monthlyRent',
          tenancyDuration: null,
          reason: 'New lease'
        }
      },
      {
        $project: {
          _id: 1,
          type: 1,
          date: 1,
          monthlyRent: 1,
          tenancyDuration: 1,
          reason: 1,
          tenant: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1
          },
          unit: {
            _id: 1,
            unitNumber: 1,
            propertyId: {
              _id: 1,
              name: 1
            }
          }
        }
      }
    ]).toArray()

    // Get move-outs (lease end dates)
    const moveOuts = await db.collection('leases').aggregate([
      {
        $match: {
          endDate: {
            $gte: startDate,
            $lte: endDate
          },
          status: 'terminated'
        }
      },
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
          localField: 'unitId',
          foreignField: '_id',
          as: 'unit'
        }
      },
      {
        $unwind: '$unit'
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'unit.propertyId',
          foreignField: '_id',
          as: 'unit.propertyId'
        }
      },
      {
        $unwind: '$unit.propertyId'
      },
      ...(propertyId ? [{
        $match: {
          'unit.propertyId._id': new ObjectId(propertyId)
        }
      }] : []),
      {
        $addFields: {
          type: 'move_out',
          date: '$endDate',
          monthlyRent: '$monthlyRent',
          tenancyDuration: {
            $concat: [
              {
                $toString: {
                  $floor: {
                    $divide: [
                      { $subtract: ['$endDate', '$startDate'] },
                      86400000 // milliseconds in a day
                    ]
                  }
                }
              },
              ' days'
            ]
          },
          reason: '$terminationReason'
        }
      },
      {
        $project: {
          _id: 1,
          type: 1,
          date: 1,
          monthlyRent: 1,
          tenancyDuration: 1,
          reason: 1,
          tenant: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1
          },
          unit: {
            _id: 1,
            unitNumber: 1,
            propertyId: {
              _id: 1,
              name: 1
            }
          }
        }
      }
    ]).toArray()

    // Combine activities
    let activities = [...moveIns, ...moveOuts]

    // Filter by activity type if specified
    if (activityType) {
      activities = activities.filter(activity => activity.type === activityType)
    }

    // Sort by date (most recent first)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Calculate summary statistics
    const totalMoveIns = moveIns.length
    const totalMoveOuts = moveOuts.length
    
    // Get total units for turnover rate calculation
    const totalUnitsQuery = propertyId ? 
      { propertyId: new ObjectId(propertyId) } : {}
    const totalUnits = await db.collection('units').countDocuments(totalUnitsQuery)
    
    const turnoverRate = totalUnits > 0 ? 
      Math.round((totalMoveOuts / totalUnits) * 100) : 0

    // Calculate average tenancy duration
    const completedLeases = await db.collection('leases').aggregate([
      {
        $match: {
          status: 'terminated',
          endDate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      ...(propertyId ? [{
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unit'
        }
      }, {
        $unwind: '$unit'
      }, {
        $match: {
          'unit.propertyId': new ObjectId(propertyId)
        }
      }] : []),
      {
        $addFields: {
          tenancyDays: {
            $floor: {
              $divide: [
                { $subtract: ['$endDate', '$startDate'] },
                86400000
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTenancyDays: { $avg: '$tenancyDays' }
        }
      }
    ]).toArray()

    const avgTenancyDays = completedLeases.length > 0 ? 
      Math.round(completedLeases[0].avgTenancyDays || 0) : 0

    const summary = {
      moveIns: totalMoveIns,
      moveOuts: totalMoveOuts,
      turnoverRate: turnoverRate,
      avgTenancyDays: avgTenancyDays
    }

    return {
      success: true,
      data: {
        activities,
        filteredCount: activities.length,
        summary,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    }

  } catch (error) {
    console.error('Tenant turnover report error:', error)
    return {
      success: false,
      error: 'Failed to generate tenant turnover report'
    }
  }
})
