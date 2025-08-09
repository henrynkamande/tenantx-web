import { connectToDatabase } from '../../utils/database'
import Maintenance from '../../models/Maintenance'
import Unit from '../../models/Unit'
import Property from '../../models/Property'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 50
    const search = query.search as string
    const status = query.status as string
    const priority = query.priority as string
    const skip = (page - 1) * limit

    // Build search filter
    let filter: any = {}
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    if (status) {
      filter.status = status
    }

    if (priority) {
      filter.priority = priority
    }

    // Get maintenance requests with pagination and populate related data
    const [requests, total] = await Promise.all([
      Maintenance.find(filter)
        .populate({
          path: 'unitId',
          populate: {
            path: 'propertyId',
            select: 'name address'
          }
        })
        .sort({ reportedDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Maintenance.countDocuments(filter)
    ])

    return {
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Get maintenance requests error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
