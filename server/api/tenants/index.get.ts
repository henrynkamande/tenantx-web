import { connectToDatabase } from '../../utils/database'
import { getCurrentUser } from '../../utils/auth'
import Tenant from '../../models/Tenant'
import Unit from '../../models/Unit'
import Property from '../../models/Property'

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
    
    // Get landlord's properties
    const landlordProperties = await Property.find({ landlordId: user._id }).select('_id')
    const propertyIds = landlordProperties.map(p => p._id)
    
    if (propertyIds.length === 0) {
      // No properties, no tenants
      return {
        success: true,
        data: [],
        pagination: { page: 1, limit: 50, total: 0, pages: 0 }
      }
    }
    
    // Get units belonging to landlord's properties
    const landlordUnits = await Unit.find({ propertyId: { $in: propertyIds } }).select('_id')
    const unitIds = landlordUnits.map(u => u._id)
    
    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 50
    const search = query.search as string
    const status = query.status as string
    const skip = (page - 1) * limit

    // Build search filter - always filter by landlord's units
    let filter: any = {
      unitId: { $in: unitIds }
    }
    
    if (search) {
      filter.$and = [
        { unitId: { $in: unitIds } },
        {
          $or: [
            { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
            { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
            { 'personalInfo.email': { $regex: search, $options: 'i' } }
          ]
        }
      ]
    }

    if (status) {
      if (filter.$and) {
        filter.$and.push({ status })
      } else {
        filter.status = status
      }
    }

    // Get tenants with pagination and populate related data
    const [tenants, total] = await Promise.all([
      Tenant.find(filter)
        .populate({
          path: 'unitId',
          populate: {
            path: 'propertyId',
            select: 'name address'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tenant.countDocuments(filter)
    ])

    return {
      success: true,
      data: tenants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Get tenants error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
