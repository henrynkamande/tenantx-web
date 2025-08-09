import { connectToDatabase } from '../../utils/database'
import { executeWithOptionalTransaction } from '../../utils/mongodb-utils'
import Tenant from '../../models/Tenant'
import Unit from '../../models/Unit'
import Joi from 'joi'
import mongoose from 'mongoose'

const tenantSchema = Joi.object({
  personalInfo: Joi.object({
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required()
  }).required(),
  unitId: Joi.string().required(),
  leaseInfo: Joi.object({
    monthlyRent: Joi.number().min(0).required(),
    leaseStartDate: Joi.date().required(),
    leaseEndDate: Joi.date().allow(null).optional()
  }).required(),
  status: Joi.string().valid('Active', 'Pending', 'Inactive').default('Active'),
  notes: Joi.string().allow('').default('')
})

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const body = await readBody(event)
    
    // Validate input
    const { error, value } = tenantSchema.validate(body)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    // Check if email already exists
    const existingTenant = await Tenant.findOne({ 'personalInfo.email': value.personalInfo.email })
    if (existingTenant) {
      throw createError({
        statusCode: 400,
        statusMessage: 'A tenant with this email already exists'
      })
    }

    // Validate unit exists and is available
    const unit = await Unit.findById(value.unitId)
    if (!unit) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Unit not found'
      })
    }

    if (unit.occupancyStatus === 'Occupied') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Unit is already occupied'
      })
    }

    // Execute with optional transaction based on MongoDB deployment type
    const result = await executeWithOptionalTransaction(async (session) => {
      // Get landlordId from the unit
      const landlordId = unit.landlordId
      
      // Create tenant
      const tenantData = {
        personalInfo: value.personalInfo,
        unitId: value.unitId,
        landlordId: landlordId,
        leaseInfo: value.leaseInfo,
        status: value.status,
        notes: value.notes
      }

      const tenant = new Tenant(tenantData)
      await tenant.save(session ? { session } : {})

      // Update unit status to occupied
      await Unit.findByIdAndUpdate(
        value.unitId,
        { 
          occupancyStatus: 'Occupied',
          status: 'Occupied'
        },
        session ? { session } : {}
      )
      
      // Populate the tenant data for response
      await tenant.populate('unitId')
      await tenant.populate('unitId.propertyId')

      return {
        success: true,
        data: tenant,
        message: 'Tenant created successfully'
      }
    })
    
    return result
  } catch (error: any) {
    console.error('Create tenant error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
