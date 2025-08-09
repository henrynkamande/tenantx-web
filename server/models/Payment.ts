import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  // Original rent payment fields
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord'
  },
  
  // New fields for expenses and invoices
  type: {
    type: String,
    enum: ['rent', 'expense', 'invoice'],
    default: 'rent'
  },
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  
  // Payment method details (for invoice payments)
  method: {
    type: String,
    enum: ['mpesa', 'bank', 'cash', 'card', 'other'],
    default: 'other'
  },
  reference: {
    type: String,
    trim: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  category: {
    type: String
  },
  vendor: {
    type: String
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  date: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  paymentType: {
    type: String,
    enum: ['Rent', 'Security Deposit', 'Late Fee', 'Pet Fee', 'Utility', 'Other'],
    default: 'Other'
  },
  monthFor: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate monthFor for Rent payments
        if (this.paymentType === 'Rent') {
          return v && /^\d{4}-\d{2}$/.test(v)
        }
        return true
      },
      message: 'Month for rent payment must be in YYYY-MM format'
    }
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Check', 'Bank Transfer', 'Credit Card', 'Online Payment', 'Money Order', 'manual'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Partial', 'Overdue', 'Defaulted', 'pending', 'completed', 'failed'],
    default: 'Completed'
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  lateFee: {
    type: Number,
    default: 0,
    min: 0
  },
  isLate: {
    type: Boolean,
    default: false
  },
  
  // Default tracking
  isDefaulted: {
    type: Boolean,
    default: false
  },
  defaultedDate: {
    type: Date
  },
  deadlineDate: {
    type: Date
  },
  penaltyAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  penaltyPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  receipt: {
    receiptNumber: String,
    issuedDate: { type: Date, default: Date.now },
    downloadUrl: String
  }
}, {
  timestamps: true
})

// Indexes
paymentSchema.index({ unitId: 1 })
paymentSchema.index({ tenantId: 1 })
paymentSchema.index({ landlordId: 1 })
paymentSchema.index({ propertyId: 1 })
paymentSchema.index({ paymentDate: -1 })
paymentSchema.index({ dueDate: 1 })
paymentSchema.index({ status: 1 })
paymentSchema.index({ paymentType: 1 })
paymentSchema.index({ propertyId: 1, paymentDate: -1 })

// Pre-save middleware to check if payment is late
paymentSchema.pre('save', function(next) {
  if (this.paymentDate > this.dueDate) {
    this.isLate = true
  }
  next()
})

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema)
