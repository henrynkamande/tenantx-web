import { connectToDatabase } from '../../utils/database';
import Tenant from '../../models/Tenant';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();

    const tenantId = getRouterParam(event, 'id');
    if (!tenantId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tenant ID is required'
      });
    }

    const updatedData = await readBody(event);

    const updatedTenant = await Tenant.findByIdAndUpdate(tenantId, updatedData, {
      new: true,
      runValidators: true
    });

    if (!updatedTenant) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tenant not found'
      });
    }

    return {
      success: true,
      data: updatedTenant
    };
  } catch (error) {
    console.error('Update tenant error:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});

