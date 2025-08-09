import puppeteer from 'puppeteer'
import { connectToDatabase } from '~/server/utils/database'
import Tenant from '~/server/models/Tenant'
import Payment from '~/server/models/Payment'
import { getLandlordFromToken } from '~/server/utils/getLandlord'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const landlord = await getLandlordFromToken(event)
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const tenantId = getRouterParam(event, 'id')
    const query = getQuery(event)
    
    // Date range for statement (default to all time for comprehensive report)
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date()
    const startDate = query.startDate ? new Date(query.startDate as string) : new Date('2020-01-01') // All time

    if (!tenantId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tenant ID is required'
      })
    }

    // Get tenant information with all relationships
    const tenant = await Tenant.findOne({
      _id: tenantId,
      landlordId: landlord._id
    }).populate({
      path: 'currentUnit',
      populate: {
        path: 'propertyId',
        select: 'name address'
      }
    })

    if (!tenant) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tenant not found'
      })
    }

    // Get ALL payment history for comprehensive report
    const payments = await Payment.find({
      tenantId: tenantId,
      dueDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate({
      path: 'unitId',
      select: 'unitNumber',
      populate: {
        path: 'propertyId',
        select: 'name'
      }
    })
    .sort({ dueDate: 1 })

    // Calculate comprehensive totals
    const totalCharges = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalPaid = payments
      .filter(payment => payment.status === 'Completed')
      .reduce((sum, payment) => sum + (payment.amountPaid || payment.amount), 0)
    
    const partialPaid = payments
      .filter(payment => payment.status === 'Partial')
      .reduce((sum, payment) => sum + (payment.amountPaid || 0), 0)

    const totalReceived = totalPaid + partialPaid
    const outstandingBalance = totalCharges - totalReceived

    // Get default information
    const defaultedPayments = payments.filter(p => p.status === 'Defaulted' || p.isDefaulted)
    const totalDefaults = defaultedPayments.length
    const totalDefaultAmount = defaultedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalPenalties = defaultedPayments.reduce((sum, payment) => sum + (payment.penaltyAmount || 0), 0)

    // Calculate aging of outstanding payments
    const today = new Date()
    const aging = {
      current: 0,
      days30: 0,
      days60: 0,
      days90plus: 0
    }

    payments.forEach(payment => {
      if (payment.status !== 'Completed') {
        const daysPastDue = Math.floor((today.getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        const outstandingAmount = payment.amount - (payment.amountPaid || 0)
        
        if (daysPastDue <= 0) {
          aging.current += outstandingAmount
        } else if (daysPastDue <= 30) {
          aging.days30 += outstandingAmount
        } else if (daysPastDue <= 60) {
          aging.days60 += outstandingAmount
        } else {
          aging.days90plus += outstandingAmount
        }
      }
    })

    // Generate HTML content for PDF
    const htmlContent = generateStatementHTML({
      tenant: {
        id: tenant._id,
        name: `${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`,
        email: tenant.contactInfo.email,
        phone: tenant.contactInfo.phone,
        address: tenant.contactInfo.address,
        dateOfBirth: tenant.personalInfo.dateOfBirth,
        currentUnit: tenant.currentUnit ? {
          unitNumber: tenant.currentUnit.unitNumber,
          property: tenant.currentUnit.propertyId?.name,
          address: tenant.currentUnit.propertyId?.address
        } : null,
        leaseStartDate: tenant.leaseDetails?.startDate,
        leaseEndDate: tenant.leaseDetails?.endDate,
        status: tenant.status,
        rentAmount: tenant.leaseDetails?.rentAmount,
        securityDeposit: tenant.leaseDetails?.securityDeposit,
        rentDueDay: tenant.leaseDetails?.rentDueDay
      },
      landlord: {
        name: `${landlord.personalInfo.firstName} ${landlord.personalInfo.lastName}`,
        company: landlord.businessInfo?.companyName,
        email: landlord.contactInfo.email,
        phone: landlord.contactInfo.phone,
        address: landlord.contactInfo.address
      },
      statement: {
        periodStart: startDate,
        periodEnd: endDate,
        generatedDate: new Date(),
        totalCharges,
        totalReceived,
        outstandingBalance,
        aging,
        totalDefaults,
        totalDefaultAmount,
        totalPenalties
      },
      payments,
      defaultedPayments
    })

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        right: '0.5in',
        bottom: '1in',
        left: '0.5in'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; margin-top: 10px;">
          <span>Tenant Statement - ${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; margin-bottom: 10px;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span> - Generated on ${new Date().toLocaleDateString()}</span>
        </div>
      `
    })

    await browser.close()

    // Set response headers for PDF download
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="tenant-statement-${tenant.personalInfo.firstName}-${tenant.personalInfo.lastName}-${new Date().toISOString().split('T')[0]}.pdf"`)
    
    return pdf

  } catch (error) {
    console.error('Error generating PDF statement:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})

// Helper function to generate HTML content for PDF
function generateStatementHTML(data: any): string {
  const formatMoney = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const classes = {
      'Completed': 'background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 12px; font-size: 12px;',
      'Pending': 'background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; font-size: 12px;',
      'Overdue': 'background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 12px; font-size: 12px;',
      'Partial': 'background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 12px; font-size: 12px;',
      'Defaulted': 'background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 12px; font-size: 12px;'
    }
    return classes[status as keyof typeof classes] || 'background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 12px; font-size: 12px;'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tenant Statement - ${data.tenant.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #374151;
        }
        
        .container {
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }
        
        .company-info {
          text-align: right;
          float: right;
          width: 40%;
        }
        
        .tenant-info {
          float: left;
          width: 55%;
        }
        
        .clear {
          clear: both;
        }
        
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #d1d5db;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 15px;
        }
        
        .info-item {
          margin-bottom: 8px;
        }
        
        .info-label {
          font-weight: bold;
          color: #6b7280;
          display: inline-block;
          width: 120px;
        }
        
        .info-value {
          color: #1f2937;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .summary-item {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        
        .summary-label {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        
        .summary-amount {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
        }
        
        .summary-amount.positive {
          color: #059669;
        }
        
        .summary-amount.negative {
          color: #dc2626;
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .table th {
          background: #f9fafb;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          border-bottom: 2px solid #e5e7eb;
          font-size: 11px;
        }
        
        .table td {
          padding: 10px 8px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 11px;
        }
        
        .table tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
        }
        
        .aging-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        
        .aging-item {
          text-align: center;
          padding: 15px;
          background: #f9fafb;
          border-radius: 8px;
        }
        
        .aging-label {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        
        .aging-amount {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
        }
        
        .highlight-section {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .highlight-title {
          color: #92400e;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 10px;
          color: #6b7280;
        }
        
        @media print {
          .page-break {
            page-break-before: always;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>COMPREHENSIVE TENANT STATEMENT</h1>
          <p>Statement Period: ${formatDate(data.statement.periodStart)} - ${formatDate(data.statement.periodEnd)}</p>
          <p>Generated: ${formatDate(data.statement.generatedDate)}</p>
        </div>
        
        <!-- Company and Tenant Info -->
        <div class="company-info">
          ${data.landlord.company ? `<div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${data.landlord.company}</div>` : ''}
          <div><strong>${data.landlord.name}</strong></div>
          <div>${data.landlord.email}</div>
          <div>${data.landlord.phone}</div>
          ${data.landlord.address ? `
            <div>${data.landlord.address.street}</div>
            <div>${data.landlord.address.city}, ${data.landlord.address.state} ${data.landlord.address.zipCode}</div>
          ` : ''}
        </div>
        
        <div class="tenant-info">
          <div class="section-title">Tenant Information</div>
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value"><strong>${data.tenant.name}</strong></span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">${data.tenant.email}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Phone:</span>
            <span class="info-value">${data.tenant.phone}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date of Birth:</span>
            <span class="info-value">${formatDate(data.tenant.dateOfBirth)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span>
            <span class="info-value">${data.tenant.status}</span>
          </div>
        </div>
        
        <div class="clear"></div>
        
        <!-- Property Information -->
        ${data.tenant.currentUnit ? `
        <div class="section">
          <div class="section-title">Property & Lease Information</div>
          <div class="info-grid">
            <div>
              <div class="info-item">
                <span class="info-label">Property:</span>
                <span class="info-value">${data.tenant.currentUnit.property || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Unit:</span>
                <span class="info-value">${data.tenant.currentUnit.unitNumber || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Monthly Rent:</span>
                <span class="info-value">${formatMoney(data.tenant.rentAmount || 0)}</span>
              </div>
            </div>
            <div>
              <div class="info-item">
                <span class="info-label">Lease Start:</span>
                <span class="info-value">${formatDate(data.tenant.leaseStartDate)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Lease End:</span>
                <span class="info-value">${formatDate(data.tenant.leaseEndDate)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Security Deposit:</span>
                <span class="info-value">${formatMoney(data.tenant.securityDeposit || 0)}</span>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Statement Summary -->
        <div class="section">
          <div class="section-title">Financial Summary</div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Charges</div>
              <div class="summary-amount">${formatMoney(data.statement.totalCharges)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Received</div>
              <div class="summary-amount positive">${formatMoney(data.statement.totalReceived)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Outstanding Balance</div>
              <div class="summary-amount ${data.statement.outstandingBalance > 0 ? 'negative' : 'positive'}">${formatMoney(data.statement.outstandingBalance)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Penalties</div>
              <div class="summary-amount negative">${formatMoney(data.statement.totalPenalties)}</div>
            </div>
          </div>
        </div>
        
        <!-- Defaults and Penalties Section -->
        ${data.defaultedPayments.length > 0 ? `
        <div class="highlight-section">
          <div class="highlight-title">⚠️ RENT DEFAULTS & PENALTIES</div>
          <div class="info-grid">
            <div>
              <div class="info-item">
                <span class="info-label">Total Defaults:</span>
                <span class="info-value"><strong>${data.statement.totalDefaults}</strong></span>
              </div>
              <div class="info-item">
                <span class="info-label">Default Amount:</span>
                <span class="info-value"><strong>${formatMoney(data.statement.totalDefaultAmount)}</strong></span>
              </div>
            </div>
            <div>
              <div class="info-item">
                <span class="info-label">Total Penalties:</span>
                <span class="info-value"><strong>${formatMoney(data.statement.totalPenalties)}</strong></span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value" style="color: #dc2626;"><strong>ACTION REQUIRED</strong></span>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Aging Analysis -->
        ${data.statement.outstandingBalance > 0 ? `
        <div class="section">
          <div class="section-title">Aging Analysis</div>
          <div class="aging-grid">
            <div class="aging-item">
              <div class="aging-label">Current</div>
              <div class="aging-amount">${formatMoney(data.statement.aging.current)}</div>
            </div>
            <div class="aging-item">
              <div class="aging-label">1-30 Days</div>
              <div class="aging-amount">${formatMoney(data.statement.aging.days30)}</div>
            </div>
            <div class="aging-item">
              <div class="aging-label">31-60 Days</div>
              <div class="aging-amount">${formatMoney(data.statement.aging.days60)}</div>
            </div>
            <div class="aging-item">
              <div class="aging-label">60+ Days</div>
              <div class="aging-amount" style="color: #dc2626;">${formatMoney(data.statement.aging.days90plus)}</div>
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Complete Transaction History -->
        <div class="section page-break">
          <div class="section-title">Complete Transaction History</div>
          <table class="table">
            <thead>
              <tr>
                <th>Due Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              ${data.payments.map((payment: any) => `
                <tr>
                  <td>${formatDate(payment.dueDate)}</td>
                  <td>${payment.paymentType}</td>
                  <td>${formatMoney(payment.amount)}</td>
                  <td>${formatMoney(payment.amountPaid || (payment.status === 'Completed' ? payment.amount : 0))}</td>
                  <td>${formatMoney(payment.amount - (payment.amountPaid || (payment.status === 'Completed' ? payment.amount : 0)))}</td>
                  <td><span style="${getStatusBadge(payment.status)}">${payment.status}</span></td>
                  <td>${payment.paymentDate ? formatDate(payment.paymentDate) : '-'}</td>
                  <td>${payment.paymentMethod || '-'}</td>
                  <td>${payment.referenceNumber || payment.transactionId || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Defaulted Payments Detail -->
        ${data.defaultedPayments.length > 0 ? `
        <div class="section page-break">
          <div class="section-title">Defaulted Payments Detail</div>
          <table class="table">
            <thead>
              <tr>
                <th>Due Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Penalty</th>
                <th>Total Due</th>
                <th>Days Overdue</th>
                <th>Default Date</th>
              </tr>
            </thead>
            <tbody>
              ${data.defaultedPayments.map((payment: any) => {
                const daysOverdue = Math.floor((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                return `
                  <tr style="background: #fef2f2;">
                    <td>${formatDate(payment.dueDate)}</td>
                    <td>${payment.paymentType}</td>
                    <td>${formatMoney(payment.amount)}</td>
                    <td>${formatMoney(payment.penaltyAmount || 0)}</td>
                    <td><strong>${formatMoney(payment.amount + (payment.penaltyAmount || 0))}</strong></td>
                    <td><strong>${daysOverdue} days</strong></td>
                    <td>${payment.defaultedDate ? formatDate(payment.defaultedDate) : '-'}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <p><strong>This is a comprehensive tenant statement showing all transactions and account status.</strong></p>
          <p>For questions regarding this statement, please contact: ${data.landlord.email} | ${data.landlord.phone}</p>
          <p>${data.landlord.company || data.landlord.name} - Generated automatically on ${formatDate(data.statement.generatedDate)}</p>
        </div>
      </div>
    </body>
    </html>
  `
}
