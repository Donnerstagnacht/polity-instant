/**
 * Test Entity IDs
 *
 * Deterministic IDs for test entities used in both seeding and E2E tests.
 * These IDs are fixed to ensure tests can reliably find test data.
 *
 * Convention: e2e-test-{entity}-{number:12 digits}
 */

export const TEST_ENTITY_IDS = {
  // ===== USERS =====
  mainTestUser: 'f598596e-d379-413e-9c6e-c218e5e3cf17',
  tobiasUser: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7',

  testUser1: 'e2e00001-0000-4000-8000-000000000001',
  testUser2: 'e2e00002-0000-4000-8000-000000000002',
  testUser3: 'e2e00003-0000-4000-8000-000000000003',

  // ===== GROUPS =====
  testGroup1: 'e2e10001-0000-4000-8000-000000000001',
  testGroup2: 'e2e10002-0000-4000-8000-000000000002',
  testGroup3: 'e2e10003-0000-4000-8000-000000000003',

  // ===== EVENTS =====
  testEvent1: 'e2e20001-0000-4000-8000-000000000001',
  testEvent2: 'e2e20002-0000-4000-8000-000000000002',
  testEvent3: 'e2e20003-0000-4000-8000-000000000003',

  // ===== BLOGS =====
  testBlog1: 'e2e30001-0000-4000-8000-000000000001',
  testBlog2: 'e2e30002-0000-4000-8000-000000000002',
  testBlog3: 'e2e30003-0000-4000-8000-000000000003',

  // ===== AMENDMENTS =====
  testAmendment1: 'e2e40001-0000-4000-8000-000000000001',
  testAmendment2: 'e2e40002-0000-4000-8000-000000000002',
  testAmendment3: 'e2e40003-0000-4000-8000-000000000003',

  // ===== DOCUMENTS =====
  testDocument1: 'e2e50001-0000-4000-8000-000000000001',
  testDocument2: 'e2e50002-0000-4000-8000-000000000002',
  testDocument3: 'e2e50003-0000-4000-8000-000000000003',

  // ===== POSITIONS =====
  testPosition1: 'e2e60001-0000-4000-8000-000000000001',
  testPosition2: 'e2e60002-0000-4000-8000-000000000002',
  testPosition3: 'e2e60003-0000-4000-8000-000000000003',

  // ===== TODOS =====
  testTodo1: 'e2e70001-0000-4000-8000-000000000001',
  testTodo2: 'e2e70002-0000-4000-8000-000000000002',
  testTodo3: 'e2e70003-0000-4000-8000-000000000003',

  // ===== CONVERSATIONS =====
  testConversation1: 'e2e80001-0000-4000-8000-000000000001',
  testConversation2: 'e2e80002-0000-4000-8000-000000000002',
  testConversation3: 'e2e80003-0000-4000-8000-000000000003',

  // ===== AGENDA ITEMS =====
  testAgendaItem1: 'e2e90001-0000-4000-8000-000000000001',
  testAgendaItem2: 'e2e90002-0000-4000-8000-000000000002',
  testAgendaItem3: 'e2e90003-0000-4000-8000-000000000003',

  // ===== THREADS =====
  testThread1: 'e2ea0001-0000-4000-8000-000000000001',
  testThread2: 'e2ea0002-0000-4000-8000-000000000002',
  testThread3: 'e2ea0003-0000-4000-8000-000000000003',

  // ===== ELECTIONS =====
  testElection1: 'e2eb0001-0000-4000-8000-000000000001',
  testElection2: 'e2eb0002-0000-4000-8000-000000000002',
  testElection3: 'e2eb0003-0000-4000-8000-000000000003',

  // ===== MEETING SLOTS =====
  testMeetingSlot1: 'e2ec0001-0000-4000-8000-000000000001',
  testMeetingSlot2: 'e2ec0002-0000-4000-8000-000000000002',
  testMeetingSlot3: 'e2ec0003-0000-4000-8000-000000000003',

  // ===== NOTIFICATIONS =====
  testNotification1: 'e2ed0001-0000-4000-8000-000000000001',
  testNotification2: 'e2ed0002-0000-4000-8000-000000000002',
  testNotification3: 'e2ed0003-0000-4000-8000-000000000003',

  // ===== PAYMENTS =====
  testPayment1: 'e2ee0001-0000-4000-8000-000000000001',
  testPayment2: 'e2ee0002-0000-4000-8000-000000000002',
  testPayment3: 'e2ee0003-0000-4000-8000-000000000003',

  // ===== CONVENIENCE ALIASES =====
  // These aliases make tests more readable
  AMENDMENT: 'e2e40001-0000-4000-8000-000000000001', // Same as testAmendment1
  BLOG: 'e2e30001-0000-4000-8000-000000000001', // Same as testBlog1
  EVENT: 'e2e20001-0000-4000-8000-000000000001', // Same as testEvent1
  GROUP: 'e2e10001-0000-4000-8000-000000000001', // Same as testGroup1
  STATEMENT: 'e2ef0001-0000-4000-8000-000000000001', // New statement ID
} as const;

export const TEST_EMAILS = {
  main: 'test@polity.app',
  tobias: 'tobias.hassebrock@gmail.com',
  testUser1: 'e2etest1@polity.app',
  testUser2: 'e2etest2@polity.app',
  testUser3: 'e2etest3@polity.app',
} as const;

/**
 * Helper to get entity IDs by type
 */
export function getTestEntityIds(entityType: string): string[] {
  const prefix = `test${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`;
  return [
    TEST_ENTITY_IDS[`${prefix}1` as keyof typeof TEST_ENTITY_IDS],
    TEST_ENTITY_IDS[`${prefix}2` as keyof typeof TEST_ENTITY_IDS],
    TEST_ENTITY_IDS[`${prefix}3` as keyof typeof TEST_ENTITY_IDS],
  ].filter(Boolean) as string[];
}
