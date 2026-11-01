import { test, expect } from '@playwright/test';

test('shows an error when login credentials are invalid', async ({ page }) => {
  await page.route('**/api/user/login', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Invalid email or password',
      }),
    });
  });

  await page.goto('/');

  // Open the login modal.
  await page.getByRole('banner').getByRole('button', { name: 'Sign In' }).click();

  // Enter invalid login credentials.
  await page.getByLabel('Email address').fill('invalid@example.com');
  await page.locator('input[name="password"]').fill('WrongPassword123!');

  // Submit the login form.
  await page.getByRole('button', { name: 'Sign In' }).last().click();

  // Verify the API error is displayed.
  await expect(page.getByText('Invalid email or password')).toBeVisible();

  // Verify the user remains on the landing page.
  await expect(page).toHaveURL(/\/$/);
});

test('keeps signup disabled when the password is weak', async ({ page }) => {
  await page.goto('/');

  // Open signup using the navbar button.
  await page.getByRole('banner').getByRole('button', { name: 'Get Started Free' }).click();

  await page.getByLabel('Username').fill('testuser');
  await page.getByLabel('Email address').fill('testuser@example.com');
  await page.locator('input[name="password"]').fill('weak');
  await page.locator('input[name="confirmpassword"]').fill('weak');

  // Verify weak password feedback.
  await expect(page.getByText('Password strength: Weak')).toBeVisible();

  // Signup must remain disabled.
  await expect(page.getByRole('button', { name: 'Start Your Journey' })).toBeDisabled();
});

test('shows an error when signup passwords do not match', async ({ page }) => {
  await page.goto('/');

  // Open signup using the navbar button.
  await page.getByRole('banner').getByRole('button', { name: 'Get Started Free' }).click();

  await page.getByLabel('Username').fill('testuser');
  await page.getByLabel('Email address').fill('testuser@example.com');
  await page.locator('input[name="password"]').fill('StrongPass123!');
  await page.locator('input[name="confirmpassword"]').fill('DifferentPass123!');

  // Verify password mismatch feedback.
  await expect(page.getByText('Passwords do not match')).toBeVisible();

  // Signup must remain disabled.
  await expect(page.getByRole('button', { name: 'Start Your Journey' })).toBeDisabled();
});
