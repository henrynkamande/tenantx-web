// Temporarily disabled to fix server startup issues
// import Payment from '~/server/models/Payment'
// import Unit from '~/server/models/Unit'
// import Property from '~/server/models/Property'
// import Landlord from '~/server/models/Landlord'

export async function checkAndMarkDefaultedPayments() {
  let processedCount = 0
  let defaultedCount = 0
  
  try {
    console.log('Starting automated rent default check...')
    
    // Find all pending/overdue rent payments
    const overduePayments = await Payment.find({
      paymentType: 'Rent',
      status: { $in: ['Pending', 'Overdue'] },
      isDefaulted: false,
      dueDate: { $exists: true }
    }).populate('unitId landlordId')

    console.log(`Found ${overduePayments.length} pending/overdue rent payments to check`)

    for (const payment of overduePayments) {
      try {
        processedCount++
        const currentDate = new Date()
        
        // Get the applicable deadline and penalty settings
        const { deadlineDate, penaltyPercentage } = await getRentSettings(payment)
        
        // Check if payment has exceeded the deadline
        if (currentDate > deadlineDate) {
          // Calculate penalty amount
          const penaltyAmount = (payment.amount * penaltyPercentage) / 100
          
          // Mark as defaulted
          await Payment.findByIdAndUpdate(payment._id, {
            $set: {
              status: 'Defaulted',
              isDefaulted: true,
              defaultedDate: currentDate,
              deadlineDate: deadlineDate,
              penaltyAmount: penaltyAmount,
              penaltyPercentage: penaltyPercentage
            }
          })
          
          defaultedCount++
          console.log(`Payment ${payment._id} marked as defaulted - Amount: ${payment.amount}, Penalty: ${penaltyAmount} (${penaltyPercentage}%)`)
        }
      } catch (paymentError) {
        console.error(`Error processing payment ${payment._id}:`, paymentError)
      }
    }
    
    console.log(`Rent default check completed - Processed: ${processedCount}, Newly defaulted: ${defaultedCount}`)
    
  } catch (error) {
    console.error('Error in automated rent default check:', error)
    throw error
  }
}

export async function getRentSettings(payment: any) {
  try {
    let deadlineDays = 5 // Default
    let penaltyPercentage = 5 // Default
    
    // Get unit details
    const unit = await Unit.findById(payment.unitId).populate('propertyId')
    if (!unit) {
      throw new Error('Unit not found')
    }
    
    // Check if unit has specific settings
    if (unit.rentSettings?.useUnitSpecificSettings) {
      deadlineDays = unit.rentSettings.rentDeadline || deadlineDays
      penaltyPercentage = unit.rentSettings.penaltyPercentage || penaltyPercentage
    } else {
      // Check if property has specific settings
      const property = await Property.findById(unit.propertyId)
      if (property?.rentSettings?.usePropertySpecificSettings) {
        deadlineDays = property.rentSettings.rentDeadline || deadlineDays
        penaltyPercentage = property.rentSettings.penaltyPercentage || penaltyPercentage
      } else {
        // Use landlord's global settings
        const landlord = await Landlord.findById(payment.landlordId)
        if (landlord?.rentSettings) {
          deadlineDays = landlord.rentSettings.globalRentDeadline || deadlineDays
          penaltyPercentage = landlord.rentSettings.defaultPenaltyPercentage || penaltyPercentage
        }
      }
    }
    
    // Calculate deadline date
    const deadlineDate = new Date(payment.dueDate)
    deadlineDate.setDate(deadlineDate.getDate() + deadlineDays)
    
    return {
      deadlineDate,
      penaltyPercentage,
      deadlineDays
    }
  } catch (error) {
    console.error('Error getting rent settings:', error)
    return {
      deadlineDate: new Date(payment.dueDate.getTime() + (5 * 24 * 60 * 60 * 1000)), // 5 days default
      penaltyPercentage: 5,
      deadlineDays: 5
    }
  }
}

export async function calculatePenaltyForPayment(paymentId: string) {
  try {
    const payment = await Payment.findById(paymentId)
    if (!payment) {
      throw new Error('Payment not found')
    }
    
    const { penaltyPercentage } = await getRentSettings(payment)
    const penaltyAmount = (payment.amount * penaltyPercentage) / 100
    
    return {
      penaltyAmount,
      penaltyPercentage
    }
  } catch (error) {
    console.error('Error calculating penalty:', error)
    return {
      penaltyAmount: 0,
      penaltyPercentage: 0
    }
  }
}
