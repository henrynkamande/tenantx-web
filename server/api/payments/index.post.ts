import { connectToDatabase } from '../../utils/database'
import Payment from '../../models/Payment'
import Unit from '../../models/Unit'
import mongoose from 'mongoose'
import Joi from 'joi'
import { getLandlordFromToken } from '../../utils/getLandlord'

const paymentSchema = Joi.object({
  tenantId: Joi.string().required(),
  unitId: Joi.string().allow(''),
  amount: Joi.number().min(0).required(),
  paymentType: Joi.string().valid('Rent', 'Security Deposit', 'Late Fee', 'Pet Fee', 'Utility', 'Other').default('Rent'),
  monthFor: Joi.when('paymentType', {
    is: 'Rent',
    then: Joi.string().pattern(/^\d{4}-\d{2}$/).required().messages({
      'string.pattern.base': 'Month for rent payment must be in YYYY-MM format',
      'any.required': 'Month is required for rent payments'
    }),
    otherwise: Joi.string().allow('').optional()
  }),
  dueDate: Joi.date().required(),
  paymentDate: Joi.date().allow(''),
  status: Joi.string().valid('Pending', 'Completed', 'Overdue', 'Partial').default('Pending'),
  paymentMethod: Joi.string().valid('Cash', 'Check', 'Bank Transfer', 'Credit Card', 'Online Payment', 'Money Order').allow(''),
  checkNumber: Joi.string().allow(''),
  transactionId: Joi.string().allow(''),
  lateFee: Joi.number().min(0).allow(null),
  daysOverdue: Joi.number().min(0).allow(null),
  notes: Joi.string().allow('').default('')
})

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()

    // Get authenticated landlord
    const landlord = await getLandlordFromToken(event)
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const body = await readBody(event)

    // Validate input
    const { error, value } = paymentSchema.validate(body)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    // Get unit information for validation and propertyId extraction
    let unit = null
    if (value.unitId) {
      unit = await Unit.findById(value.unitId).populate('propertyId')
      if (!unit) {
        throw createError({
          statusCode: 400,
          statusMessage: 'The selected unit could not be found. Please refresh the page and try selecting the tenant again.'
        })
      }
    }

    // For rent payments, check for overpayment
    if (value.paymentType === 'Rent' && value.monthFor && unit) {

      // Get existing payments for this tenant and month
      const existingPayments = await Payment.find({
        tenantId: value.tenantId,
        paymentType: 'Rent',
        monthFor: value.monthFor,
        status: { $in: ['Completed', 'Partial'] }
      })

      // Calculate total already paid for this month
      const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0)

      // Check if new payment would exceed the unit's rent amount
      if (totalPaid + value.amount > unit.rentAmount) {
        const remainingAmount = unit.rentAmount - totalPaid

        if (remainingAmount <= 0) {
          throw createError({
            statusCode: 400,
            statusMessage: `Rent for this month has already been paid in full. Unit rent: ${unit.rentAmount}, Total paid: ${totalPaid}. No additional payment is needed.`
          })
        } else {
          throw createError({
            statusCode: 400,
            statusMessage: `Payment amount exceeds remaining balance. Maximum allowed: ${remainingAmount}. Unit rent: ${unit.rentAmount}, Already paid: ${totalPaid}.`
          })
        }
      }

      // If this payment completes the full rent amount, set status to Completed
      if (totalPaid + value.amount === unit.rentAmount && value.status === 'Partial') {
        value.status = 'Completed'
      }
    }

    // Create payment object
    const paymentData = {
      tenantId: value.tenantId,
      unitId: value.unitId || null,
      landlordId: landlord._id, // Set landlord for authorization
      propertyId: unit?.propertyId?._id || null, // Auto-populate propertyId for reporting
      amount: value.amount,
      paymentType: value.paymentType,
      monthFor: value.monthFor || null,
      dueDate: value.dueDate,
      status: value.status,
      paymentMethod: value.paymentMethod || null,
      checkNumber: value.checkNumber || null,
      transactionId: value.transactionId || null,
      lateFee: value.lateFee || null,
      daysOverdue: value.daysOverdue || null,
      notes: value.notes
    }

    // Only set paymentDate if it's provided, otherwise let Mongoose use the default
    if (value.paymentDate) {
      paymentData.paymentDate = value.paymentDate
    }

    // If payment date is provided and status is pending, auto-set to completed
    if (paymentData.paymentDate && paymentData.status === 'Pending') {
      paymentData.status = 'Completed'
    }

    // Create payment
    const payment = new Payment(paymentData)
    await payment.save()

    // Populate the payment with tenant and unit info for response
    await payment.populate([
      { path: 'tenantId', select: 'personalInfo' },
      { path: 'unitId', select: 'unitNumber' }
    ])

    return {
      success: true,
      data: payment,
      message: 'Payment recorded successfully'
    }
  } catch (error: any) {
    console.error('Create payment error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
