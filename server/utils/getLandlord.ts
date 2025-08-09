import jwt from 'jsonwebtoken'
import Landlord from '../models/Landlord'

export async function getLandlordFromToken(event: any) {
  try {
    // Get token from Authorization header
    const authorization = getHeader(event, 'authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null
    }

    const token = authorization.substring(7) // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret) as any
    
    if (!decoded || !decoded.landlordId) {
      return null
    }

    // Get landlord from database
    const landlord = await Landlord.findById(decoded.landlordId)
      .select('-password')
      .lean()
    
    if (!landlord || !landlord.isActive) {
      return null
    }

    // Update last activity
    await Landlord.findByIdAndUpdate(decoded.landlordId, {
      lastActivity: new Date()
    })
    
    return landlord
  } catch (error) {
    console.error('Error getting landlord from token:', error)
    return null
  }
}
