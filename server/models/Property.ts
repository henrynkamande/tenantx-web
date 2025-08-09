import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' }
  },
  propertyType: {
    type: String,
    enum: ['Apartment', 'House', 'Condo', 'Townhouse', 'Commercial'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  totalUnits: {
    type: Number,
    default: 1,
    min: 1
  },
  amenities: [String],
  images: [String],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Maintenance'],
    default: 'Active'
  },
  
  // Property-specific rent settings
  rentSettings: {
    usePropertySpecificSettings: {
      type: Boolean,
      default: false
    },
    rentDeadline: {
      type: Number,
      min: 1,
      max: 31
    },
    penaltyPercentage: {
      type: Number,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
})

// Indexes for faster lookups
propertySchema.index({ landlordId: 1 })
propertySchema.index({ 'address.city': 1 })
propertySchema.index({ status: 1 })

export default mongoose.models.Property || mongoose.model('Property', propertySchema)
