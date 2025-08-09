export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const query = getQuery(event)
    
    // Parse year and month from query
    const year = parseInt(query.year as string) || new Date().getFullYear()
    const month = parseInt(query.month as string) || new Date().getMonth() + 1
    
    // Calculate date ranges
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0)
    const startOfLastMonth = new Date(year, month - 2, 1)
    const endOfLastMonth = new Date(year, month - 1, 0)

    // Get current month financial data
    const currentMonthData = await db.collection('payments').aggregate([
      {
        $match: {
          paymentDate: {
            $gte: startOfMonth,
            $lte: endOfMonth
          },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          rentRevenue: {
            $sum: {
              $cond: [{ $eq: ['$type', 'rent'] }, '$amount', 0]
            }
          },
          lateFees: {
            $sum: {
              $cond: [{ $eq: ['$type', 'late_fee'] }, '$amount', 0]
            }
          },
          otherIncome: {
            $sum: {
              $cond: [{ $nin: ['$type', ['rent', 'late_fee']] }, '$amount', 0]
            }
          }
        }
      }
    ]).toArray()

    // Get last month financial data for comparison
    const lastMonthData = await db.collection('payments').aggregate([
      {
        $match: {
          paymentDate: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth
          },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]).toArray()

    // Get occupancy data for current and last month
    const currentOccupancy = await db.collection('units').aggregate([
      {
        $group: {
          _id: null,
          totalUnits: { $sum: 1 },
          occupiedUnits: {
            $sum: {
              $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          occupancyRate: {
            $round: [
              { $multiply: [{ $divide: ['$occupiedUnits', '$totalUnits'] }, 100] },
              1
            ]
          }
        }
      }
    ]).toArray()

    // Get maintenance costs for current month
    const maintenanceCosts = await db.collection('maintenance_requests').aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCosts: {
            $sum: {
              $cond: {
                if: { $gt: ['$actualCost', 0] },
                then: '$actualCost',
                else: { $ifNull: ['$estimatedCost', 0] }
              }
            }
          }
        }
      }
    ]).toArray()

    // Get last month maintenance costs for comparison
    const lastMonthMaintenance = await db.collection('maintenance_requests').aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCosts: {
            $sum: {
              $cond: {
                if: { $gt: ['$actualCost', 0] },
                then: '$actualCost',
                else: { $ifNull: ['$estimatedCost', 0] }
              }
            }
          }
        }
      }
    ]).toArray()

    // Get tenant activities for the month
    const tenantActivities = await db.collection('leases').aggregate([
      {
        $facet: {
          moveIns: [
            {
              $match: {
                startDate: {
                  $gte: startOfMonth,
                  $lte: endOfMonth
                }
              }
            },
            { $count: 'count' }
          ],
          moveOuts: [
            {
              $match: {
                endDate: {
                  $gte: startOfMonth,
                  $lte: endOfMonth
                },
                status: 'terminated'
              }
            },
            { $count: 'count' }
          ],
          renewals: [
            {
              $match: {
                renewalDate: {
                  $gte: startOfMonth,
                  $lte: endOfMonth
                }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]).toArray()

    // Get maintenance activities for the month
    const maintenanceActivities = await db.collection('maintenance_requests').aggregate([
      {
        $facet: {
          newRequests: [
            {
              $match: {
                createdAt: {
                  $gte: startOfMonth,
                  $lte: endOfMonth
                }
              }
            },
            { $count: 'count' }
          ],
          completed: [
            {
              $match: {
                status: 'completed',
                completedAt: {
                  $gte: startOfMonth,
                  $lte: endOfMonth
                }
              }
            },
            { $count: 'count' }
          ],
          emergency: [
            {
              $match: {
                priority: 'urgent',
                createdAt: {
                  $gte: startOfMonth,
                  $lte: endOfMonth
                }
              }
            },
            { $count: 'count' }
          ],
          avgResolution: [
            {
              $match: {
                status: 'completed',
                completedAt: {
                  $gte: startOfMonth,
                  $lte: endOfMonth
                }
              }
            },
            {
              $addFields: {
                resolutionDays: {
                  $divide: [
                    { $subtract: ['$completedAt', '$createdAt'] },
                    86400000
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                avgDays: { $avg: '$resolutionDays' }
              }
            }
          ]
        }
      }
    ]).toArray()

    // Get property performance for the month
    const propertyPerformance = await db.collection('properties').aggregate([
      {
        $lookup: {
          from: 'units',
          localField: '_id',
          foreignField: 'propertyId',
          as: 'units'
        }
      },
      {
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
            { $unwind: '$tenant' },
            {
              $lookup: {
                from: 'units',
                localField: 'tenant.unitId',
                foreignField: '_id',
                as: 'unit'
              }
            },
            { $unwind: '$unit' },
            {
              $match: {
                $expr: { $eq: ['$unit.propertyId', '$$propertyId'] },
                paymentDate: {
                  $gte: startOfMonth,
                  $lte: endOfMonth
                },
                status: 'completed'
              }
            }
          ],
          as: 'monthlyPayments'
        }
      },
      {
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
            { $unwind: '$unit' },
            {
              $match: {
                $expr: { $eq: ['$unit.propertyId', '$$propertyId'] },
                createdAt: {
                  $gte: startOfMonth,
                  $lte: endOfMonth
                }
              }
            }
          ],
          as: 'monthlyMaintenance'
        }
      },
      {
        $addFields: {
          totalUnits: { $size: '$units' },
          occupiedUnits: {
            $size: {
              $filter: {
                input: '$units',
                cond: { $eq: ['$$this.status', 'occupied'] }
              }
            }
          },
          revenue: { $sum: '$monthlyPayments.amount' },
          expenses: {
            $sum: {
              $map: {
                input: '$monthlyMaintenance',
                as: 'req',
                in: {
                  $cond: {
                    if: { $gt: ['$$req.actualCost', 0] },
                    then: '$$req.actualCost',
                    else: { $ifNull: ['$$req.estimatedCost', 0] }
                  }
                }
              }
            }
          },
          workOrders: { $size: '$monthlyMaintenance' },
          occupancyRate: {
            $cond: {
              if: { $gt: [{ $size: '$units' }, 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $size: {
                              $filter: {
                                input: '$units',
                                cond: { $eq: ['$$this.status', 'occupied'] }
                              }
                            }
                          },
                          { $size: '$units' }
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
        $addFields: {
          netIncome: { $subtract: ['$revenue', '$expenses'] }
        }
      },
      {
        $project: {
          name: 1,
          occupancyRate: 1,
          revenue: { $round: ['$revenue', 0] },
          expenses: { $round: ['$expenses', 0] },
          netIncome: { $round: ['$netIncome', 0] },
          workOrders: 1
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]).toArray()

    // Calculate percentage changes
    const currentRevenue = currentMonthData[0]?.totalRevenue || 0
    const lastRevenue = lastMonthData[0]?.totalRevenue || 0
    const revenueChange = lastRevenue > 0 ? 
      Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100) : 0

    const currentMaintenanceCost = maintenanceCosts[0]?.totalCosts || 0
    const lastMaintenanceCost = lastMonthMaintenance[0]?.totalCosts || 0
    const maintenanceChange = lastMaintenanceCost > 0 ? 
      Math.round(((currentMaintenanceCost - lastMaintenanceCost) / lastMaintenanceCost) * 100) : 0

    const netIncome = currentRevenue - currentMaintenanceCost
    const lastNetIncome = lastRevenue - lastMaintenanceCost
    const netIncomeChange = lastNetIncome > 0 ? 
      Math.round(((netIncome - lastNetIncome) / lastNetIncome) * 100) : 0

    // Build summary object
    const summary = {
      // KPIs with changes
      totalRevenue: Math.round(currentRevenue),
      revenueChange: revenueChange,
      occupancyRate: currentOccupancy[0]?.occupancyRate || 0,
      occupancyChange: 0, // Would need historical occupancy data
      maintenanceCosts: Math.round(currentMaintenanceCost),
      maintenanceChange: maintenanceChange,
      netIncome: Math.round(netIncome),
      netIncomeChange: netIncomeChange,

      // Revenue breakdown
      rentRevenue: Math.round(currentMonthData[0]?.rentRevenue || 0),
      lateFees: Math.round(currentMonthData[0]?.lateFees || 0),
      otherIncome: Math.round(currentMonthData[0]?.otherIncome || 0),

      // Expense breakdown (simplified)
      managementFees: Math.round(currentRevenue * 0.08), // Estimate 8%
      insurance: Math.round(currentRevenue * 0.02), // Estimate 2%
      otherExpenses: Math.round(currentRevenue * 0.05), // Estimate 5%
      totalExpenses: Math.round(currentMaintenanceCost + (currentRevenue * 0.15)),

      // Tenant activities
      newMoveIns: tenantActivities[0]?.moveIns[0]?.count || 0,
      moveOuts: tenantActivities[0]?.moveOuts[0]?.count || 0,
      leaseRenewals: tenantActivities[0]?.renewals[0]?.count || 0,
      evictions: 0, // Would need eviction tracking

      // Maintenance activities
      newMaintenanceRequests: maintenanceActivities[0]?.newRequests[0]?.count || 0,
      completedMaintenance: maintenanceActivities[0]?.completed[0]?.count || 0,
      emergencyRequests: maintenanceActivities[0]?.emergency[0]?.count || 0,
      avgResolutionTime: Math.round(maintenanceActivities[0]?.avgResolution[0]?.avgDays || 0)
    }

    return {
      success: true,
      data: {
        summary,
        propertyPerformance,
        reportMonth: {
          year,
          month,
          monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' })
        }
      }
    }

  } catch (error) {
    console.error('Monthly summary report error:', error)
    return {
      success: false,
      error: 'Failed to generate monthly summary report'
    }
  }
})
