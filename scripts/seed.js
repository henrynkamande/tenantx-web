import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Define Landlord schema based on the actual model
const LandlordSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String, trim: true },
  companyName: { type: String, trim: true },
  companyAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Kenya' }
  },
  preferredCurrency: { type: String, enum: ['KES', 'USD', 'EUR', 'GBP'], default: 'KES' },
  language: { type: String, enum: ['en', 'sw'], default: 'en' },
  timezone: { type: String, default: 'Africa/Nairobi' },
  avatar: String,
  bio: String,
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  subscriptionStatus: { type: String, enum: ['trial', 'active', 'inactive', 'cancelled'], default: 'trial' },
  subscriptionPlan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
  subscriptionExpires: Date,
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true })

const PropertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  type: { type: String, enum: ['apartment', 'house', 'condo', 'townhouse'] },
  units: Number,
  rent: Number,
  deposit: Number,
  size: Number,
  bedrooms: Number,
  bathrooms: Number,
  amenities: [String],
  description: String,
  isActive: { type: Boolean, default: true },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const TenantSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  propertyId: { type: String, required: true },
  unit: String,
  leaseStart: Date,
  leaseEnd: Date,
  rent: Number,
  deposit: Number,
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  documents: [{ name: String, url: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const PaymentSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  propertyId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['rent', 'deposit', 'utilities', 'late_fee', 'maintenance'] },
  method: { type: String, enum: ['cash', 'check', 'bank_transfer', 'credit_card'] },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'pending' },
  date: { type: Date, required: true },
  dueDate: Date,
  reference: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
})

const ExpenseSchema = new mongoose.Schema({
  propertyId: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  vendor: String,
  date: { type: Date, required: true },
  paymentMethod: String,
  status: { type: String, enum: ['pending', 'approved', 'paid', 'rejected'], default: 'pending' },
  receipt: String,
  notes: String,
  approvedBy: String,
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now }
})

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  propertyId: { type: String, required: true },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  items: [{
    description: String,
    quantity: Number,
    rate: Number,
    amount: Number
  }],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft' },
  notes: String,
  sentAt: Date,
  paidAt: Date,
  createdAt: { type: Date, default: Date.now }
})

const ReceiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  paymentId: { type: String, required: true },
  tenantId: { type: String, required: true },
  propertyId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: String,
  date: { type: Date, required: true },
  description: String,
  generatedAt: { type: Date, default: Date.now },
  pdfUrl: String
})

// Hash password before saving
LandlordSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Create models
const Landlord = mongoose.models.Landlord || mongoose.model('Landlord', LandlordSchema)
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema)
const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema)
const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema)
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema)
const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', ReceiptSchema)

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tenantx')
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// Generate random data helpers
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)]
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const getRandomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2)
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

// Kenyan demographic data arrays
const firstNames = [
  // Male names
  'John', 'Peter', 'David', 'James', 'Samuel', 'Daniel', 'Michael', 'Joseph',
  'Paul', 'Anthony', 'Francis', 'Stephen', 'Mark', 'Robert', 'Brian',
  'Collins', 'Kennedy', 'Victor', 'Emmanuel', 'Felix',
  // Female names
  'Mary', 'Grace', 'Ann', 'Jane', 'Ruth', 'Faith', 'Joyce', 'Catherine',
  'Elizabeth', 'Margaret', 'Sarah', 'Rebecca', 'Susan', 'Lucy', 'Nancy',
  'Mercy', 'Rose', 'Esther', 'Christine', 'Winnie'
]

const lastNames = [
  // Common Kenyan surnames
  'Wanjiku', 'Kamau', 'Njoroge', 'Mwangi', 'Kiprotich', 'Rotich', 'Cheruiyot',
  'Ochieng', 'Otieno', 'Owino', 'Achieng', 'Adhiambo', 'Awino', 'Juma',
  'Hassan', 'Mohamed', 'Ali', 'Omar', 'Abdalla', 'Salim', 'Mutua', 'Musyoka',
  'Kyalo', 'Muthui', 'Gitau', 'Karanja', 'Macharia', 'Kinyua', 'Wairimu',
  'Wambui', 'Nduta', 'Nyokabi', 'Kibaki', 'Ruto', 'Odinga', 'Kenyatta'
]

const streetNames = [
  'Kenyatta Avenue', 'Uhuru Highway', 'Moi Avenue', 'Haile Selassie Avenue',
  'University Way', 'Tom Mboya Street', 'Ronald Ngala Street', 'River Road',
  'Jogoo Road', 'Thika Road', 'Waiyaki Way', 'Langata Road', 'Karen Road',
  'Kilimani Road', 'Kiambu Road', 'Limuru Road', 'Ngong Road', 'Valley Road',
  'Woodvale Grove', 'Riverside Drive'
]

