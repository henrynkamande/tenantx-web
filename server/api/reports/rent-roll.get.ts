import { connectToDatabase } from '../../utils/database'
import Unit from '../../models/Unit'
import Tenant from '../../models/Tenant'
import Property from '../../models/Property'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const query = getQuery(event)
    const propertyId = query.propertyId as string
    const occupancyStatus = query.occupancyStatus as string
    const reportDate = query.reportDate as string || new Date().toISOString()
    
    // Build match criteria for units
    let unitFilter: any = {}
    
    if (propertyId) {
      unitFilter.propertyId = propertyId
    }
    
    if (occupancyStatus) {
      unitFilter.occupancyStatus = occupancyStatus
    }
    
    // Get all units with property information
    const units = await Unit.find(unitFilter)
      .populate('propertyId', 'name address')
      .sort({ 'propertyId.name': 1, unitNumber: 1 })
      .lean()
    
    // Get tenants for occupied units
    const occupiedUnits = units.filter(unit => unit.occupancyStatus === 'Occupied')
    const tenantsByUnit = new Map()
    
    if (occupiedUnits.length > 0) {
      const tenants = await Tenant.find({
        unitId: { $in: occupiedUnits.map(unit => unit._id) },
        status: 'Active'
      }).lean()
      
      tenants.forEach(tenant => {
        tenantsByUnit.set(tenant.unitId.toString(), tenant)
      })
    }
    
    // Combine units with tenant information
    const rentRollData = units.map(unit => ({
      ...unit,
      tenant: tenantsByUnit.get(unit._id.toString()) || null
    }))
    
    // Calculate summary statistics
    const totalUnits = units.length
    const occupiedUnitsCount = units.filter(unit => unit.occupancyStatus === 'Occupied').length
    const totalRent = units
      .filter(unit => unit.occupancyStatus === 'Occupied')
      .reduce((sum, unit) => sum + (unit.rentAmount || 0), 0)
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnitsCount / totalUnits) * 100) : 0
    
    // Generate property summary
    const properties = await Property.find(propertyId ? { _id: propertyId } : {}).lean()
    
    const propertySummary = await Promise.all(
      properties.map(async (property) => {
        const propertyUnits = units.filter(unit => 
          unit.propertyId._id.toString() === property._id.toString()
        )
        
        const propertyOccupiedUnits = propertyUnits.filter(unit => 
          unit.occupancyStatus === 'Occupied'
        ).length
        
        const propertyTotalRent = propertyUnits
          .filter(unit => unit.occupancyStatus === 'Occupied')
          .reduce((sum, unit) => sum + (unit.rentAmount || 0), 0)
        
        const propertyPotentialRent = propertyUnits
          .reduce((sum, unit) => sum + (unit.rentAmount || 0), 0)
        
        const propertyOccupancyRate = propertyUnits.length > 0 
          ? Math.round((propertyOccupiedUnits / propertyUnits.length) * 100) 
          : 0
        
        return {
          _id: property._id,
          name: property.name,
          totalUnits: propertyUnits.length,
          occupiedUnits: propertyOccupiedUnits,
          occupancyRate: propertyOccupancyRate,
          totalRent: propertyTotalRent,
          potentialRent: propertyPotentialRent
        }
      })
    )
    
    return {
      success: true,
      data: {
        units: rentRollData,
        summary: {
          totalUnits,
          occupiedUnits: occupiedUnitsCount,
          totalRent,
          occupancyRate
        },
        propertySummary,
        reportDate
      }
    }
  } catch (error: any) {
    console.error('Get rent roll report error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
