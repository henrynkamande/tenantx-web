import { connectToDatabase } from '~/server/utils/database'
import { Expense } from '~/server/models/Expense'
import Property from '~/server/models/Property'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get authenticated user
    const user = await getCurrentUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Expense ID is required'
      })
    }
    
    // Get expense details
    const expense = await Expense.findById(id)
    
    if (!expense) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense not found'
      })
    }
    
    // Verify that the expense's property belongs to the authenticated landlord
    const property = await Property.findOne({ _id: expense.propertyId, landlordId: user._id })
    if (!property) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }
    
    return {
      success: true,
      data: {
        ...expense.toObject(),
        property
      }
    }
  } catch (error) {
    console.error('Get expense error:', error)
    if (error.statusCode) {
      throw error
    }
    return {
      success: false,
      error: 'Failed to fetch expense details'
    }
  }
})
