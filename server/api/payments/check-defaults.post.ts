import { checkAndMarkDefaultedPayments } from '~/server/utils/rentDefault'
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

    // Run the default check manually
    await checkAndMarkDefaultedPayments()

    return {
      success: true,
      message: 'Defaulted payments check completed successfully'
    }
  } catch (error) {
    console.error('Error checking defaulted payments:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
