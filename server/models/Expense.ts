import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['maintenance', 'utilities', 'insurance', 'marketing', 'legal', 'other']
  },
  propertyId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  vendor: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'rejected'],
    default: 'pending'
  },
  receipt: {
    filename: String,
    size: Number,
    type: String,
    uploadedAt: Date
  },
  receiptId: {
    type: mongoose.Schema.Types.ObjectId
  },
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  approvedAt: Date,
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

export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema)
