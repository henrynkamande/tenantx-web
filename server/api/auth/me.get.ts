import { connectToDatabase } from '../../utils/database'
import Landlord from '../../models/Landlord'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get authorization header
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No token provided'
      })
    }

    // Extract token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No token provided'
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { landlordId: string, iat: number, exp: number }
      
      // Get landlord from database
      const landlord = await Landlord.findById(decoded.landlordId).select('-password')
      
      if (!landlord) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid token - user not found'
        })
      }

      if (!landlord.isActive) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Account is deactivated'
        })
      }

      return {
        success: true,
        data: {
          landlord,
          tokenExpiry: decoded.exp
        }
      }
    } catch (jwtError) {
      // Token is invalid or expired
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

  } catch (error: any) {
    console.error('Auth verification error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
