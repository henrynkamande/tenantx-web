import mongoose from 'mongoose'

const tenantSchema = new mongoose.Schema({
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord',
    required: true
  },
  personalInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    socialSecurityNumber: { type: String, select: false }, // Hidden by default
    driverLicenseNumber: String
  },
  leaseInfo: {
    leaseStartDate: { type: Date, required: true },
    leaseEndDate: { type: Date, required: false },
    monthlyRent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    petDeposit: { type: Number, default: 0, min: 0 },
    rentDueDay: { type: Number, default: 1, min: 1, max: 31 }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  employment: {
    employer: String,
    position: String,
    monthlyIncome: { type: Number, min: 0 },
    workPhone: String
  },
  status: {
    type: String,
    enum: ['Active', 'Notice Given', 'Moved Out', 'Evicted'],
    default: 'Active'
  },
  notes: String,
  documents: [{
    name: String,
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
})

// Indexes
tenantSchema.index({ unitId: 1 })
tenantSchema.index({ landlordId: 1 })
tenantSchema.index({ status: 1 })
tenantSchema.index({ 'personalInfo.email': 1 })
tenantSchema.index({ 'leaseInfo.leaseEndDate': 1 })

// Virtual for full name
tenantSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`
})

export default mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema)
