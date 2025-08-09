import { connectToDatabase } from '~/server/utils/database'
import { Invoice } from '~/server/models/Invoice'
import Tenant from '~/server/models/Tenant'
import Unit from '~/server/models/Unit'
import LandlordSettings from '~/server/models/LandlordSettings'
import AuditLog from '~/server/models/AuditLog'
import { getCurrentUser } from '~/server/utils/auth'
import { generateInvoiceNumber, generatePublicShareId } from '~/server/services/invoiceNumbering'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const currentUser = await getCurrentUser(event)
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    const body = await readBody(event)
    const { landlordId, cycle, filters = {} } = body
    
    // Verify access
    if (currentUser._id.toString() !== landlordId && currentUser.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }
    
    // Validate required fields
    if (!cycle || !cycle.month || !cycle.year) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing billing cycle (month/year)'
      })
    }
    
    // Get landlord settings
    let settings = await LandlordSettings.findOne({ landlordId: new ObjectId(landlordId) })
    if (!settings) {
      settings = new LandlordSettings({
        landlordId: new ObjectId(landlordId),
        displayName: currentUser.companyName || `${currentUser.firstName} ${currentUser.lastName}`,
        email: currentUser.email,
        phone: currentUser.phone,
        currency: currentUser.preferredCurrency || 'KES'
      })
      await settings.save()
    }
    
    // Build tenant query
    const tenantQuery: any = {
      landlordId: new ObjectId(landlordId),
      status: 'Active'
    }
    
    // Apply filters
    if (filters.propertyIds && filters.propertyIds.length > 0) {
      // Get units for the specified properties
      const units = await Unit.find({
        landlordId: new ObjectId(landlordId),
        propertyId: { $in: filters.propertyIds.map((id: string) => new ObjectId(id)) }
      })
      
      tenantQuery.unitId = { $in: units.map(unit => unit._id) }
    }
    
    if (filters.unitIds && filters.unitIds.length > 0) {
      tenantQuery.unitId = { $in: filters.unitIds.map((id: string) => new ObjectId(id)) }
    }
    
    // Get eligible tenants with their unit and property info
    const tenants = await Tenant.find(tenantQuery)
      .populate('unitId')
      .populate({
        path: 'unitId',
        populate: {
          path: 'propertyId'
        }
      })
    
    if (tenants.length === 0) {
      return {
        success: true,
        message: 'No eligible tenants found for bulk invoice generation',
        data: {
          generated: 0,
          skipped: 0,
          errors: []
        }
      }
    }
    
    // Calculate issue and due dates
    const issueDate = new Date()
    const dueDate = new Date()
    
    // Set due date based on default terms
    switch (settings.defaultTerms) {
      case 'Net 7':
        dueDate.setDate(dueDate.getDate() + 7)
        break
      case 'Net 14':
        dueDate.setDate(dueDate.getDate() + 14)
        break
      case 'Net 30':
        dueDate.setDate(dueDate.getDate() + 30)
        break
      case 'Due on Receipt':
        dueDate.setDate(dueDate.getDate())
        break
      default:
        dueDate.setDate(dueDate.getDate() + 30)
    }
    
    const results = {
      generated: 0,
      skipped: 0,
      errors: [] as string[]
    }
    
    const createdInvoices = []
    
    // Generate invoices for each tenant
    for (const tenant of tenants) {
      try {
        // Check if invoice already exists for this period
        const existingInvoice = await Invoice.findOne({
          landlordId: new ObjectId(landlordId),
          tenantId: tenant._id,
          issueDate: {
            $gte: new Date(cycle.year, cycle.month - 1, 1),
            $lt: new Date(cycle.year, cycle.month, 1)
          }
        })
        
        if (existingInvoice) {
          results.skipped++
          continue
        }
        
        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber({ landlordId: new ObjectId(landlordId) })
        
        // Create line items (rent + any additional charges)
        const lines = []
        let subtotal = 0
        
        // Monthly rent
        if (tenant.leaseInfo.monthlyRent > 0) {
          lines.push({
            type: 'rent',
            description: `Monthly Rent - ${getMonthName(cycle.month)} ${cycle.year}`,
            quantity: 1,
            unitPrice: tenant.leaseInfo.monthlyRent,
            taxRate: settings.vatRate || 0,
            lineTotal: tenant.leaseInfo.monthlyRent
          })
          subtotal += tenant.leaseInfo.monthlyRent
        }
        
        // Check for any outstanding balances or penalties
        // This would be calculated based on previous unpaid invoices
        
        // Calculate tax
        const taxableAmount = subtotal
        const tax = settings.taxInclusive 
          ? 0 
          : (taxableAmount * (settings.vatRate || 0) / 100)
        
        const total = settings.taxInclusive 
          ? subtotal 
          : subtotal + tax
        
        // Generate public share ID
        const publicShareId = generatePublicShareId()
        
        // Create invoice
        const invoice = new Invoice({
          invoiceNumber,
          landlordId: new ObjectId(landlordId),
          tenantId: tenant._id,
          propertyId: tenant.unitId.propertyId._id,
          issueDate,
          dueDate,
          lines,
          subtotal,
          tax,
          discount: 0,
          total,
          balance: total,
          currency: settings.currency,
          publicShareId,
          status: 'draft',
          
          // Legacy fields for backward compatibility
          items: lines.map(line => ({
            description: line.description,
            quantity: line.quantity,
            rate: line.unitPrice,
            amount: line.lineTotal
          })),
          taxRate: settings.vatRate || 0,
          taxAmount: tax,
          totalAmount: total
        })
        
        await invoice.save()
        createdInvoices.push(invoice)
        results.generated++
        
      } catch (error) {
        console.error(`Error generating invoice for tenant ${tenant._id}:`, error)
        results.errors.push(`Failed to generate invoice for ${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}: ${error.message}`)
      }
    }
    
    // Log bulk generation
    if (results.generated > 0) {
      await AuditLog.create({
        entityType: 'invoice',
        entityId: new ObjectId(), // Generic ID for bulk operations
        action: 'created',
        byUserId: currentUser._id,
        landlordId: new ObjectId(landlordId),
        payload: {
          bulkGeneration: true,
          cycle,
          generated: results.generated,
          skipped: results.skipped,
          filters
        },
        ipAddress: getClientIP(event),
        userAgent: getHeader(event, 'user-agent')
      })
    }
    
    return {
      success: true,
      message: `Bulk invoice generation completed. Generated: ${results.generated}, Skipped: ${results.skipped}`,
      data: {
        ...results,
        invoices: createdInvoices.map(inv => ({
          _id: inv._id,
          invoiceNumber: inv.invoiceNumber,
          tenantId: inv.tenantId,
          total: inv.total
        }))
      }
    }
    
  } catch (error) {
    console.error('Bulk invoice generation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate bulk invoices'
    })
  }
})

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || 'Unknown'
}
