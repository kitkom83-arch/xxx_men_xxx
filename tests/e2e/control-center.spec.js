const { test, expect } = require('@playwright/test');

test('first-run setup, login, dashboard, mock search, and dry-run composer', async ({ page }) => {
  await page.goto('/setup');

  if (await page.getByRole('heading', { name: /ตั้งค่า X API Marketing Control Center/ }).isVisible().catch(() => false)) {
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'ถัดไป' }).click();
    await page.getByText('Demo / Mock mode').click();
    await page.getByRole('button', { name: 'ถัดไป' }).click();
    await page.getByRole('button', { name: 'ถัดไป' }).click();
    await page.getByRole('button', { name: 'บันทึก setup' }).click();
    await expect(page.getByText('ตั้งค่าเสร็จแล้ว')).toBeVisible();
  }

  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await expect(page.locator('header').getByText('Demo / Mock')).toBeVisible();
  await page.getByRole('button', { name: 'ค้นหาโพสต์' }).click();
  await expect(page.getByText('ผลลัพธ์ล่าสุด')).toBeVisible();
  await page.getByRole('button', { name: 'บันทึก dry-run' }).click();
  await expect(page.getByText('dryRun')).toBeVisible();
});
