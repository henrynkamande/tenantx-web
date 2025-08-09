import Payment from '~/server/models/Payment'
import { getLandlordFromToken } from '~/server/utils/getLandlord'

export default defineEventHandler(async (event) => {
  try {
    const landlord = await getLandlordFromToken(event)
    
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const paymentId = getRouterParam(event, 'id')
    
    // Debug logging
    console.log('Payment API called with ID:', paymentId)
    console.log('Landlord ID:', landlord._id)
    
    if (!paymentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment ID is required'
      })
    }

    // Find the payment with populated relationships
    console.log('Searching for payment with query:', {
      _id: paymentId,
      landlordId: landlord._id
    })
    
    // First, try to find payment with landlordId
    let payment = await Payment.findOne({
      _id: paymentId,
      landlordId: landlord._id
    })
    .populate({
      path: 'tenantId',
      select: 'personalInfo contactInfo landlordId'
    })
    .populate({
      path: 'unitId',
      select: 'unitNumber propertyId',
      populate: {
        path: 'propertyId',
        select: 'name address landlordId'
      }
    })

    console.log('Payment found with landlordId query:', !!payment)

    // If not found, try to find payment by ID and check landlord ownership through tenant or property
    if (!payment) {
      console.log('Trying fallback query without landlordId restriction')
      const paymentCandidate = await Payment.findById(paymentId)
        .populate({
          path: 'tenantId',
          select: 'personalInfo contactInfo landlordId'
        })
        .populate({
          path: 'unitId',
          select: 'unitNumber propertyId',
          populate: {
            path: 'propertyId',
            select: 'name address landlordId'
          }
        })

      console.log('Payment candidate found:', !!paymentCandidate)
      
      if (paymentCandidate) {
        // Check if landlord owns this payment through tenant or property
        const tenantBelongsToLandlord = paymentCandidate.tenantId?.landlordId?.toString() === landlord._id?.toString()
        const propertyBelongsToLandlord = paymentCandidate.unitId?.propertyId?.landlordId?.toString() === landlord._id?.toString()
        
        console.log('Tenant belongs to landlord:', tenantBelongsToLandlord)
        console.log('Property belongs to landlord:', propertyBelongsToLandlord)
        
        if (tenantBelongsToLandlord || propertyBelongsToLandlord) {
          payment = paymentCandidate
          
          // Update the payment to include landlordId for future queries
          console.log('Updating payment with landlordId for future use')
          await Payment.findByIdAndUpdate(paymentId, { landlordId: landlord._id })
        }
      }
    }

    if (!payment) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Payment not found'
      })
    }

    return {
      success: true,
      data: payment
    }

  } catch (error) {
    console.error('Error fetching payment:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
