import { connectToDatabase } from '~/server/utils/database'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const body = await readBody(event)
    const { name, email, password, role, companyId, createdBy, customPermissions } = body
    
    // Validate required fields
    if (!name || !email || !password || !role || !companyId) {
      return {
        success: false,
        error: 'Name, email, password, role, and company ID are required'
      }
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists'
      }
    }
    
    // Create user data
    const userData = {
      name,
      email,
      password,
      role,
      companyId,
      createdBy,
      isActive: true
    }
    
    // Create user
    const user = await User.create(userData)
    
    // If custom permissions are provided, update them
    if (customPermissions) {
      user.permissions = { ...user.permissions, ...customPermissions }
      await user.save()
    }
    
    // Return user without password
    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('createdBy', 'name email')
    
    return {
      success: true,
      data: userResponse,
      message: 'User created successfully'
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return {
      success: false,
      error: error.code === 11000 ? 'User with this email already exists' : 'Failed to create user'
    }
  }
})
