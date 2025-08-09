import { connectToDatabase } from '~/server/utils/database'
import LandlordSettings from '~/server/models/LandlordSettings'
import { getCurrentUser } from '~/server/utils/auth'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const currentUser = await getCurrentUser(event)
    
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    // Use the logged-in user's ID for settings
    const landlordId = currentUser._id.toString()
    
    let settings = await LandlordSettings.findOne({ landlordId: new ObjectId(landlordId) })
    
    // Create default settings if none exist
    if (!settings) {
      settings = new LandlordSettings({
        landlordId: new ObjectId(landlordId),
        displayName: currentUser.companyName || `${currentUser.firstName} ${currentUser.lastName}`,
        email: currentUser.email,
        phone: currentUser.phone,
        currency: currentUser.preferredCurrency || 'KES'
      })
      await settings.save()
    }
    
    return {
      success: true,
      data: settings
    }
  } catch (error) {
    console.error('Error fetching landlord settings:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch settings'
    })
  }
})
