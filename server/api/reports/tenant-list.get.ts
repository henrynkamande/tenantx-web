export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const query = getQuery(event)
    
    // Parse query parameters
    const propertyId = query.propertyId
    const status = query.status
    const search = query.search

    // Build match conditions
    const matchConditions: any = {}
    
    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        // Get unit information
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unitId'
        }
      },
      {
        $unwind: {
          path: '$unitId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        // Get property information
        $lookup: {
          from: 'properties',
          localField: 'unitId.propertyId',
          foreignField: '_id',
          as: 'unitId.propertyId'
        }
      },
      {
        $unwind: {
          path: '$unitId.propertyId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        // Get current lease information
        $lookup: {
          from: 'leases',
          let: { tenantId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$tenantId', '$$tenantId'] },
                    { $eq: ['$status', 'active'] }
                  ]
                }
              }
            },
            { $sort: { startDate: -1 } },
            { $limit: 1 }
          ],
          as: 'currentLease'
        }
      },
      {
        $unwind: {
          path: '$currentLease',
          preserveNullAndEmptyArrays: true
        }
      }
    ]

    // Apply filters
    const filterConditions: any = {}

    if (propertyId) {
      filterConditions['unitId.propertyId._id'] = { $oid: propertyId }
    }

    if (status) {
      filterConditions.status = status
    }

    if (search) {
      filterConditions.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: search,
              options: 'i'
            }
          }
        }
      ]
    }

    if (Object.keys(filterConditions).length > 0) {
      pipeline.push({ $match: filterConditions })
    }

    // Add sorting
    pipeline.push({
      $sort: { 
        lastName: 1, 
        firstName: 1 
      }
    })

    // Add projection to clean up the data
    pipeline.push({
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        status: 1,
        emergencyContact: 1,
        createdAt: 1,
        unitId: {
          _id: 1,
          unitNumber: 1,
          rentAmount: 1,
          propertyId: {
            _id: 1,
            name: 1
          }
        },
        currentLease: {
          _id: 1,
          startDate: 1,
          endDate: 1,
          monthlyRent: 1,
          status: 1
        }
      }
    })

    // Execute the aggregation
    const tenants = await db.collection('tenants').aggregate(pipeline).toArray()

    // Get summary statistics
    const totalTenants = await db.collection('tenants').countDocuments()
    const activeTenants = await db.collection('tenants').countDocuments({ status: 'active' })
    const inactiveTenants = await db.collection('tenants').countDocuments({ status: 'inactive' })

    // Calculate average monthly rent
    const rentAggregation = await db.collection('tenants').aggregate([
      {
        $lookup: {
          from: 'leases',
          let: { tenantId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$tenantId', '$$tenantId'] },
                    { $eq: ['$status', 'active'] }
                  ]
                }
              }
            },
            { $sort: { startDate: -1 } },
            { $limit: 1 }
          ],
          as: 'currentLease'
        }
      },
      {
        $unwind: {
          path: '$currentLease',
          preserveNullAndEmptyArrays: true
        }
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
        $unwind: {
          path: '$unit',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          monthlyRent: {
            $cond: {
              if: { $gt: ['$currentLease.monthlyRent', 0] },
              then: '$currentLease.monthlyRent',
              else: '$unit.rentAmount'
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgRent: { $avg: '$monthlyRent' }
        }
      }
    ]).toArray()

    const avgMonthlyRent = rentAggregation.length > 0 ? Math.round(rentAggregation[0].avgRent || 0) : 0

    const summary = {
      totalTenants,
      activeTenants,
      inactiveTenants,
      avgMonthlyRent
    }

    return {
      success: true,
      data: {
        tenants,
        filteredCount: tenants.length,
        summary
      }
    }

  } catch (error) {
    console.error('Tenant list report error:', error)
    return {
      success: false,
      error: 'Failed to generate tenant list report'
    }
  }
})
