import { connectToDatabase } from '~/server/utils/database'
import PaymentMethod from '~/server/models/PaymentMethod'
import AuditLog from '~/server/models/AuditLog'
import { getCurrentUser } from '~/server/utils/auth'
import { ObjectId } from 'mongodb'
import Joi from 'joi'

const paymentMethodSchema = Joi.object({
  type: Joi.string().valid('mpesa', 'bank', 'card', 'other').required(),
  label: Joi.string().trim().max(100).required(),
  
  // M-Pesa specific fields
  mpesa: Joi.object({
    paybill: Joi.string().allow('').max(20),
    till: Joi.string().allow('').max(20),
    accountRefHint: Joi.string().allow('').max(200)
  }).when('type', { is: 'mpesa', then: Joi.required(), otherwise: Joi.optional() }),
  
  // Bank specific fields
  bank: Joi.object({
    bankName: Joi.string().allow('').max(100),
    accountName: Joi.string().allow('').max(100),
    accountNumber: Joi.string().allow('').max(50),
    branch: Joi.string().allow('').max(100),
    swift: Joi.string().allow('').uppercase().max(20)
  }).when('type', { is: 'bank', then: Joi.required(), otherwise: Joi.optional() }),
  
  // Other payment method instructions
  instructions: Joi.string().allow('').max(1000),
  isDefault: Joi.boolean(),
  order: Joi.number().min(0)
})

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const currentUser = await getCurrentUser(event)
    const body = await readBody(event)
    
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    // Use the logged-in user's ID for payment methods
    const landlordId = currentUser._id.toString()
    
    // Validate input
    const { error, value } = paymentMethodSchema.validate(body)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }
    
    // Create new payment method
    const paymentMethod = new PaymentMethod({
      ...value,
      landlordId: new ObjectId(landlordId)
    })
    
    await paymentMethod.save()
    
    // TODO: Re-enable audit logging once getClientIP is properly available
    // await AuditLog.create({
    //   entityType: 'payment_method',
    //   entityId: paymentMethod._id,
    //   action: 'created',
    //   byUserId: currentUser._id,
    //   landlordId: currentUser._id,
    //   payload: value,
    //   ipAddress: 'unknown',
    //   userAgent: getHeader(event, 'user-agent') || 'unknown'
    // })
    
    return {
      success: true,
      data: paymentMethod,
      message: 'Payment method created successfully'
    }
  } catch (error) {
    console.error('Error creating payment method:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create payment method'
    })
  }
})
