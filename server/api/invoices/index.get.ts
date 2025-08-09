import { connectToDatabase } from '~/server/utils/database'
import { Invoice } from '~/server/models/Invoice'
import Property from '~/server/models/Property'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get authenticated user
    const authHeader = getHeader(event, 'authorization')
    console.log('Invoice API - Auth header received:', authHeader ? 'Bearer token present' : 'No auth header')
    
    const user = await getCurrentUser(event)
    console.log('Invoice API - User authentication result:', user ? `User found: ${user._id}` : 'No user found')
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    // Get all properties owned by this landlord
    const landlordProperties = await Property.find({ landlordId: user._id }).select('_id')
    const propertyIds = landlordProperties.map(p => p._id.toString())
    
    if (propertyIds.length === 0) {
      // No properties, no invoices
      return {
        success: true,
        data: []
      }
    }
    
    const query = getQuery(event)
    
    // Build filter object - always filter by landlord's properties
    const filter: any = {
      propertyId: { $in: propertyIds }
    }
    
    if (query.status) {
      filter.status = query.status
    }
    
    if (query.tenant) {
      filter.tenantId = query.tenant
    }
    
    if (query.property) {
      // Ensure the requested property belongs to the authenticated landlord
      if (propertyIds.includes(query.property as string)) {
        filter.propertyId = query.property
      } else {
        // Property doesn't belong to this landlord
        return {
          success: true,
          data: []
        }
      }
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
    
    // Get invoices
    const invoices = await Invoice.find(filter).sort({ dueDate: -1 })
    
    return {
      success: true,
      data: invoices
    }
  } catch (error) {
    console.error('Invoices fetch error:', error)
    return {
      success: false,
      error: 'Failed to fetch invoices'
    }
  }
})
