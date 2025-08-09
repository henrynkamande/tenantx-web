export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    
    // Get all custom reports for the user
    const reports = await db.collection('custom_reports').find({}).sort({ createdAt: -1 }).toArray()
    
    // Get recent report results
    const recentResults = await db.collection('report_results')
      .find({})
      .sort({ generatedAt: -1 })
      .limit(10)
      .toArray()

    return {
      success: true,
      data: {
        reports,
        recentResults
      }
    }
  } catch (error) {
    console.error('Custom reports fetch error:', error)
    return {
      success: false,
      error: 'Failed to fetch custom reports'
    }
  }
})
