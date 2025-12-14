import webpush from 'web-push';

/**
 * Generate VAPID keys for Web Push notifications
 * 
 * Run this script once to generate the keys, then add them to your environment variables:
 * 
 * VAPID_PUBLIC_KEY=<public_key>
 * VAPID_PRIVATE_KEY=<private_key>
 * VAPID_EMAIL=mailto:your-email@example.com
 */
function generateVapidKeys() {
  console.log('Generating VAPID keys for Web Push notifications...\n');
  
  const vapidKeys = webpush.generateVAPIDKeys();
  
  console.log('='.repeat(80));
  console.log('VAPID Keys Generated Successfully!');
  console.log('='.repeat(80));
  console.log('\n📝 Add these to your .env file and Vercel environment variables:\n');
  console.log(`VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
  console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
  console.log(`VAPID_EMAIL="mailto:your-email@example.com"  # Replace with your email`);
  console.log('\n' + '='.repeat(80));
  console.log('\n⚠️  IMPORTANT:');
  console.log('1. Keep the PRIVATE key secret - never commit it to version control');
  console.log('2. The PUBLIC key is safe to expose in client-side code');
  console.log('3. Update your .env.example with placeholder values');
  console.log('4. Add these to your Vercel project settings');
  console.log('\n' + '='.repeat(80));
  
  return vapidKeys;
}

// Run if executed directly
generateVapidKeys();

export { generateVapidKeys };
