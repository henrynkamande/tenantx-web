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
    
    // Get expense and verify ownership
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
    
    // Update expense status to approved
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    )
    
    return {
      success: true,
      message: 'Expense approved successfully'
    }
  } catch (error) {
    console.error('Expense approval error:', error)
    return {
      success: false,
      error: 'Failed to approve expense'
    }
  }
})
