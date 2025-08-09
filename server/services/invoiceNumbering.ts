import LandlordSettings from '~/server/models/LandlordSettings'
import Landlord from '~/server/models/Landlord'
import { ObjectId } from 'mongodb'
import { randomUUID } from 'crypto'

export interface InvoiceNumberOptions {
  landlordId: ObjectId
  forceSequence?: number
}

export async function generateInvoiceNumber(options: InvoiceNumberOptions): Promise<string> {
  const { landlordId, forceSequence } = options
  
  // Get landlord settings for numbering format
  let settings = await LandlordSettings.findOne({ landlordId })
  
  if (!settings) {
    // Create default settings if none exist
    const landlord = await Landlord.findById(landlordId)
    if (!landlord) {
      throw new Error('Landlord not found')
    }
    
    settings = new LandlordSettings({
      landlordId,
      displayName: landlord.companyName || `${landlord.firstName} ${landlord.lastName}`,
      email: landlord.email,
      phone: landlord.phone,
      currency: landlord.preferredCurrency || 'KES'
    })
    await settings.save()
  }
  
  // Get next sequence number (atomic increment)
  const nextSequence = forceSequence !== undefined ? forceSequence : settings.invoiceNumberSeq + 1
  
  if (forceSequence === undefined) {
    await LandlordSettings.findByIdAndUpdate(settings._id, {
      $inc: { invoiceNumberSeq: 1 }
    })
  }
  
  // Generate landlord code from name or use first 3 chars of ID
  let landlordCode = 'LLD'
  if (settings.displayName) {
    // Extract initials from name
    const words = settings.displayName.trim().split(/\s+/)
    if (words.length === 1) {
      landlordCode = words[0].substring(0, 3).toUpperCase()
    } else {
      landlordCode = words.map(word => word.charAt(0)).join('').substring(0, 3).toUpperCase()
    }
  }
  
  // Pad sequence number
  const paddedSequence = String(nextSequence).padStart(4, '0')
  
  // Get current year
  const currentYear = new Date().getFullYear()
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0')
  
  // Replace placeholders in format string
  let invoiceNumber = settings.invoiceFormat
    .replace('{LLD}', landlordCode)
    .replace('{PREFIX}', settings.invoicePrefix)
    .replace('{YYYY}', String(currentYear))
    .replace('{YY}', String(currentYear).substring(2))
    .replace('{MM}', currentMonth)
    .replace('{SEQ}', paddedSequence)
  
  return invoiceNumber
}

export async function validateInvoiceNumber(invoiceNumber: string): Promise<boolean> {
  // Check if invoice number already exists
  const { connectToDatabase } = await import('~/server/utils/database')
  const { db } = await connectToDatabase()
  
  const existingInvoice = await db.collection('invoices').findOne({
    invoiceNumber
  })
  
  return !existingInvoice
}

export function generatePublicShareId(): string {
  // Generate a secure random UUID for public sharing
  return randomUUID()
}
