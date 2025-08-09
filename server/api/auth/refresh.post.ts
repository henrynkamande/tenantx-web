import { connectToDatabase } from '../../utils/database'
import Landlord from '../../models/Landlord'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get refresh token from cookie
    const refreshToken = getCookie(event, 'refreshToken')
    
    if (!refreshToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Refresh token not found'
      })
    }

    // Verify refresh token
    const config = useRuntimeConfig()
    let decoded
    try {
      decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as any
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid refresh token'
      })
    }

    // Find landlord
    const landlord = await Landlord.findById(decoded.landlordId)
      .select('-password')
    
    if (!landlord || !landlord.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Landlord not found or inactive'
      })
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { landlordId: landlord._id },
      config.jwtSecret,
      { expiresIn: '15m' }
    )

    // Update last activity
    landlord.lastActivity = new Date()
    await landlord.save()

    return {
      success: true,
      data: {
        accessToken
      }
    }

  } catch (error: any) {
    console.error('Token refresh error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
