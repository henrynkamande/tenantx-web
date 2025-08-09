import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const reportId = getRouterParam(event, 'id')
    
    if (!reportId) {
      return {
        success: false,
        error: 'Report ID is required'
      }
    }

    // Get the custom report configuration
    const report = await db.collection('custom_reports').findOne({ _id: new ObjectId(reportId) })
    
    if (!report) {
      return {
        success: false,
        error: 'Report not found'
      }
    }

    // Generate report data based on type and configuration
    let reportData = {}
    
    switch (report.type) {
      case 'financial':
        reportData = await generateFinancialReport(db, report.configuration)
        break
      case 'occupancy':
        reportData = await generateOccupancyReport(db, report.configuration)
        break
      case 'tenant':
        reportData = await generateTenantReport(db, report.configuration)
        break
      case 'maintenance':
        reportData = await generateMaintenanceReport(db, report.configuration)
        break
      default:
        reportData = await generateCustomReport(db, report)
    }

    // Save report result
    const reportResult = {
      reportId: new ObjectId(reportId),
      reportName: report.name,
      type: report.type,
      data: reportData,
      generatedAt: new Date(),
      format: report.outputFormat
    }

    const resultInsert = await db.collection('report_results').insertOne(reportResult)
    
    // Update report's last run time
    await db.collection('custom_reports').updateOne(
      { _id: new ObjectId(reportId) },
      { $set: { lastRun: new Date() } }
    )

    return {
      success: true,
      data: {
        resultId: resultInsert.insertedId,
        reportData,
        generatedAt: reportResult.generatedAt
      }
    }
  } catch (error) {
    console.error('Custom report run error:', error)
    return {
      success: false,
      error: 'Failed to run custom report'
    }
  }
})

// Helper functions for generating different report types
async function generateFinancialReport(db, config) {
  const startDate = getDateRange(config.dateRange).start
  const endDate = getDateRange(config.dateRange).end
  
  const pipeline = [
    {
      $match: {
        paymentDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$paymentDate' },
          year: { $year: '$paymentDate' }
        },
        totalRevenue: { $sum: '$amount' },
        paymentCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]
  
  return await db.collection('payments').aggregate(pipeline).toArray()
}

async function generateOccupancyReport(db, config) {
  const pipeline = [
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
        occupiedUnits: {
          $size: {
            $filter: {
              input: '$units',
              cond: { $eq: ['$$this.status', 'occupied'] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        occupancyRate: {
          $cond: {
            if: { $gt: ['$totalUnits', 0] },
            then: { $round: [{ $multiply: [{ $divide: ['$occupiedUnits', '$totalUnits'] }, 100] }, 1] },
            else: 0
          }
        }
      }
    },
    {
      $project: {
        name: 1,
        address: 1,
        totalUnits: 1,
        occupiedUnits: 1,
        occupancyRate: 1
      }
    }
  ]
  
  return await db.collection('properties').aggregate(pipeline).toArray()
}

async function generateTenantReport(db, config) {
  const pipeline = [
    {
      $lookup: {
        from: 'units',
        localField: 'unitId',
        foreignField: '_id',
        as: 'unit'
      }
    },
    {
      $lookup: {
        from: 'properties',
        localField: 'unit.propertyId',
        foreignField: '_id',
        as: 'property'
      }
    },
    {
      $lookup: {
        from: 'leases',
        localField: '_id',
        foreignField: 'tenantId',
        as: 'lease'
      }
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        unit: { $arrayElemAt: ['$unit', 0] },
        property: { $arrayElemAt: ['$property', 0] },
        lease: { $arrayElemAt: ['$lease', 0] }
      }
    }
  ]
  
  return await db.collection('tenants').aggregate(pipeline).toArray()
}

async function generateMaintenanceReport(db, config) {
  const startDate = getDateRange(config.dateRange).start
  const endDate = getDateRange(config.dateRange).end
  
  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
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
      $lookup: {
        from: 'properties',
        localField: 'unit.propertyId',
        foreignField: '_id',
        as: 'property'
      }
    },
    {
      $project: {
        title: 1,
        description: 1,
        priority: 1,
        status: 1,
        estimatedCost: 1,
        actualCost: 1,
        createdAt: 1,
        completedAt: 1,
        unit: { $arrayElemAt: ['$unit', 0] },
        property: { $arrayElemAt: ['$property', 0] }
      }
    }
  ]
  
  return await db.collection('maintenance_requests').aggregate(pipeline).toArray()
}

async function generateCustomReport(db, report) {
  // Basic implementation for custom reports
  const collections = report.dataSources
  let data = {}
  
  for (const source of collections) {
    try {
      data[source] = await db.collection(source).find({}).limit(100).toArray()
    } catch (error) {
      console.error(`Error fetching ${source}:`, error)
      data[source] = []
    }
  }
  
  return data
}

function getDateRange(range) {
  const now = new Date()
  let start, end
  
  switch (range) {
    case 'current_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    case 'current_year':
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31)
      break
    case 'last_year':
      start = new Date(now.getFullYear() - 1, 0, 1)
      end = new Date(now.getFullYear() - 1, 11, 31)
      break
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  }
  
  return { start, end }
}
