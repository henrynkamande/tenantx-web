import { connectToDatabase } from '../../../utils/database';
import Unit from '../../../models/Unit';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();

    // Parse request body
    const body = await readBody(event);
    const propertyId = event.context.params.id;

    // Create a new unit
    const unit = new Unit({
      propertyId,
      landlordId: body.landlordId,
      unitNumber: body.unitNumber,
      rentAmount: body.rentAmount,
      securityDeposit: body.securityDeposit || 0,
      bedrooms: body.bedrooms || 1,
      bathrooms: body.bathrooms || 1,
      squareFootage: body.squareFootage,
      occupancyStatus: body.occupancyStatus || 'Vacant',
      description: body.description,
      features: body.features || [],
      images: body.images || [],
      leaseStartDate: body.leaseStartDate,
      leaseEndDate: body.leaseEndDate,
      rentDueDay: body.rentDueDay || 1
    });

    // Save to database
    await unit.save();

    return {
      success: true,
      data: unit
    };
  } catch (error) {
    console.error('Error adding unit:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});

