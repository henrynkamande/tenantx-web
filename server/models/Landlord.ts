import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const landlordSchema = new mongoose.Schema({
  // Basic information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Company information
  companyName: {
    type: String,
    trim: true
  },
  companyAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Kenya' }
  },
  
  // Preferences
  preferredCurrency: {
    type: String,
    enum: ['KES', 'USD', 'EUR', 'GBP'],
    default: 'KES'
  },
  language: {
    type: String,
    enum: ['en', 'sw'],
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'Africa/Nairobi'
  },
  
  // Rent deadline and penalty settings
  rentSettings: {
    globalRentDeadline: {
      type: Number,
      default: 5, // days after rent due date
      min: 1,
      max: 31
    },
    defaultPenaltyPercentage: {
      type: Number,
      default: 5, // 5% penalty
      min: 0,
      max: 100
    },
    useGlobalSettings: {
      type: Boolean,
      default: true
    }
  },
  
  // Profile
  avatar: String,
  bio: String,
  
  // Security
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Subscription and billing
  subscriptionStatus: {
    type: String,
    enum: ['trial', 'active', 'inactive', 'cancelled'],
    default: 'trial'
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'pro', 'enterprise'],
    default: 'basic'
  },
  subscriptionExpires: Date,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes
landlordSchema.index({ email: 1 }, { unique: true })
landlordSchema.index({ isActive: 1 })
landlordSchema.index({ subscriptionStatus: 1 })
landlordSchema.index({ createdAt: -1 })

// Virtual for full name
landlordSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for checking if account is locked
landlordSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Pre-save middleware to hash password
landlordSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
landlordSchema.methods.comparePassword = async function(candidatePassword: string) {
  if (!this.password) return false
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to increment login attempts
landlordSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    })
  }
  
  const updates = { $inc: { loginAttempts: 1 } }
  
  // If we're at max attempts and not already locked, lock account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }
  
  return this.updateOne(updates)
}

// Method to reset login attempts
landlordSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  })
}

// Method to generate password reset token
landlordSchema.methods.createPasswordResetToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex')
  
  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  return resetToken
}

// Method to generate email verification token
landlordSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = require('crypto').randomBytes(32).toString('hex')
  
  this.emailVerificationToken = require('crypto')
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex')
  
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  
  return verificationToken
}

// Static method to find by credentials
landlordSchema.statics.findByCredentials = async function(email: string, password: string) {
  const landlord = await this.findOne({ 
    email: email.toLowerCase(),
    isActive: true
  }).select('+password')
  
  if (!landlord) {
    throw new Error('Invalid login credentials')
  }
  
  if (landlord.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts')
  }
  
  const isMatch = await landlord.comparePassword(password)
  
  if (!isMatch) {
    await landlord.incLoginAttempts()
    throw new Error('Invalid login credentials')
  }
  
  // Reset login attempts on successful login
  if (landlord.loginAttempts > 0) {
    await landlord.resetLoginAttempts()
  }
  
  // Update last login
  landlord.lastLogin = new Date()
  landlord.lastActivity = new Date()
  await landlord.save()
  
  return landlord
}

export default mongoose.models.Landlord || mongoose.model('Landlord', landlordSchema)
