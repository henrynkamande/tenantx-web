import { connectToDatabase } from '../../utils/database'
import Property from '../../models/Property'
import Unit from '../../models/Unit'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get overall occupancy summary
    const totalUnits = await Unit.countDocuments()
    const occupiedUnits = await Unit.countDocuments({ occupancyStatus: 'Occupied' })
    const vacantUnitsCount = totalUnits - occupiedUnits
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0
    
    // Get property breakdown with occupancy stats
    const properties = await Property.find().lean()
    
    const propertyBreakdown = await Promise.all(
      properties.map(async (property) => {
        const propertyUnits = await Unit.countDocuments({ propertyId: property._id })
        const propertyOccupied = await Unit.countDocuments({ 
          propertyId: property._id, 
          occupancyStatus: 'Occupied' 
        })
        const propertyVacant = propertyUnits - propertyOccupied
        const propertyOccupancyRate = propertyUnits > 0 ? Math.round((propertyOccupied / propertyUnits) * 100) : 0
        
        // Calculate potential revenue from all units in this property
        const unitsWithRent = await Unit.find({ propertyId: property._id }).select('rentAmount').lean()
        const potentialRevenue = unitsWithRent.reduce((sum, unit) => sum + (unit.rentAmount || 0), 0)
        
        return {
          _id: property._id,
          name: property.name,
          address: property.address,
          totalUnits: propertyUnits,
          occupiedUnits: propertyOccupied,
          vacantUnits: propertyVacant,
          occupancyRate: propertyOccupancyRate,
          potentialRevenue
        }
      })
    )
    
    // Get detailed vacant units
    const vacantUnits = await Unit.find({ occupancyStatus: 'Vacant' })
      .populate('propertyId', 'name')
      .select('unitNumber bedrooms bathrooms rentAmount squareFootage propertyId')
      .lean()
    
    return {
      success: true,
      data: {
        summary: {
          totalUnits,
          occupiedUnits,
          vacantUnits: vacantUnitsCount,
          occupancyRate
        },
        propertyBreakdown,
        vacantUnits
      }
    }
  } catch (error: any) {
    console.error('Get occupancy report error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
