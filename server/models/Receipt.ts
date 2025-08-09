import mongoose from 'mongoose'

const receiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['expense', 'invoice'],
    required: true
  },
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  html: {
    type: String,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
})

export const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', receiptSchema)
