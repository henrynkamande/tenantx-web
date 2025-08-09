import { connectToDatabase } from '~/server/utils/database'
import { getCurrentUser } from '~/server/utils/auth'
import { generateInvoicePDF } from '~/server/services/pdfGenerator'
import { generateInvoiceData } from '~/server/services/invoiceTemplate'

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
    
    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(id)
    
    // Return different response based on the Accept header
    const acceptHeader = getHeader(event, 'accept')
    if (acceptHeader && acceptHeader.includes('application/json')) {
      // If JSON is requested, return base64 data
      const base64PDF = pdfBuffer.toString('base64')
      const dataUrl = `data:application/pdf;base64,${base64PDF}`
      const filename = `Invoice-${templateData.invoice.invoiceNumber}.pdf`
      
      return {
        success: true,
        data: {
          downloadUrl: dataUrl,
          filename: filename,
          invoiceNumber: templateData.invoice.invoiceNumber
        }
      }
    } else {
      // Otherwise return the PDF directly
      setHeader(event, 'Content-Type', 'application/pdf')
      setHeader(event, 'Content-Disposition', `attachment; filename="Invoice-${templateData.invoice.invoiceNumber}.pdf"`)
      setHeader(event, 'Content-Length', pdfBuffer.length.toString())
      
      return pdfBuffer
    }
  } catch (error) {
    console.error('Invoice PDF download error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to generate PDF'
    })
  }
})
