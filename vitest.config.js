import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/validation.test.js'],
    exclude: ['tests/api.test.js', 'tests/utils.test.js', 'e2e/**']
  }
});
