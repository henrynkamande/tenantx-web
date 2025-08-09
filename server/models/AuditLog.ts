import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['invoice', 'payment', 'landlord_settings', 'payment_method'],
    required: true
  },
  
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'sent', 'paid', 'voided', 'overdue'],
    required: true
  },
  
  byUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord',
    required: true
  },
  
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord',
    required: true
  },
  
  payload: {
    type: mongoose.Schema.Types.Mixed, // Store the changes or additional data
    default: {}
  },
  
  ipAddress: {
    type: String,
    trim: true
  },
  
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Indexes
auditLogSchema.index({ entityType: 1, entityId: 1 })
auditLogSchema.index({ landlordId: 1, createdAt: -1 })
auditLogSchema.index({ byUserId: 1, createdAt: -1 })
auditLogSchema.index({ action: 1, createdAt: -1 })

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema)
