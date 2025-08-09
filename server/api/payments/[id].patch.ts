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
    
    if (!paymentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment ID is required'
      })
    }

    const body = await readBody(event)

    // Find the payment first - try with landlordId
    let existingPayment = await Payment.findOne({
      _id: paymentId,
      landlordId: landlord._id
    })

    // If not found, try fallback method
    if (!existingPayment) {
      const paymentCandidate = await Payment.findById(paymentId)
        .populate({
          path: 'tenantId',
          select: 'landlordId'
        })
        .populate({
          path: 'unitId',
          select: 'propertyId',
          populate: {
            path: 'propertyId',
            select: 'landlordId'
          }
        })

      if (paymentCandidate) {
        const tenantBelongsToLandlord = paymentCandidate.tenantId?.landlordId?.toString() === landlord._id?.toString()
        const propertyBelongsToLandlord = paymentCandidate.unitId?.propertyId?.landlordId?.toString() === landlord._id?.toString()
        
        if (tenantBelongsToLandlord || propertyBelongsToLandlord) {
          existingPayment = paymentCandidate
          // Update with landlordId for future use
          await Payment.findByIdAndUpdate(paymentId, { landlordId: landlord._id })
        }
      }
    }

    if (!existingPayment) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Payment not found'
      })
    }

    // Prepare update data
    const updateData = {
      amount: body.amount,
      paymentType: body.paymentType,
      dueDate: body.dueDate,
      status: body.status,
      updatedAt: new Date()
    }

    // Add optional fields if provided
    if (body.paymentDate !== undefined) {
      updateData.paymentDate = body.paymentDate ? new Date(body.paymentDate) : null
    }
    
    if (body.paymentMethod !== undefined) {
      updateData.paymentMethod = body.paymentMethod
    }
    
    if (body.transactionId !== undefined) {
      updateData.transactionId = body.transactionId
    }
    
    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    // Handle default-related fields if payment is defaulted
    if (existingPayment.isDefaulted) {
      if (body.penaltyAmount !== undefined) {
        updateData.penaltyAmount = body.penaltyAmount
      }
      
      if (body.penaltyPercentage !== undefined) {
        updateData.penaltyPercentage = body.penaltyPercentage
      }
      
      if (body.defaultedDate !== undefined) {
        updateData.defaultedDate = body.defaultedDate ? new Date(body.defaultedDate) : existingPayment.defaultedDate
      }
      
      if (body.deadlineDate !== undefined) {
        updateData.deadlineDate = body.deadlineDate ? new Date(body.deadlineDate) : existingPayment.deadlineDate
      }
    }

    // Update the payment
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate({
      path: 'tenantId',
      select: 'personalInfo contactInfo'
    })
    .populate({
      path: 'unitId',
      select: 'unitNumber propertyId',
      populate: {
        path: 'propertyId',
        select: 'name address'
      }
    })

    return {
      success: true,
      data: updatedPayment,
      message: 'Payment updated successfully'
    }

  } catch (error) {
    console.error('Error updating payment:', error)
    
    if (error.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.errors
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
