import { connectToDatabase } from '~/server/utils/database'
import { generateInvoiceData, generateInvoiceTemplate } from '~/server/services/invoiceTemplate'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    const shareId = getRouterParam(event, 'shareId')
    
    if (!shareId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Share ID is required'
      })
    }
    
    // Find invoice by public share ID (no authentication required)
    const { Invoice } = await import('~/server/models/Invoice')
    const invoice = await Invoice.findOne({ 
      publicShareId: shareId,
      status: { $in: ['sent', 'partial', 'paid', 'overdue'] } // Only allow viewing of sent or processed invoices
    })
    
    if (!invoice) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invoice not found or not available for public viewing'
      })
    }
    
    // Generate invoice template data with landlord branding
    const templateData = await generateInvoiceData(invoice._id.toString())
    
    // Generate branded invoice HTML
    const invoiceHtml = await generateInvoiceTemplate(templateData)
    
    // For public view, we can either return the HTML directly or as a data URL
    const format = getQuery(event).format
    
    if (format === 'html') {
      // Return HTML directly for iframe embedding
      setHeader(event, 'content-type', 'text/html; charset=utf-8')
      return invoiceHtml
    }
    
    // Return as data URL (default)
    const invoiceBlob = Buffer.from(invoiceHtml, 'utf-8')
    const invoiceUrl = `data:text/html;base64,${invoiceBlob.toString('base64')}`
    
    return {
      success: true,
      data: {
        invoiceUrl,
        invoice: {
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          total: invoice.total || invoice.totalAmount,
          balance: invoice.balance,
          currency: invoice.currency,
          status: invoice.status
        },
        landlord: {
          displayName: templateData.settings?.displayName || templateData.landlord.companyName || `${templateData.landlord.firstName} ${templateData.landlord.lastName}`,
          email: templateData.settings?.email || templateData.landlord.email,
          phone: templateData.settings?.phone || templateData.landlord.phone
        },
        paymentMethods: templateData.paymentMethods.map(method => ({
          type: method.type,
          label: method.label,
          mpesa: method.mpesa,
          bank: method.bank,
          instructions: method.instructions,
          isDefault: method.isDefault
        }))
      }
    }
  } catch (error) {
    console.error('Public invoice view error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to view invoice'
    })
  }
})
