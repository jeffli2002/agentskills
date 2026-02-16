/**
 * Agent Skills Admin - Automated Test Script
 * 
 * Usage:
 *   node test-admin.js <baseUrl> <adminPassword>
 * 
 * Example:
 *   node test-admin.js http://localhost:5180 admin123
 */

const BASE_URL = process.argv[2] || 'http://localhost:5180';
const ADMIN_PASSWORD = process.argv[3] || 'admin123';

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

function log(message, type = 'info') {
  const prefix = {
    info: 'ℹ',
    success: '✅',
    error: '❌',
    warn: '⚠️'
  }[type] || '•';
  console.log(`${prefix} ${message}`);
}

async function test(name, fn) {
  try {
    await fn();
    tests.passed++;
    tests.results.push({ name, status: 'passed' });
    log(name, 'success');
  } catch (error) {
    tests.failed++;
    tests.results.push({ name, status: 'failed', error: error.message });
    log(`${name}: ${error.message}`, 'error');
  }
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json();
  return { status: res.status, data };
}

// Test 1: Login Page Loads
async function testLoginPageLoads() {
  const res = await fetch(`${BASE_URL}/admin/login`);
  if (res.status !== 200) {
    throw new Error(`Login page returned ${res.status}`);
  }
}

// Test 2: Login with Correct Password
async function testLoginSuccess() {
  const { status, data } = await fetchJSON(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    body: JSON.stringify({ password: ADMIN_PASSWORD })
  });
  
  if (status !== 200 || !data.success) {
    throw new Error(data.error || 'Login failed');
  }
  
  if (!data.data.token) {
    throw new Error('No token returned');
  }
  
  return data.data.token;
}

// Test 3: Login with Wrong Password
async function testLoginFailure() {
  const { status, data } = await fetchJSON(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    body: JSON.stringify({ password: 'wrongpassword' })
  });
  
  if (status !== 401) {
    throw new Error(`Expected 401, got ${status}`);
  }
  
  if (data.success) {
    throw new Error('Should not succeed with wrong password');
  }
}

// Test 4: Dashboard with Valid Token
async function testDashboardWithAuth(token) {
  const { status, data } = await fetchJSON(`${BASE_URL}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (status !== 200 || !data.success) {
    throw new Error(data.error || 'Dashboard fetch failed');
  }
  
  if (!data.data.today || !data.data.total) {
    throw new Error('Invalid dashboard data structure');
  }
}

// Test 5: Dashboard without Token
async function testDashboardWithoutAuth() {
  const { status, data } = await fetchJSON(`${BASE_URL}/api/admin/dashboard`);
  
  if (status !== 401) {
    throw new Error(`Expected 401, got ${status}`);
  }
}

// Test 6: Skills List
async function testSkillsList(token) {
  const { status, data } = await fetchJSON(`${BASE_URL}/api/admin/skills?page=1&limit=10`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (status !== 200 || !data.success) {
    throw new Error(data.error || 'Skills list fetch failed');
  }
  
  if (!Array.isArray(data.data.data)) {
    throw new Error('Invalid skills data');
  }
}

// Test 7: Users List
async function testUsersList(token) {
  const { status, data } = await fetchJSON(`${BASE_URL}/api/admin/users?page=1&limit=10`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (status !== 200 || !data.success) {
    throw new Error(data.error || 'Users list fetch failed');
  }
  
  if (!Array.isArray(data.data.data)) {
    throw new Error('Invalid users data');
  }
}

// Test 8: Skills Pagination
async function testSkillsPagination(token) {
  const { status, data } = await fetchJSON(`${BASE_URL}/api/admin/skills?page=2&limit=5`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (status !== 200 || !data.success) {
    throw new Error('Pagination failed');
  }
  
  if (!data.data.pagination || data.data.pagination.page !== 2) {
    throw new Error('Invalid pagination');
  }
}

// Main Test Runner
async function runTests() {
  console.log('='.repeat(50));
  console.log('Agent Skills Admin - Automated Tests');
  console.log('='.repeat(50));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Admin Password: ${ADMIN_PASSWORD}`);
  console.log('='.repeat(50));
  console.log('');

  // Wait for server to be ready
  log('Waiting for server...', 'warn');
  await new Promise(resolve => setTimeout(resolve, 2000));

  log('Running tests...\n');

  // Run tests
  await test('Login page loads', testLoginPageLoads);
  
  const token = await test('Admin login (correct password)', testLoginSuccess);
  
  await test('Admin login (wrong password)', testLoginFailure);
  
  await test('Dashboard with valid token', () => testDashboardWithAuth(token));
  
  await test('Dashboard without token', testDashboardWithoutAuth);
  
  await test('Skills list', () => testSkillsList(token));
  
  await test('Users list', () => testUsersList(token));
  
  await test('Skills pagination', () => testSkillsPagination(token));

  // Summary
  console.log('');
  console.log('='.repeat(50));
  console.log('Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`Total: ${tests.passed + tests.failed}`);
  console.log('='.repeat(50));

  if (tests.failed > 0) {
    console.log('\nFailed tests:');
    tests.results
      .filter(r => r.status === 'failed')
      .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    process.exit(1);
  }

  console.log('\n🎉 All tests passed!');
  process.exit(0);
}

// Export for use in other scripts
module.exports = { runTests, tests, fetchJSON };

// Run if called directly
if (require.main === module) {
  runTests().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
  });
}
