import { getLandlordFromToken } from '~/server/utils/getLandlord'

export default defineEventHandler(async (event) => {
  try {
    console.log('Debug payment endpoint called')
    
    // Authenticate landlord
    const landlord = await getLandlordFromToken(event)
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please log in'
      })
    }
    
    const paymentId = getRouterParam(event, 'id')
    console.log('Payment ID:', paymentId)
    console.log('Landlord ID:', landlord._id)
    
    if (!paymentId) {
      return {
        success: false,
        error: 'No payment ID provided',
        paymentId
      }
    }

    // Test if we can import the models
    try {
      const Payment = await import('~/server/models/Payment')
      console.log('Payment model imported successfully')
      
      // Test basic database query
      const payment = await Payment.default.findById(paymentId)
      console.log('Payment found:', !!payment)
      
      return {
        success: true,
        paymentId,
        paymentExists: !!payment,
        paymentData: payment ? {
          id: payment._id,
          amount: payment.amount,
          status: payment.status,
          paymentType: payment.paymentType
        } : null
      }
    } catch (modelError) {
      console.error('Model import error:', modelError)
      return {
        success: false,
        error: 'Model import failed',
        details: modelError.message
      }
    }
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})
