import { connectToDatabase } from '~/server/utils/database'
import Tenant from '~/server/models/Tenant'
import Payment from '~/server/models/Payment'
import Unit from '~/server/models/Unit'
import Property from '~/server/models/Property'
import { getLandlordFromToken } from '~/server/utils/getLandlord'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const landlord = await getLandlordFromToken(event)
    if (!landlord) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const tenantId = getRouterParam(event, 'id')
    const query = getQuery(event)
    
    // Date range for statement (default to last 12 months)
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date()
    const startDate = query.startDate ? new Date(query.startDate as string) : new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate())

    if (!tenantId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tenant ID is required'
      })
    }

    // Get tenant information
    const tenant = await Tenant.findOne({
      _id: tenantId,
      landlordId: landlord._id
    }).populate({
      path: 'currentUnit',
      populate: {
        path: 'propertyId',
        select: 'name address'
      }
    })

    if (!tenant) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tenant not found'
      })
    }

    // Get payment history for the period
    const payments = await Payment.find({
      tenantId: tenantId,
      dueDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate({
      path: 'unitId',
      select: 'unitNumber',
      populate: {
        path: 'propertyId',
        select: 'name'
      }
    })
    .sort({ dueDate: 1 })

    // Calculate statement totals
    const totalCharges = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalPaid = payments
      .filter(payment => payment.status === 'Completed')
      .reduce((sum, payment) => sum + (payment.amountPaid || payment.amount), 0)
    
    const partialPaid = payments
      .filter(payment => payment.status === 'Partial')
      .reduce((sum, payment) => sum + (payment.amountPaid || 0), 0)

    const totalReceived = totalPaid + partialPaid
    const outstandingBalance = totalCharges - totalReceived

    // Get current rent amount (from most recent rent payment)
    const rentPayments = payments.filter(p => p.paymentType === 'Rent')
    const currentRent = rentPayments.length > 0 ? rentPayments[rentPayments.length - 1].amount : 0

    // Group payments by month for better organization
    const paymentsByMonth = payments.reduce((acc, payment) => {
      const monthKey = new Date(payment.dueDate).toISOString().slice(0, 7) // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = []
      }
      acc[monthKey].push(payment)
      return acc
    }, {} as Record<string, typeof payments>)

    // Calculate aging of outstanding payments
    const today = new Date()
    const aging = {
      current: 0,
      days30: 0,
      days60: 0,
      days90plus: 0
    }

    payments.forEach(payment => {
      if (payment.status !== 'Completed') {
        const daysPastDue = Math.floor((today.getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        const outstandingAmount = payment.amount - (payment.amountPaid || 0)
        
        if (daysPastDue <= 0) {
          aging.current += outstandingAmount
        } else if (daysPastDue <= 30) {
          aging.days30 += outstandingAmount
        } else if (daysPastDue <= 60) {
          aging.days60 += outstandingAmount
        } else {
          aging.days90plus += outstandingAmount
        }
      }
    })

    return {
      success: true,
      data: {
        tenant: {
          id: tenant._id,
          name: `${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`,
          email: tenant.contactInfo.email,
          phone: tenant.contactInfo.phone,
          currentUnit: tenant.currentUnit ? {
            unitNumber: tenant.currentUnit.unitNumber,
            property: tenant.currentUnit.propertyId?.name,
            address: tenant.currentUnit.propertyId?.address
          } : null,
          leaseStartDate: tenant.leaseDetails?.startDate,
          leaseEndDate: tenant.leaseDetails?.endDate,
          currentRent: currentRent
        },
        landlord: {
          name: `${landlord.personalInfo.firstName} ${landlord.personalInfo.lastName}`,
          company: landlord.businessInfo?.companyName,
          email: landlord.contactInfo.email,
          phone: landlord.contactInfo.phone,
          address: landlord.contactInfo.address
        },
        statement: {
          periodStart: startDate,
          periodEnd: endDate,
          generatedDate: new Date(),
          totalCharges: totalCharges,
          totalReceived: totalReceived,
          outstandingBalance: outstandingBalance,
          aging: aging
        },
        payments: payments,
        paymentsByMonth: paymentsByMonth
      }
    }

  } catch (error) {
    console.error('Error generating tenant statement:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
