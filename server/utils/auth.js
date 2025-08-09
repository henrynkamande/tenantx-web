import jwt from 'jsonwebtoken'
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()

export function generateAccessToken(landlord) {
  return jwt.sign(
    { landlordId: landlord._id },
    config.jwtSecret,
    { expiresIn: '15m' }
  )
}

export function generateRefreshToken(landlord) {
  return jwt.sign(
    { landlordId: landlord._id },
    config.jwtRefreshSecret,
    { expiresIn: '7d' }
  )
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret)
  } catch (error) {
    throw new Error('Invalid access token')
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwtRefreshSecret)
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}

export function setTokens(res, accessToken, refreshToken) {
  res.setHeader('Authorization', `Bearer ${accessToken}`)
  res.setHeader('Set-Cookie', [
    `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
  ])
}

export async function getCurrentUser(event) {
  try {
    const { connectToDatabase } = await import('./database')
    const Landlord = (await import('../models/Landlord')).default
    
    await connectToDatabase()
    
    // Get authorization header
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    // Extract token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!token) {
      return null
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret)
    
    // Get landlord from database
    const landlord = await Landlord.findById(decoded.landlordId).select('-password')
    
    if (!landlord || !landlord.isActive) {
      return null
    }

    return landlord
  } catch (error) {
    console.warn('Error getting current user:', error.message)
    return null
  }
}
