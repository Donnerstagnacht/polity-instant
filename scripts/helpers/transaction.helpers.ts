/**
 * Transaction utility functions for batching and retry logic
 */

/**
 * Helper function to batch transactions with retry logic
 * Handles deadlock scenarios with exponential backoff
 */
export async function batchTransact(db: any, transactions: any[], batchSize = 20): Promise<void> {
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    let retries = 3;

    while (retries > 0) {
      try {
        await db.transact(batch);
        break;
      } catch (error: any) {
        if (error?.body?.type === 'record-not-unique' || error?.status === 409) {
          // Deadlock or conflict - retry with exponential backoff
          const backoff = (4 - retries) * 1000; // 1s, 2s, 3s
          console.warn(`  ⚠️  Conflict detected, retrying in ${backoff}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          retries--;
        } else {
          throw error;
        }
      }
    }

    if (retries === 0) {
      throw new Error('Failed to execute batch after 3 retries');
    }
  }
}
