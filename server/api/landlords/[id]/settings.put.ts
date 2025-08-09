import { connectToDatabase } from '~/server/utils/database'
import LandlordSettings from '~/server/models/LandlordSettings'
import AuditLog from '~/server/models/AuditLog'
import { getCurrentUser } from '~/server/utils/auth'
import { ObjectId } from 'mongodb'
import Joi from 'joi'

const settingsSchema = Joi.object({
  _id: Joi.string().optional(), // Allow but ignore _id from frontend
  displayName: Joi.string().trim().max(100),
  email: Joi.string().email().lowercase().trim(),
  phone: Joi.string().trim().max(20),
  address: Joi.object({
    street: Joi.string().allow('').max(200),
    city: Joi.string().allow('').max(100),
    state: Joi.string().allow('').max(100),
    zipCode: Joi.string().allow('').max(20),
    country: Joi.string().allow('').max(100)
  }),
  kraPin: Joi.string().allow('').uppercase().max(20),
  vatNumber: Joi.string().allow('').uppercase().max(30),
  vatRate: Joi.number().min(0).max(100),
  taxInclusive: Joi.boolean(),
  logoUrl: Joi.string().uri().allow(''),
  brandColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i),
  signatureUrl: Joi.string().uri().allow(''),
  defaultTerms: Joi.string().valid('Net 7', 'Net 14', 'Net 30', 'Due on Receipt'),
  graceDays: Joi.number().min(0).max(30),
  lateFeeType: Joi.string().valid('flat', 'percent'),
  lateFeeValue: Joi.number().min(0),
  invoicePrefix: Joi.string().uppercase().max(10),
  invoiceNumberSeq: Joi.number().min(0),
  invoiceFormat: Joi.string().max(100),
  currency: Joi.string().valid('KES', 'USD', 'EUR', 'GBP')
}).unknown(false) // This will strip unknown fields including _id

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
    
    // Use the logged-in user's ID for settings
    const landlordId = currentUser._id.toString()
    
    // Filter out system fields (_id, landlordId, timestamps) and validate input
    const { _id, landlordId: _, createdAt: __, updatedAt: ___, __v: ____, ...bodyWithoutId } = body
    const { error, value } = settingsSchema.validate(bodyWithoutId)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }
    
    const settings = await LandlordSettings.findOneAndUpdate(
      { landlordId: new ObjectId(landlordId) },
      { ...value, landlordId: new ObjectId(landlordId) },
      { 
        upsert: true,
        new: true,
        runValidators: true
      }
    )
    
    // TODO: Re-enable audit logging once getClientIP is properly available
    // await AuditLog.create({
    //   entityType: 'landlord_settings',
    //   entityId: settings._id,
    //   action: 'updated',
    //   byUserId: currentUser._id,
    //   landlordId: currentUser._id,
    //   payload: value,
    //   ipAddress: 'unknown',
    //   userAgent: getHeader(event, 'user-agent') || 'unknown'
    // })
    
    return {
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    }
  } catch (error) {
    console.error('Error updating landlord settings:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update settings'
    })
  }
})
