import { connectToDatabase } from '../../utils/database'
import Landlord from '../../models/Landlord'
import Joi from 'joi'
import jwt from 'jsonwebtoken'

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const body = await readBody(event)
    
    // Validate input
    const { error, value } = loginSchema.validate(body)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    // Find landlord by credentials (this method handles password verification)
    let landlord
    try {
      landlord = await Landlord.findByCredentials(value.email, value.password)
    } catch (authError: any) {
      throw createError({
        statusCode: 401,
        statusMessage: authError.message
      })
    }

    // Generate tokens
    const config = useRuntimeConfig()
    const accessToken = jwt.sign(
      { landlordId: landlord._id },
      config.jwtSecret,
      { expiresIn: '15m' }
    )
    
    const refreshToken = jwt.sign(
      { landlordId: landlord._id },
      config.jwtRefreshSecret,
      { expiresIn: '7d' }
    )

    // Set HTTP-only cookie for refresh token
    setCookie(event, 'refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    // Return landlord data and access token
    const landlordData = landlord.toObject()
    delete landlordData.password

    return {
      success: true,
      data: {
        landlord: landlordData,
        accessToken
      },
      message: 'Login successful'
    }

  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
