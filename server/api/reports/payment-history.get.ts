import { connectToDatabase } from '../../utils/database'
import Payment from '../../models/Payment'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const query = getQuery(event)
    const startDate = query.startDate as string
    const endDate = query.endDate as string
    const propertyId = query.propertyId as string
    const paymentType = query.paymentType as string
    const status = query.status as string
    
    // Build match criteria
    let matchCriteria: any = {}
    
    // Date range filter
    if (startDate || endDate) {
      matchCriteria.paymentDate = {}
      if (startDate) matchCriteria.paymentDate.$gte = new Date(startDate)
      if (endDate) matchCriteria.paymentDate.$lte = new Date(endDate)
    }
    
    // Payment type filter
    if (paymentType) {
      matchCriteria.paymentType = paymentType
    }
    
    // Status filter
    if (status) {
      matchCriteria.status = status
    }
    
    // Property filter (requires aggregation)
    let pipeline: any[] = [
      {
        $lookup: {
          from: 'tenants',
          localField: 'tenantId',
          foreignField: '_id',
          as: 'tenantId'
        }
      },
      {
        $unwind: {
          path: '$tenantId',
          preserveNullAndEmptyArrays: true
        }
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
        $unwind: {
          path: '$unitId',
          preserveNullAndEmptyArrays: true
        }
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
        $unwind: {
          path: '$unitId.propertyId',
          preserveNullAndEmptyArrays: true
        }
      }
    ]
    
    // Add property filter if specified
    if (propertyId) {
      matchCriteria['unitId.propertyId._id'] = propertyId
    }
    
    // Add match stage
    pipeline.push({ $match: matchCriteria })
    
    // Add sort stage
    pipeline.push({ $sort: { paymentDate: -1 } })
    
    // Execute aggregation
    const payments = await Payment.aggregate(pipeline)
    
    // Calculate summary statistics
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const paymentCount = payments.length
    const latePayments = payments.filter(payment => payment.isLate).length
    const averagePayment = paymentCount > 0 ? totalAmount / paymentCount : 0
    
    return {
      success: true,
      data: {
        payments,
        summary: {
          totalAmount,
          paymentCount,
          latePayments,
          averagePayment
        }
      }
    }
  } catch (error: any) {
    console.error('Get payment history report error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
