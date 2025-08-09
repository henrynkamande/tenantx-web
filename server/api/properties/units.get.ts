import { connectToDatabase } from '../../utils/database'
import Unit from '../../models/Unit'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get query parameters
    const query = getQuery(event)
    const propertyId = query.propertyId as string
    
    // Build filter
    let filter: any = {}
    if (propertyId) {
      filter.propertyId = propertyId
    }

    // Get units with property information
    const units = await Unit.find(filter)
      .populate('propertyId', 'name')
      .sort({ propertyId: 1, unitNumber: 1 })
      .lean()

    return {
      success: true,
      data: units
    }
  } catch (error: any) {
    console.error('Get units error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
