import mongoose from 'mongoose'

const maintenanceSchema = new mongoose.Schema({
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'HVAC', 'Appliances', 'Flooring', 'Painting', 'Exterior', 'Pest Control', 'Security', 'Other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Emergency'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Cancelled', 'On Hold'],
    default: 'Open'
  },
  reportedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  scheduledDate: Date,
  completedDate: Date,
  vendor: {
    name: String,
    phone: String,
    email: String,
    company: String
  },
  cost: {
    estimated: { type: Number, min: 0 },
    actual: { type: Number, min: 0 }
  },
  images: [{
    url: String,
    caption: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  notes: [{
    content: String,
    author: String,
    date: { type: Date, default: Date.now }
  }],
  workOrder: {
    number: String,
    issuedDate: Date,
    instructions: String
  }
}, {
  timestamps: true
})

// Indexes
maintenanceSchema.index({ unitId: 1 })
maintenanceSchema.index({ tenantId: 1 })
maintenanceSchema.index({ landlordId: 1 })
maintenanceSchema.index({ status: 1 })
maintenanceSchema.index({ priority: 1 })
maintenanceSchema.index({ category: 1 })
maintenanceSchema.index({ reportedDate: -1 })
maintenanceSchema.index({ scheduledDate: 1 })

export default mongoose.models.Maintenance || mongoose.model('Maintenance', maintenanceSchema)
