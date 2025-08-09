import { connectToDatabase } from '~/server/utils/database'
import Property from '~/server/models/Property'
import Landlord from '~/server/models/Landlord'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const query = getQuery(event)
    
    // Get all properties and landlords
    const allProperties = await Property.find({})
    const allLandlords = await Landlord.find({})
    
    // Check for properties without landlordId
    const propertiesWithoutLandlordId = allProperties.filter(p => !p.landlordId)
    
    if (query.fix === 'true' && propertiesWithoutLandlordId.length > 0 && allLandlords.length > 0) {
      // Assign all properties without landlordId to the first landlord
      const firstLandlord = allLandlords[0]
      
      for (const property of propertiesWithoutLandlordId) {
        await Property.findByIdAndUpdate(property._id, {
          landlordId: firstLandlord._id
        })
      }
      
      return {
        success: true,
        message: `Fixed ${propertiesWithoutLandlordId.length} properties by assigning to landlord ${firstLandlord.email}`,
        data: {
          propertiesFixed: propertiesWithoutLandlordId.length,
          assignedToLandlord: firstLandlord.email
        }
      }
    }
    
    return {
      success: true,
      data: {
        totalProperties: allProperties.length,
        totalLandlords: allLandlords.length,
        propertiesWithoutLandlordId: propertiesWithoutLandlordId.length,
        propertiesWithLandlordId: allProperties.length - propertiesWithoutLandlordId.length,
        properties: allProperties.map(p => ({
          id: p._id,
          name: p.name,
          landlordId: p.landlordId || 'MISSING'
        })),
        landlords: allLandlords.map(l => ({
          id: l._id,
          email: l.email,
          name: `${l.firstName} ${l.lastName}`
        })),
        instructions: propertiesWithoutLandlordId.length > 0 && allLandlords.length > 0 
          ? 'Add ?fix=true to the URL to fix properties without landlordId' 
          : 'No fix needed'
      }
    }
  } catch (error) {
    console.error('Debug properties error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
