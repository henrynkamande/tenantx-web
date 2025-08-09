import { connectToDatabase } from '../../utils/database'
import Property from '../../models/Property'
import Unit from '../../models/Unit'
import { getCurrentUser } from '../../utils/auth'
import mongoose from 'mongoose'

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
    
    const propertyId = getRouterParam(event, 'id')
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid property ID'
      })
    }

    // Get property and verify ownership
    const property = await Property.findOne({ _id: propertyId, landlordId: user._id }).lean()
    
    if (!property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found or access denied'
      })
    }

    // Get unit statistics
    const units = await Unit.countDocuments({ propertyId: property._id })
    const occupiedUnits = await Unit.countDocuments({ 
      propertyId: property._id, 
      occupancyStatus: 'Occupied' 
    })

    // Add statistics to property
    const propertyWithStats = {
      ...property,
      totalUnits: units,
      occupiedUnits,
      vacantUnits: units - occupiedUnits
    }

    return {
      success: true,
      data: propertyWithStats
    }
  } catch (error: any) {
    console.error('Get property error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
