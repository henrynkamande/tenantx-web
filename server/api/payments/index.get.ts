import { connectToDatabase } from '../../utils/database'
import Payment from '../../models/Payment'
import Tenant from '../../models/Tenant'
import Unit from '../../models/Unit'
import Property from '../../models/Property'
import { getLandlordFromToken } from '../../utils/getLandlord'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Authenticate landlord
    const landlord = await getLandlordFromToken(event)
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please log in'
      })
    }
    
    // Get query parameters
    const query = getQuery(event)
    
    // Get landlord's properties to filter payments
    const landlordProperties = await Property.find({ landlordId: landlord._id }).select('_id').lean()
    const landlordPropertyIds = landlordProperties.map(p => p._id.toString())
    
    console.log(`Payment list request for landlord ${landlord._id}:`, {
      landlordId: landlord._id,
      propertiesCount: landlordProperties.length,
      propertyIds: landlordPropertyIds,
      requestedPropertyId: query.propertyId || 'all'
    })
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 50
    const search = query.search as string
    const status = query.status as string
    const month = query.month as string
    const propertyId = query.propertyId as string
    const skip = (page - 1) * limit

    // Build search filter - start with landlord restriction
    let filter: any = {
      $or: [
        { landlordId: landlord._id }, // Direct landlord assignment
        { propertyId: { $in: landlordPropertyIds } } // Property-based filtering
      ]
    }
    
    if (status) {
      filter.status = status
    }

    if (month) {
      // Filter by month (format: YYYY-MM)
      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      
      filter.dueDate = {
        $gte: startDate,
        $lt: endDate
      }
    }

    if (propertyId) {
      // Validate that the requested propertyId belongs to the logged-in landlord
      if (!landlordPropertyIds.includes(propertyId)) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied - Property does not belong to you'
        })
      }
      filter.propertyId = propertyId
    }

    // Get payments with pagination and populate related data
    let paymentsQuery = Payment.find(filter)
      .populate({
        path: 'tenantId',
        select: 'personalInfo'
      })
      .populate({
        path: 'unitId',
        populate: {
          path: 'propertyId',
          select: 'name'
        }
      })
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(limit)

    const [payments, total] = await Promise.all([
      paymentsQuery.lean(),
      Payment.countDocuments(filter)
    ])

    // Additional security validation: ensure all returned payments belong to landlord's properties
    const validatedPayments = payments.filter(payment => {
      // Check if payment has landlordId directly assigned
      if (payment.landlordId && payment.landlordId.toString() === landlord._id.toString()) {
        return true
      }
      
      // Check if payment belongs to a property owned by the landlord
      if (payment.propertyId && landlordPropertyIds.includes(payment.propertyId.toString())) {
        return true
      }
      
      // Check through unit's property if unitId is populated
      if (payment.unitId?.propertyId?._id && landlordPropertyIds.includes(payment.unitId.propertyId._id.toString())) {
        return true
      }
      
      // If none of the above conditions are met, exclude this payment
      console.warn(`Payment ${payment._id} does not belong to landlord ${landlord._id}`, {
        paymentLandlordId: payment.landlordId,
        paymentPropertyId: payment.propertyId,
        unitPropertyId: payment.unitId?.propertyId?._id,
        landlordId: landlord._id,
        landlordPropertyIds
      })
      return false
    })
    
    console.log(`Payment validation results for landlord ${landlord._id}:`, {
      originalPaymentsCount: payments.length,
      validatedPaymentsCount: validatedPayments.length,
      filteredOut: payments.length - validatedPayments.length
    })
    
    // Filter by tenant name if search is provided
    let filteredPayments = validatedPayments
    if (search) {
      filteredPayments = validatedPayments.filter(payment => {
        const tenantName = `${payment.tenantId?.personalInfo?.firstName} ${payment.tenantId?.personalInfo?.lastName}`.toLowerCase()
        return tenantName.includes(search.toLowerCase())
      })
    }

    return {
      success: true,
      data: filteredPayments,
      pagination: {
        page,
        limit,
        total: search ? filteredPayments.length : total,
        pages: Math.ceil((search ? filteredPayments.length : total) / limit)
      }
    }
  } catch (error: any) {
    console.error('Get payments error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
