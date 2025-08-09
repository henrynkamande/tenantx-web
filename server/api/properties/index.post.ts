import { connectToDatabase } from '../../utils/database'
import Property from '../../models/Property'
import { getCurrentUser } from '../../utils/auth'
import Joi from 'joi'

const propertySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().default('USA')
  }).required(),
  propertyType: Joi.string().valid('Apartment', 'House', 'Condo', 'Townhouse', 'Commercial').required(),
  description: Joi.string().max(1000).allow(''),
  totalUnits: Joi.number().min(1).default(1),
  amenities: Joi.array().items(Joi.string()),
  images: Joi.array().items(Joi.string())
}).unknown(true)

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()

    // Get authenticated user
    const user = await getCurrentUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const body = await readBody(event)

    // Validate input
    const { error, value } = propertySchema.validate(body)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    // Create property with landlordId
    const property = new Property({
      ...value,
      landlordId: user._id
    })

    await property.save()

    return {
      success: true,
      data: property,
      message: 'Property created successfully'
    }
  } catch (error: any) {
    console.error('Create property error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
