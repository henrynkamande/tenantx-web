import { connectToDatabase } from '../../utils/database'
import { getCurrentUser } from '../../utils/auth'
import Tenant from '../../models/Tenant'
import Property from '../../models/Property'
import Unit from '../../models/Unit'

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
    
    const tenantId = getRouterParam(event, 'id')
    
    if (!tenantId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tenant ID is required'
      })
    }

    // Get tenant with populated unit and property data
    const tenant = await Tenant.findById(tenantId)
      .populate({
        path: 'unitId',
        populate: {
          path: 'propertyId',
          select: 'name address landlordId'
        }
      })
      .lean()

    if (!tenant) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tenant not found'
      })
    }
    
    // Verify that the tenant's property belongs to the authenticated landlord
    if (!tenant.unitId?.propertyId?.landlordId || 
        tenant.unitId.propertyId.landlordId.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }
    
    // Remove landlordId from the response for security
    if (tenant.unitId?.propertyId) {
      delete tenant.unitId.propertyId.landlordId
    }

    return {
      success: true,
      data: tenant
    }
  } catch (error: any) {
    console.error('Get tenant error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
