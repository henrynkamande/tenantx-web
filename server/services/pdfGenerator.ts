import puppeteer from 'puppeteer'

let browser: any = null

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
  }
  return browser
}

export interface PDFOptions {
  format?: 'A4' | 'Letter'
  margin?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  displayHeaderFooter?: boolean
  headerTemplate?: string
  footerTemplate?: string
  printBackground?: boolean
}

export async function generatePDFFromHTML(
  html: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    // Set content with proper viewport for invoice rendering
    await page.setViewport({ width: 794, height: 1123 }) // A4 size in pixels at 96 DPI
    
    await page.setContent(html, {
      waitUntil: 'networkidle0', // Wait for all network requests to finish
      timeout: 30000
    })

    // Generate PDF
    const pdf = await page.pdf({
      format: options.format || 'A4',
      printBackground: options.printBackground !== false,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
        ...options.margin
      },
      displayHeaderFooter: options.displayHeaderFooter || false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || '',
      preferCSSPageSize: true
    })

    return Buffer.from(pdf)
  } finally {
    await page.close()
  }
}

export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  const { generateInvoiceData, generateInvoiceTemplate } = await import('./invoiceTemplate')
  
  // Get invoice data and generate HTML
  const templateData = await generateInvoiceData(invoiceId)
  const html = await generateInvoiceTemplate(templateData)
  
  // Generate PDF with invoice-specific options
  return await generatePDFFromHTML(html, {
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10px',
      right: '10px',
      bottom: '10px',
      left: '10px'
    }
  })
}

// Clean up browser on process exit
process.on('exit', async () => {
  if (browser) {
    await browser.close()
  }
})

process.on('SIGINT', async () => {
  if (browser) {
    await browser.close()
  }
  process.exit()
})

process.on('SIGTERM', async () => {
  if (browser) {
    await browser.close()
  }
  process.exit()
})
