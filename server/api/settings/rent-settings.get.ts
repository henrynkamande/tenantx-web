import Landlord from '~/server/models/Landlord'
import { getLandlordFromToken } from '~/server/utils/getLandlord'

export default defineEventHandler(async (event) => {
  try {
    const landlord = await getLandlordFromToken(event)
    
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Get rent settings from landlord
    const rentSettings = landlord.rentSettings || {
      globalRentDeadline: 5,
      defaultPenaltyPercentage: 5,
      useGlobalSettings: true
    }

    return {
      success: true,
      data: rentSettings
    }
  } catch (error) {
    console.error('Error fetching rent settings:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
