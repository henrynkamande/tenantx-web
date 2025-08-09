import { connectToDatabase } from '../../utils/database'
import Property from '../../models/Property'
import Unit from '../../models/Unit'
import { getCurrentUser } from '../../utils/auth'

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
    
    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string
    const skip = (page - 1) * limit

    // Debug logging
    console.log('Debug - Properties API - User ID:', user._id)
    
    // Build search filter - always filter by landlord
    let filter: any = {
      landlordId: user._id
    }
    
    if (search) {
      filter.$and = [
        { landlordId: user._id },
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { 'address.street': { $regex: search, $options: 'i' } },
            { 'address.city': { $regex: search, $options: 'i' } }
          ]
        }
      ]
    }

    // Get properties with pagination
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(filter)
    ])

    // Get unit counts for each property
    const propertiesWithStats = await Promise.all(
      properties.map(async (property) => {
        const units = await Unit.countDocuments({ propertyId: property._id })
        const occupiedUnits = await Unit.countDocuments({ 
          propertyId: property._id, 
          occupancyStatus: 'Occupied' 
        })
        
        return {
          ...property,
          totalUnits: units,
          occupiedUnits,
          vacantUnits: units - occupiedUnits
        }
      })
    )

    return {
      success: true,
      data: propertiesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Get properties error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
