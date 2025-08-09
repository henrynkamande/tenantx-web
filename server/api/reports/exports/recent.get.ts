export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    
    // Get recent export results
    const recentExports = await db.collection('report_results')
      .find({})
      .sort({ generatedAt: -1 })
      .limit(10)
      .toArray()

    // Transform data for response
    const transformedExports = recentExports.map(export_ => ({
      id: export_._id,
      name: export_.reportName,
      format: export_.format || 'pdf',
      createdAt: export_.generatedAt,
      downloadUrl: `/api/reports/exports/${export_._id}/download`
    }))

    return {
      success: true,
      data: transformedExports
    }
  } catch (error) {
    console.error('Recent exports fetch error:', error)
    return {
      success: false,
      error: 'Failed to fetch recent exports'
    }
  }
})
