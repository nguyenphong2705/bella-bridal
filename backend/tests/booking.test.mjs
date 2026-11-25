import test from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.TEST_API_URL || 'http://localhost:8001/api/v1';

test('Health, Real-time Availability, Double-Booking Lock & Notifications', async () => {
  const health = await fetch(`${BASE}/health`);
  assert.equal(health.status, 200);
  const hJson = await health.json();
  assert.equal(hJson.status, 'ok');

  const day = String(10 + Math.floor(Math.random() * 18)).padStart(2, '0');
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const testDate = `2027-${month}-${day}`;
  const avail1 = await fetch(`${BASE}/appointments/availability?date=${testDate}`);
  assert.equal(avail1.status, 200);
  const a1 = await avail1.json();
  assert.equal(a1.slots.length, 6);

  const book1 = await fetch(`${BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Test Bride',
      customer_phone: '+84 901 234 567',
      customer_email: 'bride@example.com',
      appointment_date: testDate,
      time_slot: '10:30',
    }),
  });
  assert.equal(book1.status, 201);
  const b1 = await book1.json();
  assert.ok(b1.data.booking_code.startsWith(`BB-${testDate.replace(/-/g, '')}-`));
  const channels = b1.data.notifications.map((n) => n.channel);
  assert.deepEqual(channels.sort(), ['email', 'sms', 'zalo_zns']);

  // Duplicate slot booking must fail with 409 Conflict
  const book2 = await fetch(`${BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Second Bride',
      customer_phone: '+84 909 998 888',
      appointment_date: testDate,
      time_slot: '10:30',
    }),
  });
  assert.equal(book2.status, 409);

  const avail2 = await fetch(`${BASE}/appointments/availability?date=${testDate}`);
  const a2 = await avail2.json();
  const slot1030 = a2.slots.find((s) => s.time_slot === '10:30');
  assert.equal(slot1030.available, false);
});
