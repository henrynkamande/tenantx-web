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
    
    // Get invoice details first
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
    
    // Update invoice status to paid
    const result = await db.collection('invoices').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'paid',
          paidAt: new Date(),
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
    
    // Create payment record
    await db.collection('payments').insertOne({
      type: 'invoice',
      invoiceId: new ObjectId(id),
      tenantId: invoice.tenantId,
      propertyId: invoice.propertyId,
      amount: invoice.totalAmount,
      description: `Payment for invoice ${invoice.invoiceNumber}`,
      date: new Date(),
      status: 'completed',
      paymentMethod: 'manual', // Could be updated based on actual payment method
      createdAt: new Date()
    })
    
    return {
      success: true,
      message: 'Invoice marked as paid successfully'
    }
  } catch (error) {
    console.error('Invoice payment error:', error)
    return {
      success: false,
      error: 'Failed to mark invoice as paid'
    }
  }
})
