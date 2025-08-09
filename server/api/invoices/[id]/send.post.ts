import { connectToDatabase } from '~/server/utils/database'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '~/server/utils/auth'
import { sendInvoiceEmail } from '~/server/services/emailService'
import { Invoice } from '~/server/models/Invoice'
import AuditLog from '~/server/models/AuditLog'

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
    
    // Authenticate landlord
    const landlord = await getCurrentUser(event)
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please log in'
      })
    }
    
    // Get invoice using Mongoose model
    const invoice = await Invoice.findById(id)
      .populate('landlordId')
      .populate('tenantId')
      .populate('propertyId')
    
    if (!invoice) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invoice not found'
      })
    }
    
    // Verify landlord access
    if (invoice.landlordId._id.toString() !== landlord._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }
    
    // Check if invoice can be sent (must be draft or sent status)
    if (!['draft', 'sent'].includes(invoice.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invoice cannot be sent in current status'
      })
    }
    
    // Get send options from request body
    const body = await readBody(event)
    const { 
      recipientEmail = invoice.tenantId.personalInfo?.email || invoice.tenantId.email, 
      ccEmails = [], 
      customMessage = '', 
      channels = ['email'] 
    } = body || {}
    
    let emailResult = null
    const results = {
      email: null,
      whatsapp: null
    }
    
    // Send via email if requested
    if (channels.includes('email')) {
      try {
        emailResult = await sendInvoiceEmail({
          invoiceId: id,
          recipientEmail,
          ccEmails,
          customMessage,
          attachPDF: true
        })
        results.email = {
          success: true,
          messageId: emailResult.messageId,
          recipientEmail: emailResult.recipientEmail,
          publicLink: emailResult.publicLink
        }
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError)
        results.email = {
          success: false,
          error: emailError.message
        }
      }
    }
    
    // Send via WhatsApp if requested (placeholder for future implementation)
    if (channels.includes('whatsapp')) {
      // TODO: Implement WhatsApp sending functionality
      results.whatsapp = {
        success: false,
        error: 'WhatsApp sending not yet implemented'
      }
    }
    
    // Update invoice status to sent
    invoice.status = 'sent'
    invoice.sentAt = new Date()
    await invoice.save()
    
    // Log the send action
    await AuditLog.create({
      entityType: 'invoice',
      entityId: invoice._id,
      action: 'sent',
      byUserId: landlord._id,
      landlordId: landlord._id,
      payload: {
        channels,
        recipientEmail: recipientEmail || invoice.tenantId.personalInfo?.email || invoice.tenantId.email,
        ccEmails: ccEmails || [],
        results
      },
      ipAddress: getClientIP(event),
      userAgent: getHeader(event, 'user-agent')
    })
    
    // Determine overall success
    const hasSuccessfulSend = Object.values(results).some(result => result?.success)
    
    if (!hasSuccessfulSend) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send invoice via any channel'
      })
    }
    
    return {
      success: true,
      message: 'Invoice sent successfully',
      data: {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        sentAt: invoice.sentAt,
        results,
        publicLink: emailResult?.publicLink
      }
    }
  } catch (error) {
    console.error('Invoice send error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to send invoice'
    })
  }
})
