import { connectToDatabase } from '~/server/utils/database'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '~/server/utils/auth'
import { generateInvoiceData, generateInvoiceTemplate } from '~/server/services/invoiceTemplate'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invoice ID is required'
      })
    }
    
    // Authenticate user (landlord or tenant)
    const user = await getCurrentUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please log in'
      })
    }
    
    // Generate invoice template data with branding
    const templateData = await generateInvoiceData(id)
    
    // Verify access (invoice must belong to authenticated user - either landlord or tenant)
    const isLandlord = templateData.invoice.landlordId._id.toString() === user._id.toString()
    const isTenant = templateData.invoice.tenantId._id.toString() === user._id.toString()
    
    if (!isLandlord && !isTenant) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }
    
    // Generate branded invoice HTML
    const invoiceHtml = await generateInvoiceTemplate(templateData)
    
    // Convert to blob URL for viewing
    const invoiceBlob = Buffer.from(invoiceHtml, 'utf-8')
    const invoiceUrl = `data:text/html;base64,${invoiceBlob.toString('base64')}`
    
    return {
      success: true,
      data: {
        invoiceUrl,
        invoice: templateData.invoice,
        tenant: templateData.tenant,
        property: templateData.property,
        settings: templateData.settings
      }
    }
  } catch (error) {
    console.error('Invoice view error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to view invoice'
    })
  }
})

