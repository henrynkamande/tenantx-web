import { connectToDatabase } from '~/server/utils/database'
import { Expense } from '~/server/models/Expense'
import Payment from '~/server/models/Payment'
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
    
    // Update expense status to paid
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        status: 'paid',
        paidAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    )
    
    // Create payment record
    const payment = new Payment({
      type: 'expense',
      expenseId: expense._id,
      propertyId: expense.propertyId,
      amount: expense.amount,
      description: `Expense payment: ${expense.description}`,
      category: expense.category,
      vendor: expense.vendor,
      date: new Date(),
      status: 'completed'
    })
    
    await payment.save()
    
    return {
      success: true,
      message: 'Expense marked as paid successfully'
    }
  } catch (error) {
    console.error('Expense payment error:', error)
    return {
      success: false,
      error: 'Failed to mark expense as paid'
    }
  }
})
