import cron from 'node-cron'
import { checkAndMarkDefaultedPayments } from './rentDefault'

let isJobRunning = false

export function initializeCronJobs() {
  console.log('Initializing cron jobs...')
  
  // Check for defaulted payments every day at 6:00 AM
  cron.schedule('0 6 * * *', async () => {
    if (isJobRunning) {
      console.log('Cron job already running, skipping...')
      return
    }
    
    isJobRunning = true
    console.log('Running daily rent default check...')
    
    try {
      await checkAndMarkDefaultedPayments()
      console.log('Daily rent default check completed successfully')
    } catch (error) {
      console.error('Error in daily rent default check:', error)
    } finally {
      isJobRunning = false
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  })
  
  // Also check every 4 hours during business hours (8 AM to 8 PM)
  cron.schedule('0 8,12,16,20 * * *', async () => {
    if (isJobRunning) {
      console.log('Hourly cron job already running, skipping...')
      return
    }
    
    isJobRunning = true
    console.log('Running hourly rent default check...')
    
    try {
      await checkAndMarkDefaultedPayments()
      console.log('Hourly rent default check completed successfully')
    } catch (error) {
      console.error('Error in hourly rent default check:', error)
    } finally {
      isJobRunning = false
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  })
  
  console.log('Cron jobs initialized successfully')
}

// Function to run the check immediately (for testing or manual trigger)
export async function runDefaultCheck() {
  if (isJobRunning) {
    console.log('Default check already running')
    return false
  }
  
  isJobRunning = true
  try {
    console.log('Running manual rent default check...')
    await checkAndMarkDefaultedPayments()
    console.log('Manual rent default check completed successfully')
    return true
  } catch (error) {
    console.error('Error in manual rent default check:', error)
    return false
  } finally {
    isJobRunning = false
  }
}
