import { connectToDatabase } from '~/server/utils/database'
import { Invoice } from '~/server/models/Invoice'
import Property from '~/server/models/Property'
import Tenant from '~/server/models/Tenant'
import LandlordSettings from '~/server/models/LandlordSettings'
import AuditLog from '~/server/models/AuditLog'
import { getCurrentUser } from '~/server/utils/auth'
import { generateInvoiceNumber, generatePublicShareId } from '~/server/services/invoiceNumbering'
import { ObjectId } from 'mongodb'

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
    
    // Validate required fields - support both legacy items and new lines format
    const hasItems = (body.items && body.items.length > 0) || (body.lines && body.lines.length > 0)
    if (!body.tenantId || !body.propertyId || !body.issueDate || !body.dueDate || !hasItems) {
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
    
    // Verify tenant belongs to this landlord
    const tenant = await Tenant.findOne({ _id: body.tenantId, landlordId: user._id })
    if (!tenant) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Tenant not found or access denied'
      })
    }
    
    // Get landlord settings for tax and currency defaults
    let settings = await LandlordSettings.findOne({ landlordId: user._id })
    if (!settings) {
      settings = new LandlordSettings({
        landlordId: user._id,
        displayName: user.companyName || `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        currency: user.preferredCurrency || 'KES'
      })
      await settings.save()
    }
    
    // Generate landlord-specific invoice number
    const invoiceNumber = await generateInvoiceNumber({ landlordId: new ObjectId(user._id) })
    
    // Process line items (support both legacy and new format)
    let lines = []
    let items = [] // Legacy format for backward compatibility
    let subtotal = 0
    
    if (body.lines && body.lines.length > 0) {
      // New format with detailed line items
      lines = body.lines.map((line: any) => {
        const lineTotal = (parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0)
        subtotal += lineTotal
        
        return {
          type: line.type || 'other',
          description: line.description,
          quantity: parseFloat(line.quantity) || 0,
          unitPrice: parseFloat(line.unitPrice) || 0,
          taxRate: parseFloat(line.taxRate) || settings.vatRate || 0,
          lineTotal
        }
      })
      
      // Also populate legacy items for backward compatibility
      items = lines.map(line => ({
        description: line.description,
        quantity: line.quantity,
        rate: line.unitPrice,
        amount: line.lineTotal
      }))
    } else if (body.items && body.items.length > 0) {
      // Legacy format
      items = body.items.map((item: any) => {
        const amount = (parseInt(item.quantity) || 0) * (parseFloat(item.rate) || 0)
        subtotal += amount
        
        return {
          description: item.description,
          quantity: parseInt(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          amount
        }
      })
      
      // Convert to new format
      lines = items.map(item => ({
        type: 'other',
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.rate,
        taxRate: parseFloat(body.taxRate) || settings.vatRate || 0,
        lineTotal: item.amount
      }))
    }
    
    // Calculate totals
    const discount = parseFloat(body.discount) || 0
    const taxableAmount = subtotal - discount
    const tax = body.taxAmount ? parseFloat(body.taxAmount) : (taxableAmount * (settings.vatRate || 0) / 100)
    const total = settings.taxInclusive 
      ? Math.max(subtotal - discount, 0) // Tax already included
      : Math.max(taxableAmount + tax, 0) // Add tax to total
    
    // Generate public share ID for secure sharing
    const publicShareId = generatePublicShareId()
    
    // Create invoice object with both legacy and new fields
    const invoice = new Invoice({
      invoiceNumber,
      landlordId: new ObjectId(user._id),
      tenantId: new ObjectId(body.tenantId),
      leaseId: body.leaseId ? new ObjectId(body.leaseId) : undefined,
      propertyId: new ObjectId(body.propertyId),
      issueDate: new Date(body.issueDate),
      dueDate: new Date(body.dueDate),
      
      // New structure
      lines,
      subtotal,
      tax,
      discount,
      total,
      balance: total, // Initially, balance equals total
      currency: settings.currency,
      publicShareId,
      
      // Legacy fields for backward compatibility
      items,
      taxRate: parseFloat(body.taxRate) || settings.vatRate || 0,
      taxAmount: tax,
      totalAmount: total,
      
      notes: body.notes || '',
      status: 'draft'
    })
    
    await invoice.save()
    
    // Log the creation
    await AuditLog.create({
      entityType: 'invoice',
      entityId: invoice._id,
      action: 'created',
      byUserId: user._id,
      landlordId: user._id,
      payload: {
        invoiceNumber: invoice.invoiceNumber,
        tenantId: body.tenantId,
        total: invoice.total,
        status: invoice.status
      },
      ipAddress: getClientIP(event),
      userAgent: getHeader(event, 'user-agent')
    })
    
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
