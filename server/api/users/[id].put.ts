import { connectToDatabase } from '~/server/utils/database'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const userId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { name, email, role, isActive, permissions, preferences } = body
    
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required'
      }
    }
    
    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }
    
    // Update fields
    const updateData: any = { updatedAt: new Date() }
    
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive
    if (permissions) updateData.permissions = { ...user.permissions, ...permissions }
    if (preferences) updateData.preferences = { ...user.preferences, ...preferences }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('createdBy', 'name email')
    
    return {
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return {
      success: false,
      error: 'Failed to update user'
    }
  }
})