const cities = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
  'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho',
  'Kisii', 'Kilifi', 'Voi', 'Wajir', 'Marsabit', 'Lamu'
]

const counties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Kiambu',
  'Kilifi', 'Kitui', 'Garissa', 'Kakamega', 'Machakos', 'Meru',
  'Nyeri', 'Kericho', 'Kisii', 'Kajiado', 'Taita Taveta', 'Wajir',
  'Marsabit', 'Lamu'
]

const propertyTypes = ['apartment', 'house', 'condo', 'townhouse']
const expenseCategories = ['maintenance', 'utilities', 'repairs', 'cleaning', 'supplies', 'insurance', 'legal', 'other']
const maintenanceTypes = ['plumbing', 'electrical', 'hvac', 'appliance', 'cleaning', 'landscaping', 'general', 'emergency']

// Seeder functions
const seedLandlords = async () => {
  console.log('Seeding landlords...')
  const landlords = []
  
  // Create demo admin landlord
  landlords.push({
    firstName: 'Demo',
    lastName: 'Admin',
    email: 'admin@tenantx.com',
    password: 'admin123', // Will be hashed by pre-save middleware
    phone: '+254 700 123 456',
    companyName: 'TenantX Demo Properties',
    companyAddress: {
      street: '123 Kenyatta Avenue',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    },
    preferredCurrency: 'KES',
    language: 'en',
    timezone: 'Africa/Nairobi',
    bio: 'Demo landlord account for TenantX property management system',
    isEmailVerified: true,
    subscriptionStatus: 'active',
    subscriptionPlan: 'pro',
    isActive: true
  })

  // Create additional demo landlords with Kenyan names
  for (let i = 0; i < 4; i++) {
    const firstName = getRandomElement(firstNames)
    const lastName = getRandomElement(lastNames)
    const city = getRandomElement(cities)
    const county = getRandomElement(counties)
    
    landlords.push({
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      password: 'password123',
      phone: `+254 7${String(getRandomNumber(10, 99))} ${String(getRandomNumber(100, 999))} ${String(getRandomNumber(100, 999))}`,
      companyName: `${firstName} ${lastName} Properties`,
      companyAddress: {
        street: `${getRandomNumber(1, 999)} ${getRandomElement(streetNames)}`,
        city,
        state: county,
        zipCode: String(getRandomNumber(10000, 99999)),
        country: 'Kenya'
      },
      preferredCurrency: getRandomElement(['KES', 'USD']),
      language: getRandomElement(['en', 'sw']),
      timezone: 'Africa/Nairobi',
      bio: `Property management professional based in ${city}`,
      isEmailVerified: Math.random() > 0.3,
      subscriptionStatus: getRandomElement(['trial', 'active']),
      subscriptionPlan: getRandomElement(['basic', 'pro']),
      isActive: Math.random() > 0.1
    })
  }

  await Landlord.insertMany(landlords)
  console.log(`✅ Created ${landlords.length} landlords`)
  return await Landlord.find()
}

const seedProperties = async () => {
  console.log('Seeding properties...')
  const properties = []
  
  for (let i = 0; i < 15; i++) {
    const streetNumber = getRandomNumber(1, 999)
    const streetName = getRandomElement(streetNames)
    const city = getRandomElement(cities)
    const county = getRandomElement(counties)
    const zipCode = getRandomNumber(10000, 99999)
    
    // Kenyan rent ranges (in KES)
    const rentRanges = {
      'Nairobi': [15000, 80000],
      'Mombasa': [10000, 45000],
      'Kisumu': [8000, 35000],
      'Nakuru': [8000, 30000],
      'Eldoret': [7000, 25000]
    }
    
    const baseRent = rentRanges[city] || [5000, 20000]
    const rent = getRandomNumber(baseRent[0], baseRent[1])
    
    properties.push({
      name: `${streetNumber} ${streetName}`,
      address: {
        street: `${streetNumber} ${streetName}`,
        city,
        state: county,
        zipCode: zipCode.toString(),
        country: 'Kenya'
      },
      type: getRandomElement(propertyTypes),
      units: getRandomNumber(1, 24),
      rent,
      deposit: rent * getRandomNumber(1, 3), // 1-3 months deposit
      size: getRandomNumber(400, 2000), // Square feet
      bedrooms: getRandomNumber(1, 4),
      bathrooms: getRandomNumber(1, 3),
      amenities: [
        'parking', 'security', 'water_backup', 'generator', 'garden', 'balcony', 
        'fitted_kitchen', 'master_ensuite', 'borehole', 'cctv', 'perimeter_wall'
      ].filter(() => Math.random() > 0.6),
      description: `Modern ${getRandomElement(propertyTypes)} located in ${city}, ${county}. Well-maintained property with excellent amenities and convenient location.`,
      isActive: Math.random() > 0.1, // 90% active
      images: [`https://picsum.photos/800/600?random=${i}`]
    })
  }

  await Property.insertMany(properties)
  console.log(`✅ Created ${properties.length} properties`)
  return await Property.find()
}

