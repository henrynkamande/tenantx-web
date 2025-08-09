import { connectToDatabase } from '../../utils/database'
import Property from '../../models/Property'
import Unit from '../../models/Unit'
import Tenant from '../../models/Tenant'
import Payment from '../../models/Payment'
import Maintenance from '../../models/Maintenance'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const propertyId = getRouterParam(event, 'id')
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid property ID'
      })
    }

    // Check if property exists
    const property = await Property.findById(propertyId)
    if (!property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found'
      })
    }

    // Check for active tenants
    const activeTenants = await Tenant.countDocuments({
      unitId: { $in: await Unit.find({ propertyId }).select('_id') },
      status: 'Active'
    })

    if (activeTenants > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete property with active tenants. Please move or deactivate all tenants first.'
      })
    }

    // Get all units for this property
    const units = await Unit.find({ propertyId }).select('_id')
    const unitIds = units.map(unit => unit._id)

    // Delete related records in order
    await Promise.all([
      // Delete maintenance requests
      Maintenance.deleteMany({ unitId: { $in: unitIds } }),
      
      // Delete payments
      Payment.deleteMany({ unitId: { $in: unitIds } }),
      
      // Delete inactive tenants
      Tenant.deleteMany({ 
        unitId: { $in: unitIds },
        status: { $ne: 'Active' }
      })
    ])

    // Delete units
    await Unit.deleteMany({ propertyId })

    // Finally delete the property
    await Property.findByIdAndDelete(propertyId)

    return {
      success: true,
      message: 'Property deleted successfully'
    }
  } catch (error: any) {
    console.error('Delete property error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
