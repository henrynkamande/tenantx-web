import { connectToDatabase } from '~/server/utils/database'
import PaymentMethod from '~/server/models/PaymentMethod'
import { getCurrentUser } from '~/server/utils/auth'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const landlordId = getRouterParam(event, 'id')
    const currentUser = await getCurrentUser(event)
    
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    // Verify access - can only access own payment methods or if admin
    if (currentUser._id.toString() !== landlordId && currentUser.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }
    
    const paymentMethods = await PaymentMethod.find({ 
      landlordId: new ObjectId(landlordId),
      isActive: true
    }).sort({ order: 1, isDefault: -1, createdAt: 1 })
    
    return {
      success: true,
      data: paymentMethods
    }
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch payment methods'
    })
  }
})
