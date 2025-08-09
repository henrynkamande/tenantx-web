import { connectToDatabase } from '../../utils/database'
import Maintenance from '../../models/Maintenance'
import Joi from 'joi'

const maintenanceSchema = Joi.object({
  propertyId: Joi.string().required(),
  unitId: Joi.string().required(),
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(2000).required(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Emergency').default('Medium'),
  category: Joi.string().valid('Plumbing', 'Electrical', 'HVAC', 'Appliances', 'Flooring', 'Painting', 'Windows/Doors', 'Roofing', 'Pest Control', 'Security', 'Landscaping', 'Other').allow(''),
  reportedDate: Joi.date().default(() => new Date()),
  status: Joi.string().valid('Open', 'In Progress', 'Completed', 'Cancelled').default('Open'),
  estimatedCost: Joi.number().min(0).allow(null),
  actualCost: Joi.number().min(0).allow(null),
  assignedTo: Joi.string().allow(''),
  assignedContact: Joi.string().allow(''),
  scheduledDate: Joi.date().allow(''),
  completedDate: Joi.date().allow(''),
  notes: Joi.string().allow('').default('')
})

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const body = await readBody(event)
    
    // Validate input
    const { error, value } = maintenanceSchema.validate(body)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    // Create maintenance request object
    const maintenanceData = {
      unitId: value.unitId,
      title: value.title,
      description: value.description,
      priority: value.priority,
      category: value.category || 'Other',
      reportedDate: value.reportedDate,
      status: value.status,
      estimatedCost: value.estimatedCost || null,
      actualCost: value.actualCost || null,
      assignedTo: value.assignedTo || null,
      assignedContact: value.assignedContact || null,
      scheduledDate: value.scheduledDate || null,
      completedDate: value.completedDate || null,
      notes: value.notes
    }

    // Create maintenance request
    const maintenance = new Maintenance(maintenanceData)
    await maintenance.save()

    // Populate the maintenance request with unit and property info for response
    await maintenance.populate({
      path: 'unitId',
      populate: {
        path: 'propertyId',
        select: 'name address'
      }
    })

    return {
      success: true,
      data: maintenance,
      message: 'Maintenance request created successfully'
    }
  } catch (error: any) {
    console.error('Create maintenance request error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
