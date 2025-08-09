// Migration script to populate missing landlordId in payments
const mongoose = require('mongoose')

// Since we're using CommonJS, we need to import the models differently
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tenantx')
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// Define schemas directly in the migration script to avoid import issues
const PaymentSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord' },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  amount: Number,
  paymentDate: Date,
  dueDate: Date,
  paymentType: String,
  status: String
}, { timestamps: true })

const TenantSchema = new mongoose.Schema({
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord' }
})

const UnitSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' }
})

const PropertySchema = new mongoose.Schema({
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord' }
})

const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)
const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema)
const Unit = mongoose.models.Unit || mongoose.model('Unit', UnitSchema)
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema)

async function migratePaymentLandlordIds() {
  try {
    console.log('Starting payment landlordId migration...')
    
    // Find all payments that don't have landlordId set
    const paymentsWithoutLandlordId = await Payment.find({
      $or: [
        { landlordId: { $exists: false } },
        { landlordId: null },
        { landlordId: undefined }
      ]
    }).populate('tenantId').populate({
      path: 'unitId',
      populate: {
        path: 'propertyId'
      }
    })

    console.log(`Found ${paymentsWithoutLandlordId.length} payments without landlordId`)

    let updated = 0
    let skipped = 0

    for (const payment of paymentsWithoutLandlordId) {
      let landlordId = null

      // Try to get landlordId from tenant
      if (payment.tenantId?.landlordId) {
        landlordId = payment.tenantId.landlordId
        console.log(`Payment ${payment._id}: Got landlordId from tenant`)
      }
      // Try to get landlordId from property via unit
      else if (payment.unitId?.propertyId?.landlordId) {
        landlordId = payment.unitId.propertyId.landlordId
        console.log(`Payment ${payment._id}: Got landlordId from property`)
      }
      // If we still don't have landlordId, try to find it through unit->property
      else if (payment.unitId && !payment.unitId.propertyId) {
        const unit = await Unit.findById(payment.unitId).populate('propertyId')
        if (unit?.propertyId?.landlordId) {
          landlordId = unit.propertyId.landlordId
          console.log(`Payment ${payment._id}: Got landlordId from unit->property lookup`)
        }
      }

      if (landlordId) {
        await Payment.findByIdAndUpdate(payment._id, {
          landlordId: landlordId,
          // Also set propertyId if we have it and it's missing
          ...(payment.unitId?.propertyId?._id && !payment.propertyId ? { propertyId: payment.unitId.propertyId._id } : {})
        })
        updated++
        console.log(`✓ Updated payment ${payment._id} with landlordId ${landlordId}`)
      } else {
        skipped++
        console.log(`⚠ Skipped payment ${payment._id} - could not determine landlordId`)
      }
    }

    console.log('\nMigration complete!')
    console.log(`✓ Updated: ${updated} payments`)
    console.log(`⚠ Skipped: ${skipped} payments`)

  } catch (error) {
    console.error('Migration error:', error)
  }
}

async function main() {
  await connectToDatabase()
  await migratePaymentLandlordIds()
  await mongoose.connection.close()
  console.log('Database connection closed')
}

// Run the migration
main().catch(console.error)
