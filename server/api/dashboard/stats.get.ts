import { connectToDatabase } from '../../utils/database'
import { getCurrentUser } from '../../utils/auth'
import { formatCurrencyAmount } from '../../utils/currency'
import Property from '../../models/Property'
import Unit from '../../models/Unit'
import Tenant from '../../models/Tenant'
import Payment from '../../models/Payment'
import Maintenance from '../../models/Maintenance'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    // Get authenticated user
    const currentUser = await getCurrentUser(event)
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    const userCurrency = currentUser?.preferredCurrency || 'USD'
    const landlordId = currentUser._id
    
    // Get all properties owned by this landlord
    const landlordProperties = await Property.find({ landlordId }).select('_id')
    const propertyIds = landlordProperties.map(p => p._id)
    
    if (propertyIds.length === 0) {
      // No properties, return zero stats
      return {
        success: true,
        data: {
          totalProperties: 0,
          totalUnits: 0,
          occupiedUnits: 0,
          vacantUnits: 0,
          activeTenants: 0,
          monthlyRevenue: 0,
          pendingMaintenance: 0,
          overduePayments: 0,
          defaultedPayments: 0,
          occupancyRate: 0,
          recentActivities: [],
          revenueData: [],
          occupancyData: []
        }
      }
    }
    
    // Get basic counts - filtered by landlord's properties
    const [
      totalProperties,
      totalUnits,
      occupiedUnits,
      activeTenants,
      pendingMaintenance,
      overduePayments,
      defaultedPayments
    ] = await Promise.all([
      Property.countDocuments({ landlordId }),
      Unit.countDocuments({ propertyId: { $in: propertyIds } }),
      Unit.countDocuments({ propertyId: { $in: propertyIds }, occupancyStatus: 'Occupied' }),
      Tenant.countDocuments({ 
        unitId: { $in: await Unit.find({ propertyId: { $in: propertyIds } }).select('_id') },
        status: 'Active' 
      }),
      Maintenance.countDocuments({ 
        unitId: { $in: await Unit.find({ propertyId: { $in: propertyIds } }).select('_id') },
        status: { $in: ['Open', 'In Progress'] } 
      }),
      Payment.countDocuments({ 
        unitId: { $in: await Unit.find({ propertyId: { $in: propertyIds } }).select('_id') },
        dueDate: { $lt: new Date() }, 
        status: 'Pending' 
      }),
      Payment.countDocuments({ 
        unitId: { $in: await Unit.find({ propertyId: { $in: propertyIds } }).select('_id') },
        status: 'Defaulted',
        isDefaulted: true
      })
    ])

    // Get unit IDs for this landlord (needed for payment and maintenance queries)
    const landlordUnits = await Unit.find({ propertyId: { $in: propertyIds } }).select('_id')
    const unitIds = landlordUnits.map(u => u._id)
    
    // Calculate monthly revenue - filtered by landlord's units
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          unitId: { $in: unitIds },
          paymentDate: { $gte: currentMonth, $lt: nextMonth },
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ])

    const monthlyRevenue = monthlyPayments.length > 0 ? monthlyPayments[0].total : 0

    // Get recent activities - filtered by landlord's units
    const recentPayments = await Payment.find({ unitId: { $in: unitIds } })
      .populate('tenantId', 'personalInfo')
      .populate('unitId', 'unitNumber')
      .sort({ paymentDate: -1 })
      .limit(5)
      .lean()

    const recentMaintenance = await Maintenance.find({ unitId: { $in: unitIds } })
      .populate('unitId', 'unitNumber')
      .sort({ reportedDate: -1 })
      .limit(5)
      .lean()

    // Format activities
    const activities = [
      ...recentPayments.map(payment => ({
        type: 'payment',
        title: 'Payment Received',
        description: `${formatCurrencyAmount(payment.amount, userCurrency)} from ${payment.tenantId?.personalInfo?.firstName} ${payment.tenantId?.personalInfo?.lastName}`,
        date: payment.paymentDate,
        icon: 'CurrencyDollarIcon',
        color: 'green'
      })),
      ...recentMaintenance.map(maintenance => ({
        type: 'maintenance',
        title: 'Maintenance Request',
        description: `${maintenance.title} - Unit ${maintenance.unitId?.unitNumber}`,
        date: maintenance.reportedDate,
        icon: 'WrenchScrewdriverIcon',
        color: 'orange'
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

    // Revenue trend (last 6 months) - filtered by landlord's units
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const revenueData = await Payment.aggregate([
      {
        $match: {
          unitId: { $in: unitIds },
          paymentDate: { $gte: sixMonthsAgo },
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ])

    const revenueChart = revenueData.map(item => ({
      label: `${item._id.month}/${item._id.year}`,
      value: item.total
    }))

    // Occupancy data
    const vacantUnits = totalUnits - occupiedUnits
    const occupancyData = [
      { label: 'Occupied', value: occupiedUnits, color: '#10b981' },
      { label: 'Vacant', value: vacantUnits, color: '#f59e0b' }
    ]

    return {
      success: true,
      data: {
        totalProperties,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        activeTenants,
        monthlyRevenue,
        pendingMaintenance,
        overduePayments,
        defaultedPayments,
        occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
        recentActivities: activities,
        revenueData: revenueChart,
        occupancyData
      }
    }
  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
