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
    
    // Get invoice details
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
    
    // Get tenant details
    const tenant = await db.collection('tenants').findOne({ _id: new ObjectId(invoice.tenantId) })
    
    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHtml(invoice, tenant, property)
    
    // Convert to blob URL for viewing
    const invoiceBlob = Buffer.from(invoiceHtml, 'utf-8')
    const invoiceUrl = `data:text/html;base64,${invoiceBlob.toString('base64')}`
    
    return {
      success: true,
      data: {
        invoiceUrl,
        invoice,
        tenant,
        property
      }
    }
  } catch (error) {
    console.error('Invoice view error:', error)
    return {
      success: false,
      error: 'Failed to view invoice'
    }
  }
})

function generateInvoiceHtml(invoice: any, tenant: any, property: any) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          color: #333;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .company-info h1 {
          font-size: 32px;
          margin: 0 0 10px 0;
          color: #2563eb;
        }
        .company-info p {
          margin: 5px 0;
          color: #666;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-info h2 {
          font-size: 28px;
          margin: 0 0 10px 0;
          color: #333;
        }
        .invoice-info p {
          margin: 5px 0;
        }
        .billing-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .billing-info {
          width: 45%;
        }
        .billing-info h3 {
          font-size: 18px;
          margin-bottom: 15px;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .billing-info p {
          margin: 8px 0;
          line-height: 1.4;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #333;
        }
        .items-table td:last-child,
        .items-table th:last-child {
          text-align: right;
        }
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }
        .totals {
          width: 300px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row.final {
          border-bottom: 2px solid #333;
          font-weight: bold;
          font-size: 18px;
          color: #2563eb;
        }
        .notes-section {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .notes-section h3 {
          margin-bottom: 10px;
          color: #333;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-draft {
          background: #f3f4f6;
          color: #374151;
        }
        .status-sent {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .status-paid {
          background: #dcfce7;
          color: #166534;
        }
        .status-overdue {
          background: #fee2e2;
          color: #dc2626;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body {
            margin: 0;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>TenantX</h1>
          <p>Property Management System</p>
          <p>123 Main Street</p>
          <p>City, State 12345</p>
          <p>Phone: (555) 123-4567</p>
        </div>
        <div class="invoice-info">
          <h2>INVOICE</h2>
          <p><strong>${invoice.invoiceNumber}</strong></p>
          <p>Issue Date: ${formatDate(invoice.issueDate)}</p>
          <p>Due Date: ${formatDate(invoice.dueDate)}</p>
          <p><span class="status-badge status-${invoice.status}">${invoice.status}</span></p>
        </div>
      </div>
      
      <div class="billing-section">
        <div class="billing-info">
          <h3>Bill To:</h3>
          <p><strong>${tenant?.name || 'Unknown Tenant'}</strong></p>
          <p>${tenant?.email || ''}</p>
          <p>${tenant?.phone || ''}</p>
          <p>${tenant?.address || ''}</p>
        </div>
        <div class="billing-info">
          <h3>Property:</h3>
          <p><strong>${property?.name || 'Unknown Property'}</strong></p>
          <p>${property?.address || ''}</p>
          <p>${property?.city || ''}, ${property?.state || ''} ${property?.zipCode || ''}</p>
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item: any) => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.rate)}</td>
              <td>${formatCurrency(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals-section">
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
          ${invoice.discount > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-${formatCurrency(invoice.discount)}</span>
            </div>
          ` : ''}
          ${invoice.taxAmount > 0 ? `
            <div class="total-row">
              <span>Tax (${invoice.taxRate}%):</span>
              <span>${formatCurrency(invoice.taxAmount)}</span>
            </div>
          ` : ''}
          <div class="total-row final">
            <span>Total:</span>
            <span>${formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>
      </div>
      
      ${invoice.notes ? `
        <div class="notes-section">
          <h3>Notes:</h3>
          <p>${invoice.notes}</p>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Payment due within 30 days of invoice date.</p>
        <p>Generated on ${formatDate(new Date())}</p>
      </div>
    </body>
    </html>
  `
}
