import { connectToDatabase } from '~/server/utils/database'
import Tenant from '~/server/models/Tenant'
import Landlord from '~/server/models/Landlord'
import PaymentMethod from '~/server/models/PaymentMethod'
import LandlordSettings from '~/server/models/LandlordSettings'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get authenticated user
    const user = await getCurrentUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    // Ensure the user is a tenant
    if (user.role !== 'tenant') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied - Tenant access required'
      })
    }
    
    // Get tenant details to find their landlord
    const tenant = await Tenant.findById(user._id)
      .populate('landlordId')
    
    if (!tenant || !tenant.landlordId) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tenant or landlord information not found'
      })
    }
    
    const landlordId = tenant.landlordId._id
    
    // Get landlord settings
    const settings = await LandlordSettings.findOne({ landlordId })
    
    // Get active payment methods for this landlord
    const paymentMethods = await PaymentMethod.find({
      landlordId,
      isActive: true
    }).sort({ order: 1, isDefault: -1 })
    
    // Prepare landlord info for tenant view
    const landlordInfo = {
      name: tenant.landlordId.companyName || `${tenant.landlordId.firstName} ${tenant.landlordId.lastName}`,
      email: settings?.email || tenant.landlordId.email,
      phone: settings?.phone || tenant.landlordId.phone,
      address: settings?.address || null,
      paymentMethods: paymentMethods.map(method => ({
        _id: method._id,
        label: method.label,
        type: method.type,
        mpesa: method.mpesa || {},
        bank: method.bank || {},
        instructions: method.instructions || '',
        isDefault: method.isDefault
      }))
    }
    
    return {
      success: true,
      data: landlordInfo
    }
  } catch (error) {
    console.error('Tenant landlord info fetch error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch landlord information'
    })
  }
})
