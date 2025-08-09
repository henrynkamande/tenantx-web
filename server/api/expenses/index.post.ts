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
    
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.date || !body.description || !body.category || !body.propertyId || !body.amount) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }
    
    // Debug: Check what properties exist for this user
    console.log('Debug - User ID:', user._id)
    console.log('Debug - Requested property ID:', body.propertyId)
    
    const allUserProperties = await Property.find({ landlordId: user._id })
    console.log('Debug - User has properties:', allUserProperties.map(p => ({ id: p._id, name: p.name })))
    
    const allProperties = await Property.find({})
    console.log('Debug - All properties in system:', allProperties.map(p => ({ id: p._id, name: p.name, landlordId: p.landlordId })))
    
    // Verify that the property belongs to the authenticated landlord
    const property = await Property.findOne({ _id: body.propertyId, landlordId: user._id })
    console.log('Debug - Found matching property:', property)
    
    if (!property) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Property not found or access denied'
      })
    }
    
    // Create expense object
    const expense = new Expense({
      date: new Date(body.date),
      description: body.description,
      category: body.category,
      propertyId: body.propertyId,
      amount: parseFloat(body.amount),
      vendor: body.vendor || '',
      notes: body.notes || '',
      status: 'pending',
      receipt: body.receipt ? {
        filename: body.receipt.name,
        size: body.receipt.size,
        type: body.receipt.type,
        uploadedAt: new Date()
      } : null,
    })
    
    await expense.save()
    
    return {
      success: true,
      data: expense
    }
  } catch (error) {
    console.error('Expense creation error:', error)
    return {
      success: false,
      error: 'Failed to create expense'
    }
  }
})
