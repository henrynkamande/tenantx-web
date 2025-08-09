import { connectToDatabase } from '../../utils/database'
import Landlord from '../../models/Landlord'
import Joi from 'joi'
import crypto from 'crypto'

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
})

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const body = await readBody(event)
    
    // Validate input
    const { error, value } = forgotPasswordSchema.validate(body)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    // Find landlord by email
    const landlord = await Landlord.findOne({ 
      email: value.email.toLowerCase(),
      isActive: true 
    })

    // Always return success to prevent email enumeration
    if (!landlord) {
      return {
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      }
    }

    // Generate reset token
    const resetToken = landlord.createPasswordResetToken()
    await landlord.save()

    // TODO: Send email with reset token
    // For now, we'll just log it (in production, integrate with email service)
    console.log(`Password reset token for ${landlord.email}: ${resetToken}`)
    console.log(`Reset URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`)

    return {
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
      // In development, include the token
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    }

  } catch (error: any) {
    console.error('Forgot password error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
