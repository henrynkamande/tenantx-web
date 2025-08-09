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
    
    if (invoice.status !== 'paid') {
      return {
        success: false,
        error: 'Receipt can only be generated for paid invoices'
      }
    }
    
    // Get tenant details
    const tenant = await db.collection('tenants').findOne({ _id: new ObjectId(invoice.tenantId) })
    
    // Generate receipt HTML
    const receiptHtml = generateReceiptHtml(invoice, tenant, property)
    
    // Save receipt to database
    const receipt = {
      invoiceId: new ObjectId(id),
      receiptNumber: `RCP-${Date.now()}`,
      html: receiptHtml,
      generatedAt: new Date(),
      type: 'invoice'
    }
    
    const receiptResult = await db.collection('receipts').insertOne(receipt)
    
    // Update invoice with receipt reference
    await db.collection('invoices').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          receiptId: receiptResult.insertedId,
          receiptGenerated: true,
          updatedAt: new Date()
        }
      }
    )
    
    // Convert to blob URL for viewing
    const receiptBlob = Buffer.from(receiptHtml, 'utf-8')
    const receiptUrl = `data:text/html;base64,${receiptBlob.toString('base64')}`
    
    return {
      success: true,
      data: {
        receiptId: receiptResult.insertedId,
        receiptUrl,
        receiptNumber: receipt.receiptNumber
      }
    }
  } catch (error) {
    console.error('Receipt generation error:', error)
    return {
      success: false,
      error: 'Failed to generate receipt'
    }
  }
})

function generateReceiptHtml(invoice: any, tenant: any, property: any) {
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
      <title>Payment Receipt - ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .receipt-title {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }
        .receipt-number {
          font-size: 14px;
          color: #666;
        }
        .paid-stamp {
          background: #10b981;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          font-weight: bold;
          font-size: 16px;
          margin: 20px 0;
          text-align: center;
        }
        .details-section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
        }
        .detail-label {
          font-weight: bold;
          color: #555;
        }
        .detail-value {
          color: #333;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th,
        .items-table td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .items-table td:last-child,
        .items-table th:last-child {
          text-align: right;
        }
        .amount-section {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border: 2px solid #10b981;
        }
        .total-amount {
          font-size: 24px;
          font-weight: bold;
          color: #10b981;
          text-align: center;
        }
        .footer {
          margin-top: 40px;
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
        <div class="receipt-title">PAYMENT RECEIPT</div>
        <div class="receipt-number">Receipt for Invoice ${invoice.invoiceNumber}</div>
        <div class="paid-stamp">✓ PAYMENT RECEIVED</div>
      </div>
      
      <div class="details-section">
        <div class="section-title">Payment Information</div>
        <div class="detail-row">
          <span class="detail-label">Payment Date:</span>
          <span class="detail-value">${formatDate(invoice.paidAt)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Invoice Number:</span>
          <span class="detail-value">${invoice.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Invoice Date:</span>
          <span class="detail-value">${formatDate(invoice.issueDate)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Due Date:</span>
          <span class="detail-value">${formatDate(invoice.dueDate)}</span>
        </div>
      </div>
      
      <div class="details-section">
        <div class="section-title">Tenant Information</div>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${tenant?.name || 'Unknown Tenant'}</span>
        </div>  
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${tenant?.email || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Property:</span>
          <span class="detail-value">${property?.name || 'Unknown Property'}</span>
        </div>
      </div>
      
      <div class="details-section">
        <div class="section-title">Payment Details</div>
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
        
        <div style="text-align: right; margin-top: 10px;">
          <div style="margin-bottom: 5px;">
            <strong>Subtotal: ${formatCurrency(invoice.subtotal)}</strong>
          </div>
          ${invoice.discount > 0 ? `
            <div style="margin-bottom: 5px;">
              <strong>Discount: -${formatCurrency(invoice.discount)}</strong>
            </div>
          ` : ''}
          ${invoice.taxAmount > 0 ? `
            <div style="margin-bottom: 5px;">
              <strong>Tax: ${formatCurrency(invoice.taxAmount)}</strong>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="amount-section">
        <div class="total-amount">TOTAL PAID: ${formatCurrency(invoice.totalAmount)}</div>
      </div>
      
      ${invoice.notes ? `
        <div class="details-section">
          <div class="section-title">Notes</div>
          <div class="detail-value">${invoice.notes}</div>
        </div>
      ` : ''}
      
      <div class="footer">
        <p><strong>Thank you for your payment!</strong></p>
        <p>Receipt generated on ${formatDate(new Date())}</p>
        <p>TenantX Property Management System</p>
        <p><strong>This serves as proof of payment</strong></p>
      </div>
    </body>
    </html>
  `
}
