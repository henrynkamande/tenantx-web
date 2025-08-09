import mongoose from 'mongoose'

const landlordSettingsSchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord',
    required: true,
    unique: true
  },
  
  // Business Information
  displayName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Kenya' }
  },
  
  // Tax Information
  kraPin: {
    type: String,
    trim: true,
    uppercase: true
  },
  vatNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  vatRate: {
    type: Number,
    default: 16, // 16% VAT for Kenya
    min: 0,
    max: 100
  },
  taxInclusive: {
    type: Boolean,
    default: true // Prices include tax by default
  },
  
  // Branding
  logoUrl: {
    type: String,
    trim: true
  },
  brandColor: {
    type: String,
    default: '#2563eb', // Default blue color
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v)
      },
      message: 'Brand color must be a valid hex color'
    }
  },
  signatureUrl: {
    type: String,
    trim: true
  },
  
  // Invoice Settings
  defaultTerms: {
    type: String,
    enum: ['Net 7', 'Net 14', 'Net 30', 'Due on Receipt'],
    default: 'Net 30'
  },
  graceDays: {
    type: Number,
    default: 7,
    min: 0,
    max: 30
  },
  lateFeeType: {
    type: String,
    enum: ['flat', 'percent'],
    default: 'percent'
  },
  lateFeeValue: {
    type: Number,
    default: 5, // 5% or 5 KES
    min: 0
  },
  
  // Invoice Numbering
  invoicePrefix: {
    type: String,
    default: 'INV',
    trim: true,
    uppercase: true
  },
  invoiceNumberSeq: {
    type: Number,
    default: 0,
    min: 0
  },
  invoiceFormat: {
    type: String,
    default: '{LLD}-{PREFIX}-{YYYY}-{SEQ}' // e.g., ABC-INV-2024-0001
  },
  
  // Currency
  currency: {
    type: String,
    enum: ['KES', 'USD', 'EUR', 'GBP'],
    default: 'KES'
  }
}, {
  timestamps: true
})

// Indexes
landlordSettingsSchema.index({ landlordId: 1 })

export default mongoose.models.LandlordSettings || mongoose.model('LandlordSettings', landlordSettingsSchema)
