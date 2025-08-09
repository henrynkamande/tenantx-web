import mongoose from 'mongoose'

const unitSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord',
    required: true
  },
  unitNumber: {
    type: String,
    required: true,
    trim: true
  },
  rentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  securityDeposit: {
    type: Number,
    default: 0,
    min: 0
  },
  bedrooms: {
    type: Number,
    default: 1,
    min: 0
  },
  bathrooms: {
    type: Number,
    default: 1,
    min: 0
  },
  squareFootage: {
    type: Number,
    min: 0
  },
  occupancyStatus: {
    type: String,
    enum: ['Occupied', 'Vacant', 'Under Maintenance'],
    default: 'Vacant'
  },
  description: {
    type: String,
    trim: true
  },
  features: [String],
  images: [String],
  leaseStartDate: Date,
  leaseEndDate: Date,
  rentDueDay: {
    type: Number,
    default: 1,
    min: 1,
    max: 31
  },
  
  // Unit-specific rent settings
  rentSettings: {
    useUnitSpecificSettings: {
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

// Compound index for property and unit number uniqueness
unitSchema.index({ propertyId: 1, unitNumber: 1 }, { unique: true })
unitSchema.index({ landlordId: 1 })
unitSchema.index({ occupancyStatus: 1 })

export default mongoose.models.Unit || mongoose.model('Unit', unitSchema)
