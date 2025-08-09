import mongoose from 'mongoose'

const paymentMethodSchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord',
    required: true
  },
  
  type: {
    type: String,
    enum: ['mpesa', 'bank', 'card', 'other'],
    required: true
  },
  
  label: {
    type: String,
    required: true,
    trim: true
  },
  
  // M-Pesa specific fields
  mpesa: {
    paybill: {
      type: String,
      trim: true
    },
    till: {
      type: String,
      trim: true
    },
    accountRefHint: {
      type: String,
      trim: true,
      default: 'Use Invoice Number as reference'
    }
  },
  
  // Bank transfer specific fields
  bank: {
    bankName: {
      type: String,
      trim: true
    },
    accountName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    branch: {
      type: String,
      trim: true
    },
    swift: {
      type: String,
      trim: true,
      uppercase: true
    }
  },
  
  // Other payment method instructions
  instructions: {
    type: String,
    trim: true
  },
  
  isDefault: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Indexes
paymentMethodSchema.index({ landlordId: 1, order: 1 })
paymentMethodSchema.index({ landlordId: 1, isDefault: -1 })

// Ensure only one default payment method per landlord
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default flag from other payment methods for this landlord
    await mongoose.model('PaymentMethod').updateMany(
      { 
        landlordId: this.landlordId,
        _id: { $ne: this._id }
      },
      { $set: { isDefault: false } }
    )
  }
  next()
})

export default mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', paymentMethodSchema)
