import mongoose from 'mongoose'

let isConnected = false

export const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return { db: mongoose.connection.db }
  }

  try {
    const config = useRuntimeConfig()
    
    // Connection settings for local development or MongoDB Atlas
    const connectionOptions = {
      maxPoolSize: config.mongodbUri.includes('mongodb+srv') ? 5 : 10, // Reduced for Atlas, higher for local
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    }
    
    // Add IPv4 family option only for Atlas connections
    if (config.mongodbUri.includes('mongodb+srv')) {
      connectionOptions.family = 4 // Use IPv4, skip trying IPv6
    }
    
    await mongoose.connect(config.mongodbUri, connectionOptions)

    isConnected = true
    console.log('Connected to MongoDB:', config.mongodbUri.includes('mongodb+srv') ? 'Atlas (Cloud)' : 'Local')
    
    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
      isConnected = false
    })
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err)
      isConnected = false
    })
    
    return { db: mongoose.connection.db }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    isConnected = false
    throw createError({
      statusCode: 500,
      statusMessage: 'Database connection failed'
    })
  }
}
