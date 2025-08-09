import { connectToDatabase } from '../../utils/database'
import Payment from '../../models/Payment'
import Property from '../../models/Property'
import { getLandlordFromToken } from '../../utils/getLandlord'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Authenticate landlord
    const landlord = await getLandlordFromToken(event)
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please log in'
      })
    }
    
    // Get landlord's properties to filter payments
    const landlordProperties = await Property.find({ landlordId: landlord._id }).select('_id').lean()
    const landlordPropertyIds = landlordProperties.map(p => new ObjectId(p._id))
    
    // Get current date ranges
    const currentDate = new Date()
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

    // Build landlord filter
    const landlordFilter = {
      $or: [
        { landlordId: new ObjectId(landlord._id) },
        { propertyId: { $in: landlordPropertyIds } }
      ]
    }

    // Calculate statistics
    const [
      totalCollectedResult,
      totalPendingResult,
      totalOverdueResult,
      totalPayments
    ] = await Promise.all([
      // Total collected this month
      Payment.aggregate([
        {
          $match: {
            ...landlordFilter,
            status: 'Completed',
            paymentDate: { $gte: currentMonth, $lt: nextMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      
      // Total pending
      Payment.aggregate([
        {
          $match: {
            ...landlordFilter,
            status: 'Pending'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      
      // Total overdue
      Payment.aggregate([
        {
          $match: {
            ...landlordFilter,
            status: 'Overdue',
            dueDate: { $lt: currentDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      
      // Total number of payments for this landlord
      Payment.countDocuments(landlordFilter)
    ])

    const totalCollected = totalCollectedResult.length > 0 ? totalCollectedResult[0].total : 0
    const totalPending = totalPendingResult.length > 0 ? totalPendingResult[0].total : 0
    const totalOverdue = totalOverdueResult.length > 0 ? totalOverdueResult[0].total : 0

    // Calculate collection rate
    const totalExpected = totalCollected + totalPending + totalOverdue
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0

    return {
      success: true,
      data: {
        totalCollected,
        totalPending,
        totalOverdue,
        collectionRate,
        totalPayments
      }
    }
  } catch (error: any) {
    console.error('Get payment stats error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
