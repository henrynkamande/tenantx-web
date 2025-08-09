import { connectToDatabase } from '../../utils/database'
import Landlord from '../../models/Landlord'
import Joi from 'joi'
import crypto from 'crypto'

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required()
})

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const body = await readBody(event)
    
    // Validate input
    const { error, value } = resetPasswordSchema.validate(body)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    // Hash the token to match what's stored in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(value.token)
      .digest('hex')

    // Find landlord with valid reset token
    const landlord = await Landlord.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      isActive: true
    })

    if (!landlord) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired reset token'
      })
    }

    // Update password and clear reset fields
    landlord.password = value.password
    landlord.passwordResetToken = undefined
    landlord.passwordResetExpires = undefined
    landlord.loginAttempts = 0
    landlord.lockUntil = undefined

    await landlord.save()

    return {
      success: true,
      message: 'Password has been reset successfully'
    }

  } catch (error: any) {
    console.error('Reset password error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