const seedTenants = async (properties) => {
  console.log('Seeding tenants...')
  const tenants = []
  
  for (let i = 0; i < 20; i++) {
    const firstName = getRandomElement(firstNames)
    const lastName = getRandomElement(lastNames)
    const property = getRandomElement(properties)
    const leaseStart = getRandomDate(new Date(2023, 0, 1), new Date(2024, 6, 1))
    const leaseEnd = new Date(leaseStart.getTime() + (365 * 24 * 60 * 60 * 1000)) // 1 year later
    
    tenants.push({
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      phone: `(${getRandomNumber(200, 999)}) ${getRandomNumber(200, 999)}-${getRandomNumber(1000, 9999)}`,
      propertyId: property._id.toString(),
      unit: getRandomNumber(1, property.units).toString(),
      leaseStart,
      leaseEnd,
      rent: property.rent + getRandomNumber(-200, 200), // Slight variation from base rent
      deposit: property.deposit,
      status: getRandomElement(['active', 'inactive', 'pending']),
      emergencyContact: {
        name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        phone: `(${getRandomNumber(200, 999)}) ${getRandomNumber(200, 999)}-${getRandomNumber(1000, 9999)}`,
        relationship: getRandomElement(['spouse', 'parent', 'sibling', 'friend'])
      },
      documents: [
        { name: 'Lease Agreement', url: '/documents/lease.pdf' },
        { name: 'ID Copy', url: '/documents/id.pdf' }
      ]
    })
  }

  await Tenant.insertMany(tenants)
  console.log(`✅ Created ${tenants.length} tenants`)
  return await Tenant.find()
}

const seedPayments = async (tenants, properties) => {
  console.log('Seeding payments...')
  const payments = []
  
  for (let i = 0; i < 20; i++) {
    const tenant = getRandomElement(tenants)
    const property = properties.find(p => p._id.toString() === tenant.propertyId)
    const paymentDate = getRandomDate(new Date(2024, 0, 1), new Date())
    
    payments.push({
      tenantId: tenant._id.toString(),
      propertyId: property._id.toString(),
      amount: parseFloat(getRandomFloat(tenant.rent * 0.8, tenant.rent * 1.2)),
      type: getRandomElement(['rent', 'deposit', 'utilities', 'late_fee', 'maintenance']),
      method: getRandomElement(['cash', 'check', 'bank_transfer', 'credit_card']),
      status: getRandomElement(['completed', 'pending', 'failed']),
      date: paymentDate,
      dueDate: new Date(paymentDate.getTime() - (getRandomNumber(0, 10) * 24 * 60 * 60 * 1000)),
      reference: `PAY-${Date.now()}-${i}`,
      notes: Math.random() > 0.7 ? `Payment for ${tenant.firstName} ${tenant.lastName}` : ''
    })
  }

  await Payment.insertMany(payments)
  console.log(`✅ Created ${payments.length} payments`)
  return await Payment.find()
}

const seedExpenses = async (properties) => {
  console.log('Seeding expenses...')
  const expenses = []
  
  for (let i = 0; i < 20; i++) {
    const property = getRandomElement(properties)
    const expenseDate = getRandomDate(new Date(2024, 0, 1), new Date())
    const category = getRandomElement(expenseCategories)
    
    expenses.push({
      propertyId: property._id.toString(),
      description: `${category.charAt(0).toUpperCase() + category.slice(1)} expense for ${property.name}`,
      amount: parseFloat(getRandomFloat(50, 1500)),
      category,
      vendor: `${getRandomElement(['ABC', 'XYZ', 'Best', 'Pro', 'Elite'])} ${getRandomElement(['Services', 'Solutions', 'Company', 'Corp', 'LLC'])}`,
      date: expenseDate,
      paymentMethod: getRandomElement(['cash', 'check', 'credit_card', 'bank_transfer']),
      status: getRandomElement(['pending', 'approved', 'paid', 'rejected']),
      receipt: Math.random() > 0.7 ? `/receipts/receipt-${i}.pdf` : null,
      notes: Math.random() > 0.6 ? `Routine ${category} work completed successfully` : '',
      approvedBy: Math.random() > 0.5 ? 'manager@tenantx.com' : null,
      approvedAt: Math.random() > 0.5 ? expenseDate : null
    })
  }

  await Expense.insertMany(expenses)
  console.log(`✅ Created ${expenses.length} expenses`)
  return await Expense.find()
}

