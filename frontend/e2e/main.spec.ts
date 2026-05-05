import { test, expect } from '@playwright/test';

test('полный сценарий: регистрация -> вход -> загрузка книги -> чтение -> определение слова', async ({ page }) => {
  await page.goto('/');

  // ---- Регистрация и вход ----
  await page.click('text=Зарегистрироваться');
  const username = 'e2e_' + Date.now();
  await page.fill('input[placeholder="Имя пользователя"]', username);
  await page.fill('input[placeholder="Пароль"]', 'testpass');
  await page.click('text=Зарегистрироваться');

  await page.fill('input[placeholder="Имя пользователя"]', username);
  await page.fill('input[placeholder="Пароль"]', 'testpass');
  await page.click('text=Войти');
  await expect(page.locator(`text=${username}`)).toBeVisible();

  // ---- Загрузка книги ----
  await page.click('text=Загрузить книгу');
  await expect(page.locator('.fixed.inset-0')).toBeVisible();

  // Заполняем форму (если добавили data-testid – используем их, иначе селекторы)
  await page.fill('[data-testid="upload-title"]', 'Тестовая книга');
  await page.fill('[data-testid="upload-author"]', 'Тестовый автор');
  await page.setInputFiles('input[type="file"]', 'test-files/test.txt');
  await page.click('[data-testid="upload-submit"]');

  // Ждём перехода на страницу чтения – ищем активное предложение (желтый фон)
  await expect(page.locator('.bg-yellow-100')).toBeVisible({ timeout: 15000 });

  // ---- Проверка клика по слову ----
  // Находим активное предложение и внутри него – первое кликабельное слово
  const activeSentence = page.locator('.bg-yellow-100');
  const word = activeSentence.locator('span.cursor-pointer').first();
  await word.click();

  // Ждём, когда в правой панели появится определение (не заглушка)
  const rightSidebar = page.locator('.w-80.bg-white.border-l');
  await expect(rightSidebar).toBeVisible();
  // Проверяем, что внутри панели есть хотя бы один абзац с текстом (не "Загрузка..." и не "Кликните на слово...")
  const definitionText = rightSidebar.locator('p:not(.text-gray-400)').first();
  await expect(definitionText).toBeVisible({ timeout: 5000 });
  // Можем проверить, что текст не пустой
  const text = await definitionText.textContent();
  expect(text?.length).toBeGreaterThan(5);
});