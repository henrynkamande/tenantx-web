import mongoose from 'mongoose'

let isConnected = false

export const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Already connected to MongoDB')
    return { db: mongoose.connection.db }
  }

  try {
    const config = useRuntimeConfig()
    await mongoose.connect(config.mongodbUri)

    isConnected = true
    console.log('Connected to MongoDB')
    return { db: mongoose.connection.db }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}
