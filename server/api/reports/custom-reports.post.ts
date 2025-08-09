export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.name || !body.type) {
      return {
        success: false,
        error: 'Name and type are required'
      }
    }

    // Create the custom report
    const customReport = {
      name: body.name,
      description: body.description || '',
      type: body.type,
      dataSources: body.dataSources || [],
      outputFormat: body.outputFormat || 'table',
      createdAt: new Date(),
      lastRun: null,
      configuration: {
        filters: body.filters || {},
        groupBy: body.groupBy || [],
        sortBy: body.sortBy || 'name',
        dateRange: body.dateRange || 'current_month'
      }
    }

    const result = await db.collection('custom_reports').insertOne(customReport)
    
    if (result.insertedId) {
      customReport._id = result.insertedId
      return {
        success: true,
        data: customReport
      }
    }

    return {
      success: false,
      error: 'Failed to create custom report'
    }
  } catch (error) {
    console.error('Custom report creation error:', error)
    return {
      success: false,
      error: 'Failed to create custom report'
    }
  }
})
