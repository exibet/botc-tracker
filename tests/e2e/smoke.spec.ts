import { expect, test } from '@playwright/test'

test('home page loads with correct title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Blood on the Clocktower/)
})

test('home page shows hero heading', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByText('Хроніки Годинникової Вежі'),
  ).toBeVisible()
})

test('navigation to roles page works', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Каталог ролей').click()
  await expect(
    page.getByRole('heading', { name: 'Каталог ролей' }),
  ).toBeVisible()
})
