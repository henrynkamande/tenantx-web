import { connectToDatabase } from '../../../utils/database'
import Unit from '../../../models/Unit'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const propertyId = event.context.params.id
    
    // Get units for the specific property
    const units = await Unit.find({ propertyId })
      .populate('propertyId', 'name')
      .sort({ unitNumber: 1 })
      .lean()

    return {
      success: true,
      data: units
    }
  } catch (error: any) {
    console.error('Get property units error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
