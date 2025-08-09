export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    
    // Get current date
    const now = new Date()
    
    // Find all vacant units with property information
    const vacantUnits = await db.collection('units').aggregate([
      {
        $match: {
          status: 'vacant'
        }
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'propertyId',
          foreignField: '_id',
          as: 'propertyId'
        }
      },
      {
        $unwind: '$propertyId'
      },
      {
        $lookup: {
          from: 'leases',
          let: { unitId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$unitId', '$$unitId'] },
                    { $eq: ['$status', 'terminated'] }
                  ]
                }
              }
            },
            { $sort: { endDate: -1 } },
            { $limit: 1 }
          ],
          as: 'lastLease'
        }
      },
      {
        $addFields: {
          // Calculate vacant since date (last lease end date or property created date)
          vacantSince: {
            $cond: {
              if: { $gt: [{ $size: '$lastLease' }, 0] },
              then: { $arrayElemAt: ['$lastLease.endDate', 0] },
              else: '$createdAt'
            }
          }
        }
      },
      {
        $addFields: {
          // Calculate days vacant
          vacantDays: {
            $floor: {
              $divide: [
                { $subtract: [now, '$vacantSince'] },
                86400000 // milliseconds in a day
              ]
            }
          },
          // Calculate lost revenue (rent amount * days vacant / 30)
          lostRevenue: {
            $multiply: [
              '$rentAmount',
              {
                $divide: [
                  {
                    $floor: {
                      $divide: [
                        { $subtract: [now, '$vacantSince'] },
                        86400000
                      ]
                    }
                  },
                  30
                ]
              }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          unitNumber: 1,
          bedrooms: 1,
          bathrooms: 1,
          squareFootage: 1,
          rentAmount: 1,
          propertyId: {
            _id: 1,
            name: 1
          },
          vacantSince: 1,
          vacantDays: 1,
          lostRevenue: 1
        }
      },
      {
        $sort: { vacantDays: -1 }
      }
    ]).toArray()

    // Get total units count
    const totalUnits = await db.collection('units').countDocuments()
    
    // Calculate summary statistics
    const vacantUnitsCount = vacantUnits.length
    const vacancyRate = totalUnits > 0 ? ((vacantUnitsCount / totalUnits) * 100).toFixed(1) : 0
    const totalLostRevenue = vacantUnits.reduce((sum, unit) => sum + (unit.lostRevenue || 0), 0)
    const avgVacancyDays = vacantUnitsCount > 0 ? 
      Math.round(vacantUnits.reduce((sum, unit) => sum + unit.vacantDays, 0) / vacantUnitsCount) : 0

    // Get property vacancy breakdown
    const propertyVacancy = await db.collection('properties').aggregate([
      {
        $lookup: {
          from: 'units',
          localField: '_id',
          foreignField: 'propertyId',
          as: 'units'
        }
      },
      {
        $addFields: {
          totalUnits: { $size: '$units' },
          vacantUnits: {
            $size: {
              $filter: {
                input: '$units',
                cond: { $eq: ['$$this.status', 'vacant'] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          vacancyRate: {
            $cond: {
              if: { $gt: ['$totalUnits', 0] },
              then: {
                $round: [
                  { $multiply: [{ $divide: ['$vacantUnits', '$totalUnits'] }, 100] },
                  1
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $lookup: {
          from: 'units',
          let: { propertyId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$propertyId', '$$propertyId'] },
                    { $eq: ['$status', 'vacant'] }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'leases',
                let: { unitId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$unitId', '$$unitId'] },
                          { $eq: ['$status', 'terminated'] }
                        ]
                      }
                    }
                  },
                  { $sort: { endDate: -1 } },
                  { $limit: 1 }
                ],
                as: 'lastLease'
              }
            },
            {
              $addFields: {
                vacantSince: {
                  $cond: {
                    if: { $gt: [{ $size: '$lastLease' }, 0] },
                    then: { $arrayElemAt: ['$lastLease.endDate', 0] },
                    else: '$createdAt'
                  }
                }
              }
            },
            {
              $addFields: {
                lostRevenue: {
                  $multiply: [
                    '$rentAmount',
                    {
                      $divide: [
                        {
                          $floor: {
                            $divide: [
                              { $subtract: [now, '$vacantSince'] },
                              86400000
                            ]
                          }
                        },
                        30
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: 'vacantUnitsData'
        }
      },
      {
        $addFields: {
          lostRevenue: {
            $sum: '$vacantUnitsData.lostRevenue'
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          totalUnits: 1,
          vacantUnits: 1,
          vacancyRate: 1,
          lostRevenue: 1
        }
      },
      {
        $sort: { vacancyRate: -1 }
      }
    ]).toArray()

    const summary = {
      vacantUnits: vacantUnitsCount,
      vacancyRate: parseFloat(vacancyRate),
      lostRevenue: Math.round(totalLostRevenue),
      avgVacancyDays: avgVacancyDays
    }

    return {
      success: true,
      data: {
        vacantUnits,
        propertyVacancy,
        summary
      }
    }

  } catch (error) {
    console.error('Vacancy report error:', error)
    return {
      success: false,
      error: 'Failed to generate vacancy report'
    }
  }
})