const seedInvoices = async (tenants, properties) => {
  console.log('Seeding invoices...')
  const invoices = []
  
  for (let i = 0; i < 20; i++) {
    const tenant = getRandomElement(tenants)
    const property = properties.find(p => p._id.toString() === tenant.propertyId)
    const issueDate = getRandomDate(new Date(2024, 0, 1), new Date())
    const dueDate = new Date(issueDate.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days later
    
    const items = [
      {
        description: 'Monthly Rent',
        quantity: 1,
        rate: tenant.rent,
        amount: tenant.rent
      }
    ]
    
    // Sometimes add additional charges
    if (Math.random() > 0.7) {
      items.push({
        description: 'Utilities',
        quantity: 1,
        rate: parseFloat(getRandomFloat(50, 200)),
        amount: parseFloat(getRandomFloat(50, 200))
      })
    }
    
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const taxRate = Math.random() > 0.5 ? 8.5 : 0
    const taxAmount = subtotal * (taxRate / 100)
    const totalAmount = subtotal + taxAmount
    
    invoices.push({
      invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
      tenantId: tenant._id.toString(),
      propertyId: property._id.toString(),
      issueDate,
      dueDate,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount: 0,
      totalAmount,
      status: getRandomElement(['draft', 'sent', 'paid', 'overdue']),
      notes: `Invoice for ${property.name} - ${tenant.firstName} ${tenant.lastName}`,
      sentAt: Math.random() > 0.3 ? issueDate : null,
      paidAt: Math.random() > 0.5 ? new Date(dueDate.getTime() + getRandomNumber(-5, 10) * 24 * 60 * 60 * 1000) : null
    })
  }

  await Invoice.insertMany(invoices)
  console.log(`✅ Created ${invoices.length} invoices`)
  return await Invoice.find()
}

const seedReceipts = async (payments, tenants, properties) => {
  console.log('Seeding receipts...')
  const receipts = []
  
  // Create receipts for completed payments
  const completedPayments = payments.filter(p => p.status === 'completed')
  
  for (let i = 0; i < Math.min(20, completedPayments.length); i++) {
    const payment = completedPayments[i]
    const tenant = tenants.find(t => t._id.toString() === payment.tenantId)
    const property = properties.find(p => p._id.toString() === payment.propertyId)
    
    receipts.push({
      receiptNumber: `REC-${String(i + 1).padStart(4, '0')}`,
      paymentId: payment._id.toString(),
      tenantId: tenant._id.toString(),
      propertyId: property._id.toString(),
      amount: payment.amount,
      paymentMethod: payment.method,
      date: payment.date,
      description: `Payment receipt for ${property.name} - ${tenant.firstName} ${tenant.lastName}`,
      generatedAt: payment.date,
      pdfUrl: `/receipts/receipt-${i + 1}.pdf`
    })
  }

  await Receipt.insertMany(receipts)
  console.log(`✅ Created ${receipts.length} receipts`)
}

// Main seeder function
const seedDatabase = async () => {
  try {
    await connectDB()
    
    console.log('🌱 Starting database seeding with Kenyan demo data...\n')
    
    // Clear existing data
    console.log('Clearing existing data...')
    await Promise.all([
      Landlord.deleteMany({}),
      Property.deleteMany({}),
      Tenant.deleteMany({}),
      Payment.deleteMany({}),
      Expense.deleteMany({}),
      Invoice.deleteMany({}),
      Receipt.deleteMany({})
    ])
    console.log('✅ Cleared existing data\n')
    
    // Seed data in order (to maintain relationships)
    const landlords = await seedLandlords()
    const properties = await seedProperties()
    const tenants = await seedTenants(properties)
    const payments = await seedPayments(tenants, properties)
    const expenses = await seedExpenses(properties)
    const invoices = await seedInvoices(tenants, properties)
    await seedReceipts(payments, tenants, properties)
    
    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`👤 Landlords: ${landlords.length}`)
    console.log(`🏠 Properties: ${properties.length}`)
    console.log(`🤝 Tenants: ${tenants.length}`)
    console.log(`💰 Payments: ${payments.length}`)
    console.log(`💸 Expenses: ${expenses.length}`)
    console.log(`📄 Invoices: ${invoices.length}`)
    console.log(`🧾 Receipts: ${await Receipt.countDocuments()}`)
    
    console.log('\n🔐 Login credentials:')
    console.log('Email: admin@tenantx.com')
    console.log('Password: admin123')
    
    console.log('\n🇰🇪 All data generated with Kenyan demographics and KES currency')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run seeder
seedDatabase()
