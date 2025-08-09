import { connectToDatabase } from '~/server/utils/database'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const query = getQuery(event)
    const { role, isActive, search, page = 1, limit = 10 } = query
    
    // Build filter
    const filter: any = {}
    
    if (role) filter.role = role
    if (isActive !== undefined) filter.isActive = isActive === 'true'
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password') // Exclude password from response
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
    
    // Get total count for pagination
    const total = await User.countDocuments(filter)
    
    return {
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      success: false,
      error: 'Failed to fetch users'
    }
  }
})
