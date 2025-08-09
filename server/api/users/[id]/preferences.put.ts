import { connectToDatabase } from '~/server/utils/database'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const userId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { theme, language, timezone, notifications } = body
    
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
    
    // Update preferences
    const updatedPreferences = { ...user.preferences }
    
    if (theme) updatedPreferences.theme = theme
    if (language) updatedPreferences.language = language
    if (timezone) updatedPreferences.timezone = timezone
    if (notifications) updatedPreferences.notifications = { ...updatedPreferences.notifications, ...notifications }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        preferences: updatedPreferences,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password')
    
    return {
      success: true,
      data: updatedUser.preferences,
      message: 'Preferences updated successfully'
    }
  } catch (error) {
    console.error('Error updating preferences:', error)
    return {
      success: false,
      error: 'Failed to update preferences'
    }
  }
})
