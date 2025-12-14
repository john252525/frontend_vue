// tests/e2e/addAccount.spec.js

import { test, expect } from "@playwright/test";

test.describe("AddAccount Modal - E2E тесты с data-testid селекторами", () => {
  // =====================================================
  // SETUP: Подготовка перед каждым тестом
  // =====================================================

  test.beforeEach(async ({ page }) => {
    // Перехватываем API запрос getForm
    await page.route("**/getForm", async (route) => {
      const formData = require("../fixtures/formStructure.json");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(formData),
      });
    });

    // Перехватываем POST запрос addAccount
    await page.route("**/addAccount", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, message: "Account created" }),
      });
    });

    // Загружаем страницу
    await page.goto("/");

    // Ждем загрузки модального окна
    await page.waitForSelector('[data-testid="main-modal-container"]', {
      timeout: 10000,
    });
  });

  // =====================================================
  // ТЕСТЫ: Загрузка компонента
  // =====================================================

  test.describe("Загрузка и отображение компонента", () => {
    test("должен отобразить модальное окно", async ({ page }) => {
      const modal = page.locator('[data-testid="main-modal-container"]');
      await expect(modal).toBeVisible();
    });

    test('должен показать заголовок "Настройка интеграции"', async ({
      page,
    }) => {
      const title = page.locator('[data-testid="modal-title"]');
      await expect(title).toBeVisible();
      await expect(title).toContainText("Настройка интеграции");
    });

    test("должен показать кнопку закрытия", async ({ page }) => {
      const closeBtn = page.locator('[data-testid="modal-close-btn"]');
      await expect(closeBtn).toBeVisible();
    });

    test("должен загрузить и показать основной dropdown", async ({ page }) => {
      const groupSelect = page.locator('[data-testid="group-select"]');
      await expect(groupSelect).toBeVisible();
    });

    test("должен показать кнопки Отмена и Сохранить", async ({ page }) => {
      const cancelBtn = page.locator('[data-testid="cancel-btn"]');
      const submitBtn = page.locator('[data-testid="submit-btn"]');

      await expect(cancelBtn).toBeVisible();
      await expect(submitBtn).toBeVisible();
    });
  });

  // =====================================================
  // ТЕСТЫ: Dropdown функциональность
  // =====================================================

  test.describe("Dropdown функциональность (группа интеграций)", () => {
    test("должен открыть dropdown при клике", async ({ page }) => {
      await page.click('[data-testid="group-select-button"]');

      const dropdown = page.locator('[data-testid="group-dropdown"]');
      await expect(dropdown).toBeVisible();
    });

    test("должен отобразить все три опции", async ({ page }) => {
      await page.click('[data-testid="group-select-button"]');

      const dropdown = page.locator('[data-testid="group-dropdown"]');
      await expect(dropdown).toContainText("Messenger");
      await expect(dropdown).toContainText("CRM");
      await expect(dropdown).toContainText("SMS");
    });

    test("должен выбрать опцию и закрыть dropdown", async ({ page }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      const dropdown = page.locator('[data-testid="group-dropdown"]');
      await expect(dropdown).not.toBeVisible();
    });

    test("должен закрыть dropdown при клике вне его", async ({ page }) => {
      await page.click('[data-testid="group-select-button"]');
      await expect(
        page.locator('[data-testid="group-dropdown"]')
      ).toBeVisible();

      // Клик вне dropdown
      await page.click('[class*="modal-content"]');

      const dropdown = page.locator('[data-testid="group-dropdown"]');
      await expect(dropdown).not.toBeVisible();
    });
  });

  // =====================================================
  // ТЕСТЫ: Messenger интеграция
  // =====================================================

  test.describe("Интеграция: Messenger", () => {
    test("при выборе Messenger должен показать dropdown мессенджеров", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      const messengerSelect = page.locator('[data-testid="messenger-select"]');
      await expect(messengerSelect).toBeVisible();
    });

    test("dropdown мессенджеров должен содержать Whatsapp и Telegram", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      await page.click('[data-testid="messenger-select-button"]');

      const dropdown = page.locator('[data-testid="messenger-dropdown"]');
      await expect(dropdown).toContainText("Whatsapp");
      await expect(dropdown).toContainText("Telegram");
    });

    test("при выборе Whatsapp должно показать инфо сообщение", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      await page.click('[data-testid="messenger-select-button"]');
      await page.click('[data-testid="messenger-option-whatsapp"]');

      const whatsappInfo = page.locator('[data-testid="whatsapp-info"]');
      await expect(whatsappInfo).toBeVisible();
      await expect(whatsappInfo).toContainText(
        "Привязать номер своего Whatsapp"
      );
    });

    test("при выборе Telegram должно показать инфо сообщение", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      await page.click('[data-testid="messenger-select-button"]');
      await page.click('[data-testid="messenger-option-telegram"]');

      const telegramInfo = page.locator('[data-testid="telegram-info"]');
      await expect(telegramInfo).toBeVisible();
      await expect(telegramInfo).toContainText(
        "Привязать свой аккаунт Telegram"
      );
    });

    test("кнопка Сохранить должна быть активна при выборе Whatsapp", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      await page.click('[data-testid="messenger-select-button"]');
      await page.click('[data-testid="messenger-option-whatsapp"]');

      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).not.toBeDisabled();
    });

    test("кнопка Сохранить должна быть активна при выборе Telegram", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      await page.click('[data-testid="messenger-select-button"]');
      await page.click('[data-testid="messenger-option-telegram"]');

      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).not.toBeDisabled();
    });
  });

  // =====================================================
  // ТЕСТЫ: CRM интеграция
  // =====================================================

  test.describe("Интеграция: CRM", () => {
    test("при выборе CRM должен показать dropdown типов CRM", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      const crmTypeSelect = page.locator('[data-testid="type-select"]');
      await expect(crmTypeSelect).toBeVisible();
    });

    test("dropdown CRM должен содержать Amocrm и Bitrix24", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');

      const dropdown = page.locator('[data-testid="type-dropdown"]');
      await expect(dropdown).toContainText("Amocrm");
      await expect(dropdown).toContainText("Bitrix24");
    });

    test("при выборе Amocrm должно появиться поле ввода домена", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      const domainInput = page.locator('[data-testid="domain-input"]');
      await expect(domainInput).toBeVisible();

      const placeholder = await domainInput.getAttribute("placeholder");
      expect(placeholder).toBe("account.amocrm.ru");
    });

    test("при выборе Bitrix24 должно появиться поле ввода домена", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-bitrix24"]');

      const domainInput = page.locator('[data-testid="domain-input"]');
      await expect(domainInput).toBeVisible();

      const placeholder = await domainInput.getAttribute("placeholder");
      expect(placeholder).toBe("account.bitrix24.ru");
    });

    test('должна показать label "Адрес аккаунта"', async ({ page }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      const label = page.locator('[data-testid="domain-label"]');
      await expect(label).toBeVisible();
      await expect(label).toContainText("Адрес аккаунта");
    });

    test("кнопка Сохранить должна быть отключена если домен не заполнен", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).toBeDisabled();
    });

    test("кнопка Сохранить должна быть активна если домен заполнен", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      await page.fill('[data-testid="domain-input"]', "test.amocrm.ru");

      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).not.toBeDisabled();
    });

    test("должно заполнить поле домена для AmoCRM", async ({ page }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      const domainInput = page.locator('[data-testid="domain-input"]');
      await domainInput.fill("myaccount.amocrm.ru");

      await expect(domainInput).toHaveValue("myaccount.amocrm.ru");
    });

    test("должно заполнить поле домена для Bitrix24", async ({ page }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-bitrix24"]');

      const domainInput = page.locator('[data-testid="domain-input"]');
      await domainInput.fill("myaccount.bitrix24.ru");

      await expect(domainInput).toHaveValue("myaccount.bitrix24.ru");
    });
  });

  // =====================================================
  // ТЕСТЫ: SMS интеграция
  // =====================================================

  test.describe("Интеграция: SMS", () => {
    test("при выборе SMS должно показать warning сообщение", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-sms"]');

      const smsWarning = page.locator('[data-testid="sms-warning"]');
      await expect(smsWarning).toBeVisible();
    });

    test("SMS warning должен содержать правильный текст", async ({ page }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-sms"]');

      const smsWarning = page.locator('[data-testid="sms-warning"]');
      await expect(smsWarning).toContainText("Внимание!");
      await expect(smsWarning).toContainText("Android");
      await expect(smsWarning).toContainText("версии 7.0");
    });

    test("кнопка Сохранить должна быть активна при выборе SMS", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-sms"]');

      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).not.toBeDisabled();
    });

    test("при выборе SMS не должно быть других dropdown", async ({ page }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-sms"]');

      const messengerSelect = page.locator('[data-testid="messenger-select"]');
      const typeSelect = page.locator('[data-testid="type-select"]');
      const domainInput = page.locator('[data-testid="domain-input"]');

      await expect(messengerSelect).not.toBeVisible();
      await expect(typeSelect).not.toBeVisible();
      await expect(domainInput).not.toBeVisible();
    });
  });

  // =====================================================
  // ТЕСТЫ: Изменение выбора
  // =====================================================

  test.describe("Изменение выбора интеграции", () => {
    test("при смене с CRM на Messenger должны исчезнуть поля CRM", async ({
      page,
    }) => {
      // Выбираем CRM
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      let domainInput = page.locator('[data-testid="domain-input"]');
      await expect(domainInput).toBeVisible();

      // Меняем на Messenger
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      // Поле домена должно исчезнуть
      domainInput = page.locator('[data-testid="domain-input"]');
      await expect(domainInput).not.toBeVisible();

      // Должен появиться dropdown мессенджеров
      const messengerSelect = page.locator('[data-testid="messenger-select"]');
      await expect(messengerSelect).toBeVisible();
    });

    test("при смене с Messenger на SMS должны исчезнуть поля Messenger", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      await page.click('[data-testid="messenger-select-button"]');
      await page.click('[data-testid="messenger-option-whatsapp"]');

      let whatsappInfo = page.locator('[data-testid="whatsapp-info"]');
      await expect(whatsappInfo).toBeVisible();

      // Меняем на SMS
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-sms"]');

      // Инфо должно исчезнуть
      whatsappInfo = page.locator('[data-testid="whatsapp-info"]');
      await expect(whatsappInfo).not.toBeVisible();

      // Должно появиться SMS warning
      const smsWarning = page.locator('[data-testid="sms-warning"]');
      await expect(smsWarning).toBeVisible();
    });

    test("при выборе другого типа CRM должны очиститься поля", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      let domainInput = page.locator('[data-testid="domain-input"]');
      await domainInput.fill("test.amocrm.ru");

      await expect(domainInput).toHaveValue("test.amocrm.ru");

      // Меняем на Bitrix24
      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-bitrix24"]');

      // Поле должно очиститься
      domainInput = page.locator('[data-testid="domain-input"]');
      await expect(domainInput).toHaveValue("");
    });
  });

  // =====================================================
  // ТЕСТЫ: Закрытие модалки
  // =====================================================

  test.describe("Закрытие модального окна", () => {
    test("должен закрыть модалку при клике на Отмена", async ({ page }) => {
      await page.click('[data-testid="cancel-btn"]');

      const modal = page.locator('[data-testid="main-modal-container"]');
      await expect(modal).not.toBeVisible();
    });

    test("должен закрыть модалку при клике на X", async ({ page }) => {
      await page.click('[data-testid="modal-close-btn"]');

      const modal = page.locator('[data-testid="main-modal-container"]');
      await expect(modal).not.toBeVisible();
    });
  });

  // =====================================================
  // ТЕСТЫ: Отправка формы
  // =====================================================

  test.describe("Отправка формы на сервер", () => {
    test("должен отправить Messenger + Whatsapp", async ({ page }) => {
      const requestPromise = page.waitForEvent("requestfinished", (request) => {
        return request.url().includes("/addAccount");
      });

      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      await page.click('[data-testid="messenger-select-button"]');
      await page.click('[data-testid="messenger-option-whatsapp"]');

      await page.click('[data-testid="submit-btn"]');

      const request = await requestPromise;
      const postData = request.postDataJSON();

      expect(postData).toEqual({
        group: "messenger",
        messenger: "whatsapp",
      });
    });

    test("должен отправить Messenger + Telegram", async ({ page }) => {
      const requestPromise = page.waitForEvent("requestfinished", (request) => {
        return request.url().includes("/addAccount");
      });

      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      await page.click('[data-testid="messenger-select-button"]');
      await page.click('[data-testid="messenger-option-telegram"]');

      await page.click('[data-testid="submit-btn"]');

      const request = await requestPromise;
      const postData = request.postDataJSON();

      expect(postData).toEqual({
        group: "messenger",
        messenger: "telegram",
      });
    });

    test("должен отправить CRM + Amocrm + домен", async ({ page }) => {
      const requestPromise = page.waitForEvent("requestfinished", (request) => {
        return request.url().includes("/addAccount");
      });

      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      await page.fill('[data-testid="domain-input"]', "test.amocrm.ru");

      await page.click('[data-testid="submit-btn"]');

      const request = await requestPromise;
      const postData = request.postDataJSON();

      expect(postData).toEqual({
        group: "crm",
        type: "amocrm",
        domain: "test.amocrm.ru",
      });
    });

    test("должен отправить CRM + Bitrix24 + домен", async ({ page }) => {
      const requestPromise = page.waitForEvent("requestfinished", (request) => {
        return request.url().includes("/addAccount");
      });

      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-bitrix24"]');

      await page.fill('[data-testid="domain-input"]', "test.bitrix24.ru");

      await page.click('[data-testid="submit-btn"]');

      const request = await requestPromise;
      const postData = request.postDataJSON();

      expect(postData).toEqual({
        group: "crm",
        type: "bitrix24",
        domain: "test.bitrix24.ru",
      });
    });

    test("должен отправить SMS", async ({ page }) => {
      const requestPromise = page.waitForEvent("requestfinished", (request) => {
        return request.url().includes("/addAccount");
      });

      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-sms"]');

      await page.click('[data-testid="submit-btn"]');

      const request = await requestPromise;
      const postData = request.postDataJSON();

      expect(postData).toEqual({
        group: "sms",
      });
    });

    test("должен отправить с правильным Authorization header", async ({
      page,
    }) => {
      const requestPromise = page.waitForEvent("request", (request) => {
        return (
          request.url().includes("/addAccount") && request.method() === "POST"
        );
      });

      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-sms"]');

      await page.click('[data-testid="submit-btn"]');

      const request = await requestPromise;
      const headers = request.headers();

      expect(headers.authorization).toBeDefined();
      expect(headers.authorization).toMatch(/^Bearer /);
    });
  });

  // =====================================================
  // ТЕСТЫ: Валидация
  // =====================================================

  test.describe("Валидация кнопки Сохранить", () => {
    test("кнопка должна быть отключена при загрузке страницы", async ({
      page,
    }) => {
      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).toBeDisabled();
    });

    test("кнопка должна быть включена после выбора Messenger", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-messenger"]');

      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).not.toBeDisabled();
    });

    test("кнопка должна быть включена после выбора SMS", async ({ page }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-sms"]');

      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).not.toBeDisabled();
    });

    test("кнопка должна быть отключена если выбран CRM без домена", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).toBeDisabled();
    });

    test("кнопка должна быть включена если выбран CRM с доменом", async ({
      page,
    }) => {
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      await page.fill('[data-testid="domain-input"]', "test.amocrm.ru");

      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).not.toBeDisabled();
    });
  });

  // =====================================================
  // ТЕСТЫ: Обработка ошибок
  // =====================================================

  test.describe("Обработка ошибок API", () => {
    test("должен обработать ошибку 400", async ({ page }) => {
      await page.route("**/addAccount", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ ok: false, message: "Invalid domain" }),
        });
      });

      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      await page.fill('[data-testid="domain-input"]', "invalid");

      await page.click('[data-testid="submit-btn"]');

      // Модаль должна остаться открытой при ошибке
      const modal = page.locator('[data-testid="main-modal-container"]');
      await expect(modal).toBeVisible();
    });

    test("должен обработать ошибку 500", async ({ page }) => {
      await page.route("**/addAccount", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ ok: false, message: "Server error" }),
        });
      });

      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-sms"]');

      await page.click('[data-testid="submit-btn"]');

      const modal = page.locator('[data-testid="main-modal-container"]');
      await expect(modal).toBeVisible();
    });
  });

  // =====================================================
  // ТЕСТЫ: Full User Journey
  // =====================================================

  test.describe("Полный сценарий использования", () => {
    test("пользователь выбирает Messenger → Whatsapp → отправляет", async ({
      page,
    }) => {
      // Выбираем группу
      await page.click('[data-testid="group-select-button"]');
      await expect(
        page.locator('[data-testid="group-dropdown"]')
      ).toBeVisible();

      // Выбираем Messenger
      await page.click('[data-testid="group-option-messenger"]');
      await expect(
        page.locator('[data-testid="messenger-select"]')
      ).toBeVisible();

      // Выбираем Whatsapp
      await page.click('[data-testid="messenger-select-button"]');
      await page.click('[data-testid="messenger-option-whatsapp"]');

      // Видим инфо сообщение
      await expect(page.locator('[data-testid="whatsapp-info"]')).toBeVisible();

      // Кнопка активна
      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).not.toBeDisabled();

      // Отправляем
      const requestPromise = page.waitForEvent("requestfinished", (request) => {
        return request.url().includes("/addAccount");
      });

      await submitBtn.click();

      const request = await requestPromise;
      const postData = request.postDataJSON();

      expect(postData).toEqual({
        group: "messenger",
        messenger: "whatsapp",
      });
    });

    test("пользователь выбирает CRM → Amocrm → заполняет домен → отправляет", async ({
      page,
    }) => {
      // Выбираем группу
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-crm"]');

      // Выбираем CRM тип
      await page.click('[data-testid="type-select-button"]');
      await page.click('[data-testid="type-option-amocrm"]');

      // Проверяем label
      await expect(page.locator('[data-testid="domain-label"]')).toContainText(
        "Адрес аккаунта"
      );

      // Заполняем домен
      const domainInput = page.locator('[data-testid="domain-input"]');
      await domainInput.fill("mycompany.amocrm.ru");
      await expect(domainInput).toHaveValue("mycompany.amocrm.ru");

      // Кнопка активна
      const submitBtn = page.locator('[data-testid="submit-btn"]');
      await expect(submitBtn).not.toBeDisabled();

      // Отправляем
      const requestPromise = page.waitForEvent("requestfinished", (request) => {
        return request.url().includes("/addAccount");
      });

      await submitBtn.click();

      const request = await requestPromise;
      const postData = request.postDataJSON();

      expect(postData).toEqual({
        group: "crm",
        type: "amocrm",
        domain: "mycompany.amocrm.ru",
      });
    });

    test("пользователь выбирает SMS → отправляет", async ({ page }) => {
      // Выбираем SMS
      await page.click('[data-testid="group-select-button"]');
      await page.click('[data-testid="group-option-sms"]');

      // Видим warning
      await expect(page.locator('[data-testid="sms-warning"]')).toContainText(
        "Android"
      );

      // Отправляем
      const requestPromise = page.waitForEvent("requestfinished", (request) => {
        return request.url().includes("/addAccount");
      });

      await page.click('[data-testid="submit-btn"]');

      const request = await requestPromise;
      const postData = request.postDataJSON();

      expect(postData).toEqual({
        group: "sms",
      });
    });
  });
});
