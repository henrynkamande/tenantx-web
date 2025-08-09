import { connectToDatabase } from '~/server/utils/database'
import Tenant from '~/server/models/Tenant'
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
    
    // Ensure the user is a tenant
    if (user.role !== 'tenant') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied - Tenant access required'
      })
    }
    
    // Get tenant details to find their properties
    const tenant = await Tenant.findById(user._id)
      .populate({
        path: 'unitId',
        populate: {
          path: 'propertyId',
          select: 'name address landlordId'
        }
      })
    
    if (!tenant) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tenant not found'
      })
    }
    
    // Extract unique properties from tenant's unit(s)
    const properties = []
    
    if (tenant.unitId && tenant.unitId.propertyId) {
      properties.push({
        _id: tenant.unitId.propertyId._id,
        name: tenant.unitId.propertyId.name,
        address: tenant.unitId.propertyId.address,
        unitNumber: tenant.unitId.unitNumber || tenant.unitId.name
      })
    }
    
    return {
      success: true,
      data: properties
    }
  } catch (error) {
    console.error('Tenant properties fetch error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch properties'
    })
  }
})
