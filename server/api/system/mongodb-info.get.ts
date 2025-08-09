import { connectToDatabase } from '../../utils/database'
import { getMongoDBInfo } from '../../utils/mongodb-utils'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const mongoInfo = await getMongoDBInfo()
    
    return {
      success: true,
      data: mongoInfo
    }
  } catch (error: any) {
    console.error('MongoDB info error:', error)
    
    return {
      success: false,
      error: error.message || 'Failed to get MongoDB information'
    }
  }
})
