import './playwright-coverage.js';
import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import config from '../playwright.config';

const BASE_URL = 'http://localhost:5050';
const DATA_FILE = path.join(__dirname, '../utils/coaching-data.json');

test.beforeAll(async () => {
  const projects: { name: string }[] = (config as any).projects ?? [];
  const browsers = projects.map(p => p.name);

  const initialData = {
    clients: browsers.map(browser => ({
      clientId: `client-${browser}`,
      name: `Test Client (${browser})`,
    })),
    workouts: browsers.map(browser => ({
      clientId: `client-${browser}`,
      plan: {
        Monday: [
          {
            workout_name: 'Bench Press',
            sets: 3,
            reps: 10,
            weight: 60,
          },
        ],
      },
    })),
  };

  await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
});

test.describe('Workout Plan Frontend Tests', () => {

  test('Load workout page successfully', async ({ page, browserName }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`
    );

    await expect(page.locator('#clientName')).toContainText('Test Client');
    await expect(page.locator('#currentDayTitle')).toHaveText('Monday');
  });

  test('Workout fields are prefilled from stored data', async ({ page, browserName }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`
    );

    const inputs = page.locator('#exerciseList input');
    await expect(inputs.nth(0)).toHaveValue('Bench Press');
    await expect(inputs.nth(1)).toHaveValue('3');
    await expect(inputs.nth(2)).toHaveValue('10');
    await expect(inputs.nth(3)).toHaveValue('60');
  });

  test('Edit workout and save successfully', async ({ page, browserName }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`
    );

    const inputs = page.locator('#exerciseList input');
    await inputs.first().waitFor();

    await inputs.nth(0).fill('Incline Bench');
    await inputs.nth(1).fill('4');
    await inputs.nth(2).fill('8');
    await inputs.nth(3).fill('70');

    await page.click('button[type="submit"]');

    await expect(page.locator('#saveStatus')).toHaveText('Saved!');
  });

  test('Validation error when fields are empty', async ({ page, browserName }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`
    );

    const inputs = page.locator('#exerciseList input');
    for (let i = 0; i < 4; i++) {
      await inputs.nth(i).fill('');
    }

    await page.click('button[type="submit"]');

    await expect(page.locator('#saveStatus'))
      .toHaveText('Fix validation errors before saving.');
  });

  test('Zero or negative values do not save workout', async ({ page, browserName }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`
    );

    const inputs = page.locator('#exerciseList input');
    await inputs.nth(1).fill('0');
    await inputs.nth(2).fill('-5');
    await inputs.nth(3).fill('0');

    await page.click('button[type="submit"]');

    await expect(page.locator('#saveStatus')).not.toHaveText('Saved!');
  });

  test('Workout name longer than 30 chars is still saved', async ({ page, browserName }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`
    );

    const nameInput = page.locator('#exerciseList input[type="text"]').first();
    await nameInput.fill('A'.repeat(35));

    await page.click('button[type="submit"]');

    await expect(page.locator('#saveStatus')).toHaveText('Saved!');
  });

  test('Reset form reloads original workout data', async ({ page, browserName }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`
    );

    const nameInput = page.locator('#exerciseList input[type="text"]').first();
    const originalValue = await nameInput.inputValue();

    await nameInput.fill('Incline Bench');
    await expect(nameInput).toHaveValue('Incline Bench');

    await page.click('text=Reset');

    await expect(nameInput).toHaveValue(originalValue);
  });

  test('Back button redirects to login page', async ({ page, browserName }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`
    );

    await page.click('text=Back');

    await expect(page).toHaveURL(`${BASE_URL}/login.html`);
  });

  test('Invalid clientId shows graceful UI behavior', async ({ page }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=invalid-client&day=Monday`
    );

    await expect(page.locator('body')).toBeVisible();
  });

});
