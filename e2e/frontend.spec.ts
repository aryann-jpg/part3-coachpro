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
        Tuesday: [
          {
            workout_name: 'Squat',
            sets: 4,
            reps: 12,
            weight: 80,
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
    await page.goto(`${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`);
    const inputs = page.locator('#exerciseList input');
    await expect(inputs.nth(0)).toHaveValue('Bench Press');
    await expect(inputs.nth(1)).toHaveValue('3');
    await expect(inputs.nth(2)).toHaveValue('10');
    await expect(inputs.nth(3)).toHaveValue('60');
  });

  test('Edit multiple exercises and save', async ({ page, browserName }) => {
    await page.goto(`${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`);
    const inputs = page.locator('#exerciseList input');

    // Update first exercise
    await inputs.nth(0).fill('Incline Bench');
    await inputs.nth(1).fill('4');
    await inputs.nth(2).fill('8');
    await inputs.nth(3).fill('70');

    // Add second exercise
    await page.click('text=Add Exercise');
    const newInputs = page.locator('#exerciseList input');
    await newInputs.nth(4).fill('Push Ups');
    await newInputs.nth(5).fill('3');
    await newInputs.nth(6).fill('15');
    await newInputs.nth(7).fill('0');

    await page.click('button[type="submit"]');
    await expect(page.locator('#saveStatus')).toHaveText('Saved!');
  });

  test('Delete an exercise', async ({ page, browserName }) => {
    await page.goto(`${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`);
    const deleteBtn = page.locator('.delete-exercise').first();
    await deleteBtn.click();
    await page.click('button[type="submit"]');
    await expect(page.locator('#saveStatus')).toHaveText('Saved!');
  });

  test('Persistence after save', async ({ page, browserName }) => {
    await page.goto(`${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`);
    const inputs = page.locator('#exerciseList input');
    await inputs.nth(0).fill('Flat Bench');
    await page.click('button[type="submit"]');
    await page.reload();
    await expect(page.locator('#exerciseList input').nth(0)).toHaveValue('Flat Bench');
  });

  test('Cross-day workout load', async ({ page, browserName }) => {
    await page.goto(`${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Tuesday`);
    const inputs = page.locator('#exerciseList input');
    await expect(inputs.nth(0)).toHaveValue('Squat');
    await expect(inputs.nth(1)).toHaveValue('4');
    await expect(inputs.nth(2)).toHaveValue('12');
    await expect(inputs.nth(3)).toHaveValue('80');
  });

  test('Reset form reloads original workout data', async ({ page, browserName }) => {
    await page.goto(`${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`);
    const nameInput = page.locator('#exerciseList input[type="text"]').first();
    const originalValue = await nameInput.inputValue();
    await nameInput.fill('Incline Bench');
    await page.click('text=Reset');
    await expect(nameInput).toHaveValue(originalValue);
  });

  test('Back button redirects to login page', async ({ page, browserName }) => {
    await page.goto(`${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`);
    await page.click('text=Back');
    await expect(page).toHaveURL(`${BASE_URL}/login.html`);
  });

});
