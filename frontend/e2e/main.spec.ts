import { test, expect } from '@playwright/test';

test('полный сценарий: регистрация -> вход -> загрузка книги -> чтение -> определение слова', async ({ page }) => {
  await page.goto('/');


  await page.click('text=Зарегистрироваться');
  await page.click('text=Зарегистрироваться');
  const username = 'e2e_' + Date.now();
  await page.fill('[data-testid="username-input"]', username);
  await page.fill('[data-testid="password-input"]', 'testpass');
  await page.click('[data-testid="submit-button"]');


  await page.fill('[data-testid="username-input"]', username);
  await page.fill('[data-testid="password-input"]', 'testpass');
  await page.click('[data-testid="submit-button"]');


  await expect(page).toHaveURL(/\/books/, { timeout: 10000 });
  await expect(page.locator(`text=${username}`)).toBeVisible({ timeout: 5000 });


  await page.click('text=Загрузить книгу');
  await expect(page.locator('.fixed.inset-0')).toBeVisible();
  await page.fill('[data-testid="upload-title"]', 'Тестовая книга');
  await page.fill('[data-testid="upload-author"]', 'Тестовый автор');
  await page.setInputFiles('input[type="file"]', 'test-files/test.txt');
  await page.click('[data-testid="upload-submit"]');

  await expect(page.locator('.bg-yellow-100')).toBeVisible({ timeout: 15000 });


  const activeSentence = page.locator('.bg-yellow-100');
  const word = activeSentence.locator('span.cursor-pointer').first();
  await word.click();


  const rightSidebar = page.locator('.w-80.bg-white.border-l');
  await expect(rightSidebar).toBeVisible();
  const definitionText = rightSidebar.locator('p:not(.text-gray-400)').first();
  await expect(definitionText).toBeVisible({ timeout: 10000 });
  const text = await definitionText.textContent();
  expect(text).not.toBe('');

  // Вернуться на главную, чтобы проверить, что книга добавилась в список
  await page.click('text=Lazy Reading');
  await expect(page.locator('table tbody tr:has-text("Тестовая книга")')).toBeVisible({ timeout: 10000 });
});