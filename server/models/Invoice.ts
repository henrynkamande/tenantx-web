import mongoose from 'mongoose'

const invoiceLineSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['rent', 'utility', 'parking', 'penalty', 'other'],
    default: 'rent'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lineTotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false })

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  leaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease' // Will be added later if lease model exists
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  
  // Line items using the new schema
  lines: [invoiceLineSchema],
  
  // Financial calculations
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  balance: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Currency and payment
  currency: {
    type: String,
    default: 'KES'
  },
  
  // Status and tracking
  status: {
    type: String,
    enum: ['draft', 'sent', 'partial', 'paid', 'overdue', 'void'],
    default: 'draft'
  },
  
  // Public sharing
  publicShareId: {
    type: String,
    sparse: true
  },
  
  notes: {
    type: String,
    trim: true
  },
  
  // Legacy fields for backward compatibility
  items: {
    type: [
      {
        description: String,
        quantity: Number,
        rate: Number,
        amount: Number
      }
    ]
  },
  taxRate: Number,
  taxAmount: Number,
  totalAmount: Number,
  
  // Audit fields
  sentAt: Date,
  paidAt: Date,
  voidedAt: Date,
  
  receiptId: {
    type: mongoose.Schema.Types.ObjectId
  },
  receiptGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes for performance
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true })
invoiceSchema.index({ publicShareId: 1 }, { unique: true, sparse: true })
invoiceSchema.index({ landlordId: 1 })
invoiceSchema.index({ landlordId: 1, status: 1 })
invoiceSchema.index({ landlordId: 1, dueDate: 1 })
invoiceSchema.index({ tenantId: 1, status: 1 })
invoiceSchema.index({ createdAt: -1 })

// Pre-save middleware to set balance
invoiceSchema.pre('save', function(next) {
  if (this.isNew || this.isModified(['total', 'balance'])) {
    if (this.balance === undefined) {
      this.balance = this.total
    }
  }
  next()
})

// Method to check if invoice is overdue
invoiceSchema.methods.isOverdue = function() {
  return this.status !== 'paid' && this.dueDate < new Date()
}

// Method to calculate days overdue
invoiceSchema.methods.daysOverdue = function() {
  if (!this.isOverdue()) return 0
  const now = new Date()
  const diffTime = Math.abs(now - this.dueDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema)
