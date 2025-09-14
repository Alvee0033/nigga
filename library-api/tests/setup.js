// Test setup file
// Set test timeout
jest.setTimeout(10000);

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting Member API tests...');
});

afterAll(() => {
  console.log('✅ Member API tests completed');
});
