import nodemailer from 'nodemailer'
import { generateInvoicePDF } from './pdfGenerator'
import { generateInvoiceData } from './invoiceTemplate'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Email configuration - you should set these via environment variables
const getEmailConfig = (): EmailConfig => {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  }
}

let transporter: any = null

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransporter(getEmailConfig())
  }
  return transporter
}

export interface SendInvoiceEmailOptions {
  invoiceId: string
  recipientEmail?: string
  ccEmails?: string[]
  customMessage?: string
  attachPDF?: boolean
}

export async function sendInvoiceEmail(options: SendInvoiceEmailOptions) {
  const { invoiceId, recipientEmail, ccEmails, customMessage, attachPDF = true } = options
  
  // Get invoice data
  const templateData = await generateInvoiceData(invoiceId)
  const { invoice, tenant, landlord, settings } = templateData
  
  // Use provided email or tenant's email
  const toEmail = recipientEmail || tenant.personalInfo?.email || tenant.email
  if (!toEmail) {
    throw new Error('No recipient email address available')
  }
  
  // Generate public share link for invoice viewing
  const publicLink = `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/public/invoices/${invoice.publicShareId}`
  
  // Email subject and content
  const subject = `Invoice ${invoice.invoiceNumber} from ${settings?.displayName || landlord.companyName || `${landlord.firstName} ${landlord.lastName}`}`
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: invoice.currency || 'KES'
    }).format(amount)
  }
  
  // HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${settings?.brandColor || '#2563eb'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .invoice-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .button { display: inline-block; background: ${settings?.brandColor || '#2563eb'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .payment-info { background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Invoice from ${settings?.displayName || landlord.companyName || `${landlord.firstName} ${landlord.lastName}`}</h1>
      </div>
      
      <div class="content">
        <p>Hello ${tenant.personalInfo?.firstName || tenant.name || 'Valued Tenant'},</p>
        
        ${customMessage ? `<p>${customMessage}</p>` : `<p>We hope this email finds you well. Please find your new invoice attached.</p>`}
        
        <div class="invoice-details">
          <h3>Invoice Details</h3>
          <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString('en-KE')}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('en-KE')}</p>
          <p><strong>Amount:</strong> ${formatCurrency(invoice.total || invoice.totalAmount)}</p>
          <p><strong>Status:</strong> ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${publicLink}" class="button">View Invoice Online</a>
        </div>
        
        ${templateData.paymentMethods && templateData.paymentMethods.length > 0 ? `
          <div class="payment-info">
            <h3>Payment Methods</h3>
            ${templateData.paymentMethods.map(method => {
              if (method.type === 'mpesa' && method.mpesa.paybill) {
                return `
                  <p><strong>${method.label}</strong><br>
                  Paybill: ${method.mpesa.paybill}<br>
                  Account: ${invoice.invoiceNumber}</p>
                `
              } else if (method.type === 'bank' && method.bank.accountNumber) {
                return `
                  <p><strong>${method.label}</strong><br>
                  Bank: ${method.bank.bankName}<br>
                  Account: ${method.bank.accountNumber}<br>
                  Reference: ${invoice.invoiceNumber}</p>
                `
              }
              return ''
            }).join('')}
          </div>
        ` : ''}
        
        <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
        
        <p>Thank you for your business!</p>
        
        <p>Best regards,<br>
        ${settings?.displayName || landlord.companyName || `${landlord.firstName} ${landlord.lastName}`}<br>
        ${settings?.email || landlord.email}<br>
        ${settings?.phone || landlord.phone || ''}</p>
      </div>
      
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>You can view this invoice online at: <a href="${publicLink}">${publicLink}</a></p>
      </div>
    </body>
    </html>
  `
  
  // Plain text version
  const textContent = `
New Invoice from ${settings?.displayName || landlord.companyName || `${landlord.firstName} ${landlord.lastName}`}

Hello ${tenant.personalInfo?.firstName || tenant.name || 'Valued Tenant'},

${customMessage || 'We hope this email finds you well. Please find your new invoice details below.'}

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Issue Date: ${new Date(invoice.issueDate).toLocaleDateString('en-KE')}
- Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-KE')}
- Amount: ${formatCurrency(invoice.total || invoice.totalAmount)}
- Status: ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}

View Invoice Online: ${publicLink}

${templateData.paymentMethods && templateData.paymentMethods.length > 0 ? 
  `Payment Methods:\n${templateData.paymentMethods.map(method => {
    if (method.type === 'mpesa' && method.mpesa.paybill) {
      return `${method.label}: Paybill ${method.mpesa.paybill}, Account: ${invoice.invoiceNumber}`
    } else if (method.type === 'bank' && method.bank.accountNumber) {
      return `${method.label}: ${method.bank.bankName}, Account: ${method.bank.accountNumber}, Reference: ${invoice.invoiceNumber}`
    }
    return ''
  }).filter(Boolean).join('\n')}\n` : ''}

If you have any questions about this invoice, please don't hesitate to contact us.

Thank you for your business!

Best regards,
${settings?.displayName || landlord.companyName || `${landlord.firstName} ${landlord.lastName}`}
${settings?.email || landlord.email}
${settings?.phone || landlord.phone || ''}

---
This is an automated message. Please do not reply to this email.
You can view this invoice online at: ${publicLink}
  `
  
  // Email options
  const mailOptions: any = {
    from: `"${settings?.displayName || 'TenantX'}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    text: textContent,
    html: htmlContent
  }
  
  // Add CC emails if provided
  if (ccEmails && ccEmails.length > 0) {
    mailOptions.cc = ccEmails.join(', ')
  }
  
  // Attach PDF if requested
  if (attachPDF) {
    try {
      const pdfBuffer = await generateInvoicePDF(invoiceId)
      mailOptions.attachments = [
        {
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    } catch (pdfError) {
      console.error('Failed to generate PDF attachment:', pdfError)
      // Continue without PDF attachment
    }
  }
  
  // Send email
  const transporter = getTransporter()
  const result = await transporter.sendMail(mailOptions)
  
  return {
    success: true,
    messageId: result.messageId,
    recipientEmail: toEmail,
    publicLink
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter()
    await transporter.verify()
    return true
  } catch (error) {
    console.error('Email connection test failed:', error)
    return false
  }
}
