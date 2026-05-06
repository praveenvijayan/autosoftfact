module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  globals: { 'ts-jest': { tsconfig: { lib: ['ES2022', 'dom'] } } },
}
