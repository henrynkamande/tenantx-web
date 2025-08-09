import { connectToDatabase } from '../../utils/database'
import Landlord from '../../models/Landlord'
import Joi from 'joi'
import jwt from 'jsonwebtoken'

const registrationSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  companyName: Joi.string().max(100).optional(),
  preferredCurrency: Joi.string().valid('KES', 'USD', 'EUR', 'GBP').default('KES'),
  language: Joi.string().valid('en', 'sw').default('en')
})

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const body = await readBody(event)
    
    // Validate input
    const { error, value } = registrationSchema.validate(body)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    // Check if landlord already exists
    const existingLandlord = await Landlord.findOne({ 
      email: value.email.toLowerCase() 
    })
    
    if (existingLandlord) {
      throw createError({
        statusCode: 409,
        statusMessage: 'An account with this email already exists'
      })
    }

    // Create new landlord
    const landlord = new Landlord({
      ...value,
      email: value.email.toLowerCase(),
      subscriptionExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
    })

    await landlord.save()

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
      message: 'Account created successfully'
    }

  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.statusCode) {
      throw error
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'An account with this email already exists'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
