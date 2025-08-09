import LandlordSettings from '~/server/models/LandlordSettings'
import PaymentMethod from '~/server/models/PaymentMethod'
import Landlord from '~/server/models/Landlord'
import { ObjectId } from 'mongodb'

export interface InvoiceTemplateData {
  invoice: any
  landlord: any
  tenant: any
  property: any
  settings: any
  paymentMethods: any[]
}

export async function generateInvoiceTemplate(data: InvoiceTemplateData): Promise<string> {
  const { invoice, landlord, tenant, property, settings, paymentMethods } = data
  
  const formatCurrency = (amount: number, currency = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // Generate payment instructions
  const paymentInstructions = paymentMethods.map(method => {
    switch (method.type) {
      case 'mpesa':
        return `
          <div class="payment-method">
            <h4 class="payment-method-title">${method.label}</h4>
            ${method.mpesa.paybill ? `<p><strong>Paybill:</strong> ${method.mpesa.paybill}</p>` : ''}
            ${method.mpesa.till ? `<p><strong>Till Number:</strong> ${method.mpesa.till}</p>` : ''}
            <p><strong>Account Reference:</strong> ${invoice.invoiceNumber}</p>
            ${method.mpesa.accountRefHint ? `<p class="text-sm text-gray-600">${method.mpesa.accountRefHint}</p>` : ''}
          </div>
        `
      case 'bank':
        return `
          <div class="payment-method">
            <h4 class="payment-method-title">${method.label}</h4>
            ${method.bank.bankName ? `<p><strong>Bank:</strong> ${method.bank.bankName}</p>` : ''}
            ${method.bank.accountName ? `<p><strong>Account Name:</strong> ${method.bank.accountName}</p>` : ''}
            ${method.bank.accountNumber ? `<p><strong>Account Number:</strong> ${method.bank.accountNumber}</p>` : ''}
            ${method.bank.branch ? `<p><strong>Branch:</strong> ${method.bank.branch}</p>` : ''}
            ${method.bank.swift ? `<p><strong>SWIFT Code:</strong> ${method.bank.swift}</p>` : ''}
            <p><strong>Reference:</strong> ${invoice.invoiceNumber}</p>
          </div>
        `
      default:
        return `
          <div class="payment-method">
            <h4 class="payment-method-title">${method.label}</h4>
            ${method.instructions ? `<p>${method.instructions}</p>` : ''}
            <p><strong>Reference:</strong> ${invoice.invoiceNumber}</p>
          </div>
        `
    }
  }).join('')
  
  // Generate QR code URL for M-Pesa if available
  const mpesaMethod = paymentMethods.find(m => m.type === 'mpesa' && m.mpesa.paybill)
  const qrCodeUrl = mpesaMethod ? 
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PAY%20BILL%20${mpesaMethod.mpesa.paybill}%20${invoice.invoiceNumber}%20${invoice.total}` : null
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Invoice - ${invoice.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
          padding: 20px;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .header {
          background: ${settings.brandColor || '#2563eb'};
          color: white;
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .company-info h1 {
          font-size: 28px;
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .company-info p {
          margin: 4px 0;
          opacity: 0.9;
        }
        
        .logo {
          max-height: 80px;
          max-width: 200px;
        }
        
        .invoice-info {
          text-align: right;
        }
        
        .invoice-info h2 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .invoice-info p {
          margin: 4px 0;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          margin-top: 10px;
        }
        
        .status-draft { background: rgba(255,255,255,0.2); }
        .status-sent { background: rgba(59,130,246,0.2); }
        .status-paid { background: rgba(34,197,94,0.2); }
        .status-overdue { background: rgba(239,68,68,0.2); }
        
        .content {
          padding: 30px;
        }
        
        .billing-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 40px;
        }
        
        .billing-info {
          flex: 1;
        }
        
        .billing-info h3 {
          font-size: 16px;
          margin-bottom: 15px;
          color: ${settings.brandColor || '#2563eb'};
          border-bottom: 2px solid ${settings.brandColor || '#2563eb'};
          padding-bottom: 5px;
        }
        
        .billing-info p {
          margin: 6px 0;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .items-table th,
        .items-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table th {
          background-color: #f9fafb;
          font-weight: bold;
          color: #374151;
        }
        
        .items-table td:last-child,
        .items-table th:last-child {
          text-align: right;
        }
        
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        
        .totals {
          width: 300px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .total-row.final {
          border-bottom: 2px solid ${settings.brandColor || '#2563eb'};
          font-weight: bold;
          font-size: 18px;
          color: ${settings.brandColor || '#2563eb'};
          margin-top: 10px;
          padding-top: 15px;
        }
        
        .payment-section {
          background: #f9fafb;
          padding: 25px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .payment-section h3 {
          color: ${settings.brandColor || '#2563eb'};
          margin-bottom: 20px;
          font-size: 18px;
        }
        
        .payment-methods {
          display: grid;
          gap: 20px;
        }
        
        .payment-method {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid ${settings.brandColor || '#2563eb'};
        }
        
        .payment-method-title {
          color: ${settings.brandColor || '#2563eb'};
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .payment-method p {
          margin: 4px 0;
        }
        
        .qr-section {
          text-align: center;
          margin: 20px 0;
        }
        
        .qr-code {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px;
        }
        
        .notes-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #fefce8;
          border-radius: 8px;
          border-left: 4px solid #eab308;
        }
        
        .notes-section h3 {
          margin-bottom: 10px;
          color: #92400e;
        }
        
        .footer {
          text-align: center;
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        
        .signature {
          max-height: 60px;
          margin-top: 20px;
        }
        
        .legal-footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .invoice-container {
            box-shadow: none;
            border-radius: 0;
          }
          
          .payment-section {
            break-inside: avoid;
          }
        }
        
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 20px;
          }
          
          .invoice-info {
            text-align: left;
          }
          
          .billing-section {
            flex-direction: column;
            gap: 20px;
          }
          
          .items-table {
            font-size: 14px;
          }
          
          .items-table th,
          .items-table td {
            padding: 10px 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-info">
            ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="Logo" class="logo">` : `<h1>${settings.displayName || landlord.companyName || `${landlord.firstName} ${landlord.lastName}`}</h1>`}
            <p>${settings.address?.street || ''}</p>
            <p>${settings.address?.city || ''}, ${settings.address?.state || ''} ${settings.address?.zipCode || ''}</p>
            <p>${settings.address?.country || 'Kenya'}</p>
            <p>Email: ${settings.email || landlord.email}</p>
            <p>Phone: ${settings.phone || landlord.phone}</p>
            ${settings.kraPin ? `<p>KRA PIN: ${settings.kraPin}</p>` : ''}
            ${settings.vatNumber ? `<p>VAT Number: ${settings.vatNumber}</p>` : ''}
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>${invoice.invoiceNumber}</strong></p>
            <p>Issue Date: ${formatDate(invoice.issueDate)}</p>
            <p>Due Date: ${formatDate(invoice.dueDate)}</p>
            <span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="content">
          <div class="billing-section">
            <div class="billing-info">
              <h3>Bill To:</h3>
              <p><strong>${tenant.personalInfo?.firstName || tenant.name || 'Unknown'} ${tenant.personalInfo?.lastName || ''}</strong></p>
              <p>${tenant.personalInfo?.email || tenant.email || ''}</p>
              <p>${tenant.personalInfo?.phone || tenant.phone || ''}</p>
              ${property ? `
                <p><strong>Property:</strong> ${property.name}</p>
                <p>${property.address?.street || ''}</p>
                <p>${property.address?.city || ''}, ${property.address?.state || ''}</p>
              ` : ''}
            </div>
            
            <div class="billing-info">
              <h3>Invoice Details:</h3>
              <p><strong>Currency:</strong> ${invoice.currency || settings.currency || 'KES'}</p>
              <p><strong>Payment Terms:</strong> ${settings.defaultTerms || 'Net 30'}</p>
              ${settings.graceDays > 0 ? `<p><strong>Grace Period:</strong> ${settings.graceDays} days</p>` : ''}
              ${settings.lateFeeType && settings.lateFeeValue > 0 ? `
                <p><strong>Late Fee:</strong> ${settings.lateFeeType === 'percent' ? `${settings.lateFeeValue}%` : formatCurrency(settings.lateFeeValue, invoice.currency)}</p>
              ` : ''}
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center; width: 100px;">Qty</th>
                <th style="text-align: right; width: 120px;">Unit Price</th>
                <th style="text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.lines || invoice.items || []).map((item: any) => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(item.unitPrice || item.rate, invoice.currency)}</td>
                  <td style="text-align: right;">${formatCurrency(item.lineTotal || item.amount, invoice.currency)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals-section">
            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(invoice.subtotal || 0, invoice.currency)}</span>
              </div>
              ${invoice.discount > 0 ? `
                <div class="total-row">
                  <span>Discount:</span>
                  <span>-${formatCurrency(invoice.discount, invoice.currency)}</span>
                </div>
              ` : ''}
              ${invoice.tax > 0 || invoice.taxAmount > 0 ? `
                <div class="total-row">
                  <span>VAT (${invoice.taxRate || settings.vatRate || 0}%):</span>
                  <span>${formatCurrency(invoice.tax || invoice.taxAmount || 0, invoice.currency)}</span>
                </div>
              ` : ''}
              <div class="total-row final">
                <span>Total Amount:</span>
                <span>${formatCurrency(invoice.total || invoice.totalAmount || 0, invoice.currency)}</span>
              </div>
              ${invoice.balance !== undefined && invoice.balance !== (invoice.total || invoice.totalAmount) ? `
                <div class="total-row" style="color: #dc2626; font-weight: bold;">
                  <span>Balance Due:</span>
                  <span>${formatCurrency(invoice.balance, invoice.currency)}</span>
                </div>
              ` : ''}
            </div>
          </div>
          
          ${paymentMethods.length > 0 ? `
            <div class="payment-section">
              <h3>Payment Information</h3>
              <div class="payment-methods">
                ${paymentInstructions}
              </div>
              
              ${qrCodeUrl ? `
                <div class="qr-section">
                  <p><strong>Scan to Pay via M-Pesa:</strong></p>
                  <img src="${qrCodeUrl}" alt="M-Pesa QR Code" class="qr-code">
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          ${invoice.notes ? `
            <div class="notes-section">
              <h3>Notes:</h3>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}
          
          <div class="footer">
            ${settings.signatureUrl ? `<img src="${settings.signatureUrl}" alt="Signature" class="signature">` : ''}
            
            <div class="legal-footer">
              <p><strong>Thank you for your business!</strong></p>
              <p>This invoice was generated on ${formatDate(new Date())}</p>
              ${settings.graceDays > 0 ? `<p>Payment is due within ${settings.graceDays} days to avoid late fees.</p>` : ''}
              ${settings.lateFeeType && settings.lateFeeValue > 0 ? `
                <p>Late payments will incur a ${settings.lateFeeType === 'percent' ? `${settings.lateFeeValue}% fee` : `${formatCurrency(settings.lateFeeValue, invoice.currency)} flat fee`}.</p>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function generateInvoiceData(invoiceId: string): Promise<InvoiceTemplateData> {
  const { connectToDatabase } = await import('~/server/utils/database')
  const { Invoice } = await import('~/server/models/Invoice')
  
  await connectToDatabase()
  
  // Get invoice with populated references
  const invoice = await Invoice.findById(invoiceId)
    .populate('landlordId')
    .populate('tenantId') 
    .populate('propertyId')
  
  if (!invoice) {
    throw new Error('Invoice not found')
  }
  
  // Get landlord settings
  const settings = await LandlordSettings.findOne({ landlordId: invoice.landlordId._id })
  
  // Get payment methods
  const paymentMethods = await PaymentMethod.find({
    landlordId: invoice.landlordId._id,
    isActive: true
  }).sort({ order: 1, isDefault: -1 })
  
  return {
    invoice,
    landlord: invoice.landlordId,
    tenant: invoice.tenantId,
    property: invoice.propertyId,
    settings: settings || {},
    paymentMethods
  }
}
