import { connectToDatabase } from '~/server/utils/database'
import { Invoice } from '~/server/models/Invoice'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get authenticated user
    const user = await getCurrentUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    // Ensure the user is a tenant
    if (user.role !== 'tenant') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied - Tenant access required'
      })
    }
    
    const query = getQuery(event)
    
    // Build filter object for tenant's invoices only
    const filter: any = {
      tenantId: user._id
    }
    
    if (query.status) {
      filter.status = query.status
    }
    
    if (query.dateRange) {
      const now = new Date()

      switch (query.dateRange) {
        case 'this_month':
          filter.issueDate = {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
          break
        case 'last_month':
          filter.issueDate = {
            $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            $lte: new Date(now.getFullYear(), now.getMonth(), 0)
          }
          break
        case 'this_quarter':
          const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
          filter.issueDate = {
            $gte: quarterStart
          }
          break
        case 'this_year':
          filter.issueDate = {
            $gte: new Date(now.getFullYear(), 0, 1)
          }
          break
      }
    }
    
    // Get invoices for this tenant only
    const invoices = await Invoice.find(filter)
      .populate('propertyId', 'name address')
      .sort({ dueDate: -1 })
    
    return {
      success: true,
      data: invoices
    }
  } catch (error) {
    console.error('Tenant invoices fetch error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch invoices'
    })
  }
})
