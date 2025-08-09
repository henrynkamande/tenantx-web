import { connectToDatabase } from '../../utils/database'
import Payment from '../../models/Payment'
import Tenant from '../../models/Tenant'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get all payments
    const allPayments = await Payment.find({}).limit(10).lean()
    const totalPayments = await Payment.countDocuments({})
    
    // Get all tenants
    const allTenants = await Tenant.find({}).select('_id personalInfo').limit(5).lean()
    const totalTenants = await Tenant.countDocuments({})
    
    // Get payments with tenant info
    const paymentsWithTenants = await Payment.find({})
      .populate({
        path: 'tenantId',
        select: 'personalInfo'
      })
      .limit(10)
      .lean()
    
    return {
      success: true,
      data: {
        totalPayments,
        totalTenants,
        samplePayments: allPayments,
        sampleTenants: allTenants,
        paymentsWithTenants: paymentsWithTenants.map(p => ({
          _id: p._id,
          amount: p.amount,
          tenantId: p.tenantId,
          status: p.status,
          paymentType: p.paymentType
        }))
      }
    }
  } catch (error: any) {
    console.error('Debug payments error:', error)
    
    return {
      success: false,
      error: error.message
    }
  }
})
