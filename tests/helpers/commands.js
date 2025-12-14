/**
 * Выбрать опцию из dropdown
 * @param {Page} page - Playwright page object
 * @param {string} selectName - Название select (group, messenger, type)
 * @param {string} optionText - Текст опции для выбора
 */
export async function selectDropdown(page, selectName, optionText) {
  // Открываем dropdown
  await page.click(`[class*="${selectName}-select"]`);

  // Ждем появления dropdown меню
  await page.waitForSelector(`[class*="${selectName}-dropdown"]`, {
    timeout: 5000,
  });

  // Кликаем на опцию по тексту
  await page.click(
    `[class*="${selectName}-dropdown"] [class*="option"]:has-text("${optionText}")`
  );

  // Ждем закрытия dropdown
  await page.waitForSelector(`[class*="${selectName}-dropdown"]`, {
    state: "hidden",
  });
}

/**
 * Ввести текст в input поле
 * @param {Page} page - Playwright page object
 * @param {string} inputClass - Класс input поля
 * @param {string} value - Значение для ввода
 */
export async function typeInInput(page, inputClass, value) {
  const inputSelector = `[class*="${inputClass}-input"]`;

  await page.waitForSelector(inputSelector);
  await page.fill(inputSelector, value);
}

/**
 * Нажать кнопку
 * @param {Page} page - Playwright page object
 * @param {string} buttonClass - Класс кнопки
 */
export async function clickButton(page, buttonClass) {
  await page.click(`[class*="${buttonClass}-button"]`);
}

/**
 * Проверить видимость элемента
 * @param {Page} page - Playwright page object
 * @param {string} className - Класс элемента
 * @param {boolean} shouldBeVisible - true если должен быть видим
 */
export async function checkElementVisibility(
  page,
  className,
  shouldBeVisible = true
) {
  const selector = `[class*="${className}"]`;

  if (shouldBeVisible) {
    await page.waitForSelector(selector, { timeout: 5000 });
  } else {
    await page.waitForSelector(selector, { state: "hidden", timeout: 5000 });
  }
}

/**
 * Получить значение input поля
 * @param {Page} page - Playwright page object
 * @param {string} inputClass - Класс input поля
 */
export async function getInputValue(page, inputClass) {
  const inputSelector = `[class*="${inputClass}-input"]`;
  return await page.inputValue(inputSelector);
}

/**
 * Проверить содержит ли элемент текст
 * @param {Page} page - Playwright page object
 * @param {string} className - Класс элемента
 * @param {string} text - Текст для поиска
 */
export async function elementContainsText(page, className, text) {
  const selector = `[class*="${className}"]:has-text("${text}")`;
  return await page.isVisible(selector);
}
