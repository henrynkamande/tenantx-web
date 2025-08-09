import mongoose from 'mongoose'

/**
 * Check if the current MongoDB instance supports transactions
 * Transactions are only supported on replica sets and sharded clusters
 */
export async function supportsTransactions(): Promise<boolean> {
  try {
    const db = mongoose.connection.db
    if (!db) {
      console.warn('Database connection not available')
      return false
    }

    // Check if we're connected to a replica set or sharded cluster
    const admin = db.admin()
    const result = await admin.command({ isMaster: 1 })
    
    // Check for replica set
    const isReplicaSet = result.setName !== undefined
    
    // Check for sharded cluster
    const isSharded = result.msg === 'isdbgrid'
    
    const supportsTransactions = isReplicaSet || isSharded
    
    console.log('MongoDB deployment type:', {
      isReplicaSet,
      isSharded,
      supportsTransactions,
      setName: result.setName,
      msg: result.msg
    })
    
    return supportsTransactions
  } catch (error) {
    console.error('Error checking MongoDB transaction support:', error)
    return false
  }
}

/**
 * Execute a function with or without transactions based on MongoDB support
 */
export async function executeWithOptionalTransaction<T>(
  operations: (session?: mongoose.mongo.ClientSession) => Promise<T>
): Promise<T> {
  const transactionsSupported = await supportsTransactions()
  
  if (transactionsSupported) {
    // Use transactions
    const session = await mongoose.startSession()
    session.startTransaction()
    
    try {
      const result = await operations(session)
      await session.commitTransaction()
      return result
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  } else {
    // Execute without transactions
    console.log('MongoDB transactions not supported, executing without transaction')
    return await operations()
  }
}

/**
 * Check MongoDB deployment configuration
 */
export async function getMongoDBInfo() {
  try {
    const db = mongoose.connection.db
    if (!db) {
      return { error: 'Database connection not available' }
    }

    const admin = db.admin()
    const isMasterResult = await admin.command({ isMaster: 1 })
    const buildInfoResult = await admin.command({ buildInfo: 1 })
    
    return {
      deployment: {
        isReplicaSet: isMasterResult.setName !== undefined,
        isSharded: isMasterResult.msg === 'isdbgrid',
        setName: isMasterResult.setName,
        hosts: isMasterResult.hosts,
        primary: isMasterResult.primary,
        me: isMasterResult.me
      },
      version: buildInfoResult.version,
      supportsTransactions: await supportsTransactions()
    }
  } catch (error) {
    console.error('Error getting MongoDB info:', error)
    return { error: error.message }
  }
}
