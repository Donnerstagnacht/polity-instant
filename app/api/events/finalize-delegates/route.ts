import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';
import { buildFinalizeDelegatesTransactions } from '../../../../src/utils/finalize-delegates';

function getDB() {
  if (!process.env.NEXT_PUBLIC_INSTANT_APP_ID) {
    throw new Error('NEXT_PUBLIC_INSTANT_APP_ID is not defined');
  }
  if (!process.env.INSTANT_ADMIN_TOKEN) {
    throw new Error('INSTANT_ADMIN_TOKEN is not defined');
  }
  return init({
    appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID,
    adminToken: process.env.INSTANT_ADMIN_TOKEN,
  });
}

export async function POST(request: NextRequest) {
  const db = getDB();
  try {
    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Query event data using Admin SDK
    const data = await db.query({
      events: {
        $: { where: { id: eventId } },
        group: {},
        delegates: {
          user: {},
          group: {},
        },
      },
    });

    const event = data.events[0];
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const parentGroupId = event.group?.[0]?.id;
    if (!parentGroupId) {
      return NextResponse.json({ error: 'Event has no associated group' }, { status: 400 });
    }

    // Query group relationships
    const relData = await db.query({
      groupRelationships: {
        $: { where: { 'parentGroup.id': parentGroupId } },
        childGroup: {},
        parentGroup: {},
      },
    });

    // Build transactions
    const chunks = buildFinalizeDelegatesTransactions({
      event,
      groupRelationships: relData.groupRelationships || [],
      parentGroupId,
    });

    // Execute transaction
    await db.transact(chunks);

    return NextResponse.json({
      success: true,
      message: 'Delegates finalized successfully',
    });
  } catch (error) {
    console.error('Error finalizing delegates:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to finalize delegates',
      },
      { status: 500 }
    );
  }
}
