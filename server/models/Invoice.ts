import mongoose from 'mongoose'

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  tenantId: {
    type: String,
    required: true
  },
  propertyId: {
    type: String,
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
  items: {
    type: [
      {
        description: String,
        quantity: Number,
        rate: Number,
        amount: Number
      }
    ],
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  taxRate: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  receiptId: {
    type: mongoose.Schema.Types.ObjectId
  },
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  sentAt: Date,
  paidAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema)
