import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'accountant', 'maintenance', 'viewer'],
    default: 'viewer'
  },
  permissions: {
    properties: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    tenants: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    payments: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    expenses: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      approve: { type: Boolean, default: false }
    },
    invoices: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      send: { type: Boolean, default: false }
    },
    maintenance: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      assign: { type: Boolean, default: false }
    },
    reports: {
      view: { type: Boolean, default: false },
      export: { type: Boolean, default: false }
    },
    users: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  companyId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password)
}

// Set default permissions based on role
userSchema.pre('save', function(next) {
  if (!this.isModified('role')) return next()
  
  // Reset permissions first
  const permissions = {
    properties: { view: false, create: false, edit: false, delete: false },
    tenants: { view: false, create: false, edit: false, delete: false },
    payments: { view: false, create: false, edit: false, delete: false },
    expenses: { view: false, create: false, edit: false, delete: false, approve: false },
    invoices: { view: false, create: false, edit: false, delete: false, send: false },
    maintenance: { view: false, create: false, edit: false, delete: false, assign: false },
    reports: { view: false, export: false },
    users: { view: false, create: false, edit: false, delete: false }
  }
  
  // Set permissions based on role
  switch (this.role) {
    case 'admin':
      // Admin has all permissions
      Object.keys(permissions).forEach(module => {
        Object.keys(permissions[module]).forEach(action => {
          permissions[module][action] = true
        })
      })
      break
      
    case 'manager':
      // Manager has most permissions except user management
      permissions.properties = { view: true, create: true, edit: true, delete: true }
      permissions.tenants = { view: true, create: true, edit: true, delete: true }
      permissions.payments = { view: true, create: true, edit: true, delete: false }
      permissions.expenses = { view: true, create: true, edit: true, delete: false, approve: true }
      permissions.invoices = { view: true, create: true, edit: true, delete: false, send: true }
      permissions.maintenance = { view: true, create: true, edit: true, delete: false, assign: true }
      permissions.reports = { view: true, export: true }
      permissions.users = { view: true, create: false, edit: false, delete: false }
      break
      
    case 'accountant':
      // Accountant focuses on financial data
      permissions.properties = { view: true, create: false, edit: false, delete: false }
      permissions.tenants = { view: true, create: false, edit: false, delete: false }
      permissions.payments = { view: true, create: true, edit: true, delete: false }
      permissions.expenses = { view: true, create: true, edit: true, delete: false, approve: false }
      permissions.invoices = { view: true, create: true, edit: true, delete: false, send: true }
      permissions.maintenance = { view: true, create: false, edit: false, delete: false, assign: false }
      permissions.reports = { view: true, export: true }
      break
      
    case 'maintenance':
      // Maintenance staff focuses on maintenance requests
      permissions.properties = { view: true, create: false, edit: false, delete: false }
      permissions.tenants = { view: true, create: false, edit: false, delete: false }
      permissions.payments = { view: false, create: false, edit: false, delete: false }
      permissions.expenses = { view: true, create: true, edit: false, delete: false, approve: false }
      permissions.invoices = { view: false, create: false, edit: false, delete: false, send: false }
      permissions.maintenance = { view: true, create: false, edit: true, delete: false, assign: false }
      permissions.reports = { view: false, export: false }
      break
      
    case 'viewer':
      // Viewer has only view permissions
      permissions.properties = { view: true, create: false, edit: false, delete: false }
      permissions.tenants = { view: true, create: false, edit: false, delete: false }
      permissions.payments = { view: true, create: false, edit: false, delete: false }
      permissions.expenses = { view: true, create: false, edit: false, delete: false, approve: false }
      permissions.invoices = { view: true, create: false, edit: false, delete: false, send: false }
      permissions.maintenance = { view: true, create: false, edit: false, delete: false, assign: false }
      permissions.reports = { view: true, export: false }
      break
  }
  
  this.permissions = permissions
  next()
})

export const User = mongoose.models.User || mongoose.model('User', userSchema)
