export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const query = getQuery(event)
    
    // Parse query parameters
    const propertyId = query.propertyId as string
    const period = query.period as string || '90'
    const status = query.status as string
    const actionRequired = query.actionRequired as string

    // Calculate date ranges
    const today = new Date()
    const periodDays = period === 'all' ? 365 * 10 : parseInt(period) // 10 years for "all"
    const endDate = new Date(today.getTime() + (periodDays * 24 * 60 * 60 * 1000))

    // Build match conditions
    const matchConditions: any = {}

    // Filter by property if specified
    if (propertyId) {
      matchConditions['unit.propertyId'] = { $eq: new ObjectId(propertyId) }
    }

    // Filter by lease status if specified
    if (status) {
      matchConditions.status = status
    }

    // Get lease expiration data
    const leases = await db.collection('leases').aggregate([
      // Join with tenants
      {
        $lookup: {
          from: 'tenants',
          localField: 'tenantId',
          foreignField: '_id',
          as: 'tenant'
        }
      },
      { $unwind: '$tenant' },
      
      // Join with units
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unit'
        }
      },
      { $unwind: '$unit' },
      
      // Join with properties
      {
        $lookup: {
          from: 'properties',
          localField: 'unit.propertyId',
          foreignField: '_id',
          as: 'property'
        }
      },
      { $unwind: '$property' },
      
      // Calculate days until expiry
      {
        $addFields: {
          daysUntilExpiry: {
            $round: {
              $divide: [
                { $subtract: ['$endDate', today] },
                86400000 // milliseconds in a day
              ]
            }
          }
        }
      },
      
      // Apply filters
      {
        $match: {
          ...matchConditions,
          // Only include leases that expire within the specified period or are already expired
          $or: [
            { endDate: { $lte: endDate } },
            { daysUntilExpiry: { $lt: 0 } } // Include expired leases
          ]
        }
      },
      
      // Add action required field based on business logic
      {
        $addFields: {
          actionRequired: {
            $switch: {
              branches: [
                {
                  case: { 
                    $and: [
                      { $lt: ['$daysUntilExpiry', 0] },
                      { $eq: ['$status', 'active'] }
                    ]
                  },
                  then: 'overdue'
                },
                {
                  case: {
                    $and: [
                      { $lte: ['$daysUntilExpiry', 30] },
                      { $gte: ['$daysUntilExpiry', 0] },
                      { $eq: ['$status', 'active'] }
                    ]
                  },
                  then: 'expiring_soon'
                },
                {
                  case: {
                    $and: [
                      { $lte: ['$daysUntilExpiry', 60] },
                      { $gt: ['$daysUntilExpiry', 30] },
                      { $eq: ['$status', 'active'] }
                    ]
                  },
                  then: 'renewal_notice'
                },
                {
                  case: { $eq: ['$status', 'renewal_pending'] },
                  then: 'follow_up'
                }
              ],
              default: null
            }
          }
        }
      },
      
      // Filter by action required if specified
      ...(actionRequired ? [{
        $match: { actionRequired: actionRequired }
      }] : []),
      
      // Project final fields
      {
        $project: {
          _id: 1,
          tenantId: '$tenant._id',
          tenantName: { $concat: ['$tenant.firstName', ' ', '$tenant.lastName'] },
          tenantEmail: '$tenant.email',
          tenantPhone: '$tenant.phone',
          unitId: '$unit._id',
          unitNumber: '$unit.unitNumber',
          propertyId: '$property._id',
          propertyName: '$property.name',
          startDate: 1,
          endDate: 1,
          monthlyRent: 1,
          status: 1,
          daysUntilExpiry: 1,
          actionRequired: 1,
          createdAt: 1
        }
      },
      
      // Sort by days until expiry (most urgent first)
      {
        $sort: { daysUntilExpiry: 1 }
      }
    ]).toArray()

    // Calculate summary statistics
    const totalLeases = leases.length
    const expiring30Days = leases.filter(lease => 
      lease.daysUntilExpiry >= 0 && lease.daysUntilExpiry <= 30
    ).length
    const expiring60Days = leases.filter(lease => 
      lease.daysUntilExpiry >= 0 && lease.daysUntilExpiry <= 60
    ).length
    const expiring90Days = leases.filter(lease => 
      lease.daysUntilExpiry >= 0 && lease.daysUntilExpiry <= 90
    ).length
    const overdue = leases.filter(lease => 
      lease.daysUntilExpiry < 0 && lease.status === 'active'
    ).length
    const renewed = leases.filter(lease => 
      lease.status === 'renewed'
    ).length

    // Calculate potential revenue impact
    const expiringRevenue = leases
      .filter(lease => lease.daysUntilExpiry >= 0 && lease.daysUntilExpiry <= 90)
      .reduce((sum, lease) => sum + (lease.monthlyRent || 0), 0)

    const overdueRevenue = leases
      .filter(lease => lease.daysUntilExpiry < 0 && lease.status === 'active')
      .reduce((sum, lease) => sum + (lease.monthlyRent || 0), 0)

    // Group leases by action required for quick insights
    const actionGroups = leases.reduce((groups, lease) => {
      const action = lease.actionRequired || 'none'
      if (!groups[action]) {
        groups[action] = []
      }
      groups[action].push(lease)
      return groups
    }, {} as Record<string, any[]>)

    return {
      success: true,
      data: {
        leases,
        summary: {
          totalLeases,
          expiring30Days,
          expiring60Days,
          expiring90Days,
          overdue,
          renewed,
          expiringRevenue: Math.round(expiringRevenue),
          overdueRevenue: Math.round(overdueRevenue)
        },
        actionGroups,
        filters: {
          propertyId,
          period,
          status,
          actionRequired
        }
      }
    }

  } catch (error) {
    console.error('Lease expiration report error:', error)
    return {
      success: false,
      error: 'Failed to generate lease expiration report'
    }
  }
})
