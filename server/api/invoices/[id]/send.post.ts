import { connectToDatabase } from '~/server/utils/database'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      return {
        success: false,
        error: 'Invoice ID is required'
      }
    }
    
    // Authenticate landlord
    const landlord = await getCurrentUser(event)
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please log in'
      })
    }
    
    // Get invoice details first to verify ownership
    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(id) })
    
    if (!invoice) {
      return {
        success: false,
        error: 'Invoice not found'
      }
    }
    
    // Verify property ownership
    const property = await db.collection('properties').findOne({ 
      _id: new ObjectId(invoice.propertyId),
      landlordId: new ObjectId(landlord._id) 
    })
    
    if (!property) {
      return {
        success: false,
        error: 'Property not found or access denied'
      }
    }
    
    // Update invoice status to sent
    const result = await db.collection('invoices').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'sent',
          sentAt: new Date(),
          updatedAt: new Date()
        }
      }
    )
    
    if (result.matchedCount === 0) {
      return {
        success: false,
        error: 'Invoice not found'
      }
    }
    
    // In a real implementation, you would:
    // 1. Generate the invoice PDF
    // 2. Send email to tenant with the invoice
    // 3. Log the email sending activity
    
    return {
      success: true,
      message: 'Invoice sent successfully'
    }
  } catch (error) {
    console.error('Invoice send error:', error)
    return {
      success: false,
      error: 'Failed to send invoice'
    }
  }
})
