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
    
    // Get all properties owned by this landlord
    const properties = await Property.find({ landlordId: user._id }).select('_id')
    const propertyIds = properties.map(p => p._id.toString())
    
    if (propertyIds.length === 0) {
      // No properties, no expenses
      return {
        success: true,
        data: []
      }
    }
    
    const query = getQuery(event)
    
    // Build filter object - always filter by landlord's properties
    const filter: any = {
      propertyId: { $in: propertyIds }
    }
    
    if (query.category) {
      filter.category = query.category
    }
    
    if (query.property) {
      // Ensure the requested property belongs to the authenticated landlord
      if (propertyIds.includes(query.property as string)) {
        filter.propertyId = query.property
      } else {
        // Property doesn't belong to this landlord
        return {
          success: true,
          data: []
        }
      }
    }
    
    if (query.status) {
      filter.status = query.status
    }
    
    if (query.dateFrom || query.dateTo) {
      filter.date = {}
      if (query.dateFrom) {
        filter.date.$gte = new Date(query.dateFrom as string)
      }
      if (query.dateTo) {
        filter.date.$lte = new Date(query.dateTo as string)
      }
    }
    
    // Get expenses
    const expenses = await Expense.find(filter).sort({ date: -1 })
    
    return {
      success: true,
      data: expenses
    }
  } catch (error) {
    console.error('Expenses fetch error:', error)
    if (error.statusCode) {
      throw error
    }
    return {
      success: false,
      error: 'Failed to fetch expenses'
    }
  }
})
