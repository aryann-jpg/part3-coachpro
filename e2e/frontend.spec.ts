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
      name: `Test Client (${browser})`
    })),
    workouts: browsers.map(browser => ({
      clientId: `client-${browser}`,
      plan: {
        Monday: [
          {
            workout_name: `Bench Press`, 
            sets: 3,
            reps: 10,
            weight: 60
          }
        ]
      }
    }))
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

    const nameInput = page
      .locator('#exerciseList input[type="text"]')
      .first();

    await nameInput.waitFor();
    await expect(nameInput).toHaveValue(/Bench Press/); 
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

    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#saveStatus'))
      .toHaveText('Saved!');
  });

  test('Validation error when fields are empty', async ({ page, browserName }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`
    );

    const inputs = page.locator('#exerciseList input');
    await inputs.first().waitFor();

    // Clear ALL fields
    for (let i = 0; i < 4; i++) {
      await inputs.nth(i).fill('');
    }

    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#saveStatus'))
      .toHaveText('Fix validation errors before saving.');
  });

  test('Reset form reloads workout data', async ({ page, browserName }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`
    );

    const nameInput = page
      .locator('#exerciseList input[type="text"]')
      .first();

    await nameInput.waitFor();
    await nameInput.fill('Incline Bench'); 

    await page.click('text=Reset');

   
    await nameInput.waitFor();
    await expect(nameInput).toHaveValue(/Bench Press/); 
  });

  test('Back button redirects to login page', async ({ page, browserName }) => {
    await page.goto(
      `${BASE_URL}/aryan-edit.html?clientId=client-${browserName}&day=Monday`
    );

    await page.click('text=Back');

   
    await expect(page).toHaveURL(`${BASE_URL}/login.html`);
  });

});
