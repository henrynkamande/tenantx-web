import { connectToDatabase } from '~/server/utils/database'
import { Expense } from '~/server/models/Expense'
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
    
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Expense ID is required'
      })
    }
    
    // Get expense details
    const expense = await Expense.findById(id)
    
    if (!expense) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense not found'
      })
    }
    
    // Verify that the expense's property belongs to the authenticated landlord
    const property = await Property.findOne({ _id: expense.propertyId, landlordId: user._id })
    if (!property) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }
    
    // Generate receipt HTML
    const receiptHtml = generateReceiptHtml(expense, property)
    
    // Convert to blob URL for viewing
    const receiptBlob = Buffer.from(receiptHtml, 'utf-8')
    const receiptUrl = `data:text/html;base64,${receiptBlob.toString('base64')}`
    
    return {
      success: true,
      data: {
        receiptUrl,
        expense,
        property
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

function generateReceiptHtml(expense: any, property: any) {
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
      <title>Expense Receipt - ${expense.description}</title>
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
        .amount-section {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .total-amount {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          text-align: center;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-paid {
          background: #dcfce7;
          color: #166534;
        }
        .status-approved {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .status-pending {
          background: #fef3c7;
          color: #92400e;
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
        <div class="receipt-title">EXPENSE RECEIPT</div>
        <div class="receipt-number">Receipt #${expense._id}</div>
      </div>
      
      <div class="details-section">
        <div class="section-title">Expense Details</div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${formatDate(expense.date)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Description:</span>
          <span class="detail-value">${expense.description}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Category:</span>
          <span class="detail-value">${expense.category}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Vendor:</span>
          <span class="detail-value">${expense.vendor || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value">
            <span class="status-badge status-${expense.status}">${expense.status}</span>
          </span>
        </div>
      </div>
      
      <div class="details-section">
        <div class="section-title">Property Information</div>
        <div class="detail-row">
          <span class="detail-label">Property:</span>
          <span class="detail-value">${property?.name || 'Unknown Property'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Address:</span>
          <span class="detail-value">${property?.address || 'N/A'}</span>
        </div>
      </div>
      
      <div class="amount-section">
        <div class="total-amount">${formatCurrency(expense.amount)}</div>
      </div>
      
      ${expense.notes ? `
        <div class="details-section">
          <div class="section-title">Notes</div>
          <div class="detail-value">${expense.notes}</div>
        </div>
      ` : ''}
      
      <div class="details-section">
        <div class="section-title">Payment Information</div>
        <div class="detail-row">
          <span class="detail-label">Payment Date:</span>
          <span class="detail-value">${expense.paidAt ? formatDate(expense.paidAt) : 'Not yet paid'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Approved Date:</span>
          <span class="detail-value">${expense.approvedAt ? formatDate(expense.approvedAt) : 'Not yet approved'}</span>
        </div>
      </div>
      
      <div class="footer">
        <p>Generated on ${formatDate(new Date())}</p>
        <p>TenantX Property Management System</p>
      </div>
    </body>
    </html>
  `
}
