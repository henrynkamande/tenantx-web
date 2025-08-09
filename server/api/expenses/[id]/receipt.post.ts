import { connectToDatabase } from '~/server/utils/database'
import { Expense } from '~/server/models/Expense'
import Property from '~/server/models/Property'
import { Receipt } from '~/server/models/Receipt'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      return {
        success: false,
        error: 'Expense ID is required'
      }
    }
    
    // Get expense details
    const expense = await Expense.findById(id)
    
    if (!expense) {
      return {
        success: false,
        error: 'Expense not found'
      }
    }
    
    if (expense.status !== 'paid') {
      return {
        success: false,
        error: 'Receipt can only be generated for paid expenses'
      }
    }
    
    // Get property details
    const property = await Property.findById(expense.propertyId)
    
    // Generate receipt HTML
    const receiptHtml = generateReceiptHtml(expense, property)
    
    // Save receipt to database
    const receipt = new Receipt({
      expenseId: expense._id,
      receiptNumber: `RCP-${Date.now()}`,
      html: receiptHtml,
      type: 'expense'
    })
    
    await receipt.save()
    
    // Update expense with receipt reference
    expense.receiptId = receipt._id
    expense.receiptGenerated = true
    expense.updatedAt = new Date()
    await expense.save()
    
    // Convert to blob URL for viewing
    const receiptBlob = Buffer.from(receiptHtml, 'utf-8')
    const receiptUrl = `data:text/html;base64,${receiptBlob.toString('base64')}`
    
    return {
      success: true,
      data: {
        receiptId: receipt._id,
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
      <title>Payment Receipt - ${expense.description}</title>
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
        <div class="receipt-number">Receipt #${expense._id}</div>
        <div class="paid-stamp">✓ PAID</div>
      </div>
      
      <div class="details-section">
        <div class="section-title">Payment Details</div>
        <div class="detail-row">
          <span class="detail-label">Payment Date:</span>
          <span class="detail-value">${formatDate(expense.paidAt)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Expense Date:</span>
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
        <div class="total-amount">AMOUNT PAID: ${formatCurrency(expense.amount)}</div>
      </div>
      
      ${expense.notes ? `
        <div class="details-section">
          <div class="section-title">Notes</div>
          <div class="detail-value">${expense.notes}</div>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Receipt generated on ${formatDate(new Date())}</p>
        <p>TenantX Property Management System</p>
        <p><strong>This serves as proof of payment</strong></p>
      </div>
    </body>
    </html>
  `
}
