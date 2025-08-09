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

    const body = await readBody(event)
    const { globalRentDeadline, defaultPenaltyPercentage, useGlobalSettings } = body

    // Validate input
    if (globalRentDeadline && (globalRentDeadline < 1 || globalRentDeadline > 31)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Global rent deadline must be between 1 and 31 days'
      })
    }

    if (defaultPenaltyPercentage && (defaultPenaltyPercentage < 0 || defaultPenaltyPercentage > 100)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Default penalty percentage must be between 0 and 100'
      })
    }

    // Update rent settings
    const updatedLandlord = await Landlord.findByIdAndUpdate(
      landlord._id,
      {
        $set: {
          'rentSettings.globalRentDeadline': globalRentDeadline || 5,
          'rentSettings.defaultPenaltyPercentage': defaultPenaltyPercentage || 5,
          'rentSettings.useGlobalSettings': useGlobalSettings !== undefined ? useGlobalSettings : true
        }
      },
      { new: true }
    )

    return {
      success: true,
      message: 'Rent settings updated successfully',
      data: updatedLandlord.rentSettings
    }
  } catch (error) {
    console.error('Error updating rent settings:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
