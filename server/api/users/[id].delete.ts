import { connectToDatabase } from '~/server/utils/database'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const userId = getRouterParam(event, 'id')
    
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required'
      }
    }
    
    // Find and delete user
    const user = await User.findByIdAndDelete(userId)
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }
    
    return {
      success: true,
      message: 'User deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: 'Failed to delete user'
    }
  }
})
