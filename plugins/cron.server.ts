// Cron jobs temporarily disabled due to node-cron dependency issues
// This file is kept for future re-enabling of scheduled tasks

// import { initializeCronJobs } from '~/server/utils/cronJobs'

// Temporarily comment out the entire plugin to avoid defineNitroPlugin errors
// export default defineNitroPlugin(async (nitroApp) => {
//   // Cron jobs are temporarily disabled
//   // Future implementation for scheduled tasks:
//   // - Invoice status updates
//   // - Payment reminders
//   // - Report generation
//   console.log('Cron plugin loaded (jobs currently disabled)')
// })

// Empty export to prevent module errors
export default function() {}
