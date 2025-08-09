import { connectToDatabase } from '~/server/utils/database'
import { Invoice } from '~/server/models/Invoice'
import Property from '~/server/models/Property'
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
    
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.tenantId || !body.propertyId || !body.issueDate || !body.dueDate || !body.items || body.items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }
    
    // Verify that the property belongs to the authenticated landlord
    const property = await Property.findOne({ _id: body.propertyId, landlordId: user._id })
    if (!property) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Property not found or access denied'
      })
    }
    
    // Generate invoice number
    const invoiceCount = await Invoice.countDocuments({})
    const invoiceNumber = `INV-${Date.now()}-${String(invoiceCount + 1).padStart(4, '0')}`
    
    // Create invoice object
    const invoice = new Invoice({
      invoiceNumber,
      tenantId: body.tenantId,
      propertyId: body.propertyId,
      issueDate: new Date(body.issueDate),
      dueDate: new Date(body.dueDate),
      items: body.items.map((item: any) => ({
        description: item.description,
        quantity: parseInt(item.quantity),
        rate: parseFloat(item.rate),
        amount: parseInt(item.quantity) * parseFloat(item.rate)
      })),
      subtotal: parseFloat(body.subtotal),
      taxRate: parseFloat(body.taxRate) || 0,
      taxAmount: parseFloat(body.taxAmount) || 0,
      discount: parseFloat(body.discount) || 0,
      totalAmount: parseFloat(body.totalAmount),
      notes: body.notes || '',
      status: 'draft'
    })
    
    await invoice.save()
    
    return {
      success: true,
      data: invoice
    }
  } catch (error) {
    console.error('Invoice creation error:', error)
    return {
      success: false,
      error: 'Failed to create invoice'
    }
  }
})
