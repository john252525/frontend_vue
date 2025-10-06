<template>
  <div
    v-if="!showInvoiceModal"
    @click="changeCreatePayments"
    class="modal-overlay"
  ></div>
  <section v-if="!showInvoiceModal" class="payment-modal">
    <!-- Загрузочный оверлей -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loader-container">
        <div class="spinner"></div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>
    </div>

    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title">{{ $t("depositPay.title") }}</h1>
        <button
          @click="changeCreatePayments"
          class="close-btn"
          :disabled="isLoading"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <form @submit.prevent="checkPay" class="payment-form">
        <!-- Поле суммы -->
        <div class="form-group">
          <label class="form-label">Сумма пополнения</label>
          <div class="input-wrapper">
            <input
              v-model.number="payments.amount"
              type="number"
              :placeholder="$t('depositPay.placeSum')"
              min="10"
              max="50000"
              step="1"
              class="form-input"
              :disabled="isLoading"
              @input="validateAmount"
            />
            <span class="input-currency">₽</span>
          </div>
          <div class="amount-hints">
            <span class="hint">Мин: 10 ₽</span>
            <span class="hint">Макс: 50,000 ₽</span>
          </div>
          <label class="form-label">Email для получения чека</label>
          <div class="input-wrapper">
            <input
              v-model.trim="payments.email"
              type="email"
              placeholder="Введите email"
              class="form-input"
              :class="{ 'input-error': emailError }"
              :disabled="isLoading"
              @input="validateEmail"
            />
            <span class="input-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
                <polyline
                  points="22,6 12,13 2,6"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
            </span>
          </div>
          <div v-if="emailError" class="error-text">{{ emailError }}</div>
          <div class="email-hint">
            <span class="hint"
              >На этот email будет отправлен чек об оплате</span
            >
          </div>
        </div>

        <!-- Блок ИНН -->
        <transition name="slide-fade">
          <section v-if="payments.value === 'Inn'" class="inn-section">
            <div class="section-header">
              <div class="section-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <polyline
                    points="14,2 14,8 20,8"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M16 13H8"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M16 17H8"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M10 9H8"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <h3 class="section-title">Реквизиты для счета</h3>
            </div>

            <div class="form-group">
              <label class="form-label">ИНН организации или ИП</label>

              <!-- Лоадер загрузки ИНН -->
              <div v-if="loadingInnFromBackend" class="inn-loading">
                <div class="inn-loader"></div>
                <span>Загрузка ИНН из профиля...</span>
              </div>

              <!-- Если ИНН загружен и не редактируется -->
              <div
                v-else-if="
                  innFromBackend && innFromBackend !== '' && !isEditingInn
                "
                class="input-with-action"
              >
                <input
                  v-model.trim="innValue"
                  type="text"
                  placeholder="Введите 10 или 12 цифр"
                  maxlength="12"
                  class="form-input"
                  :disabled="true"
                />
                <button
                  type="button"
                  @click="enableInnEditing"
                  class="edit-inn-btn"
                  :disabled="isLoading"
                  title="Изменить ИНН"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>

              <!-- Если ИНН пустой или редактируется -->
              <div v-else class="input-with-action">
                <input
                  v-model.trim="innValue"
                  type="text"
                  placeholder="Введите 10 или 12 цифр"
                  maxlength="12"
                  class="form-input"
                  :class="{ 'input-error': innError }"
                  :disabled="isLoading"
                  @input="validateInnOnInput"
                />
              </div>

              <div v-if="innError" class="error-text">{{ innError }}</div>

              <div
                v-if="innFromBackend && innFromBackend !== '' && !isEditingInn"
                class="inn-info"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />
                </svg>
                <span>ИНН загружен из вашего профиля</span>
              </div>

              <div
                v-else-if="
                  (!innFromBackend || innFromBackend === '') &&
                  !loadingInnFromBackend
                "
                class="inn-empty-message"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span
                  >ИНН не найден в профиле. Пожалуйста, введите и сохраните
                  ИНН.</span
                >
              </div>
            </div>

            <!-- Кнопка сохранить/обновить ИНН -->
            <button
              v-if="!innFromBackend || innFromBackend === '' || isEditingInn"
              type="button"
              @click="saveInn"
              class="btn btn-success save-inn-btn"
              :disabled="!isInnValid || isLoading"
            >
              <span v-if="loadingStates.inn" class="btn-loading">
                <div class="btn-spinner"></div>
                Сохранение...
              </span>
              <span v-else class="btn-content">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="none"
                  />
                  <path
                    d="M17 21v-8H7v8"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="none"
                  />
                  <path
                    d="M7 3v5h8V3"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="none"
                  />
                </svg>
                {{
                  innFromBackend && innFromBackend !== ""
                    ? "Обновить ИНН"
                    : "Сохранить ИНН"
                }}
              </span>
            </button>
          </section>
        </transition>

        <!-- Способы оплаты -->
        <section class="payment-methods">
          <div class="section-header">
            <div class="section-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="5"
                  width="20"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path d="M2 10h20" stroke="currentColor" stroke-width="2" />
                <path
                  d="M6 15h4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <h3 class="section-title">Способ оплаты</h3>
          </div>

          <div class="methods-grid">
            <div
              :class="[
                'method-card',
                {
                  'method-active': payments.value === 'YooKassa',
                  'method-disabled': isLoading,
                },
              ]"
              @click="!isLoading && changePaymentsValue('YooKassa')"
            >
              <div class="method-icon">
                <div class="icon-wrapper">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 95 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clip-rule="evenodd"
                      d="m26.4424 31.7092c.0477-17.4683 14.4906-31.7092 32.6397-31.7092 17.9726 0 32.8465 14.288 32.6399 31.7959 0 17.5079-14.6673 31.7959-32.6399 31.7959-17.9431 0-32.5917-14.0406-32.6397-31.7088v23.6592h-11.5685l-14.8739-46.2852h26.4424zm20.4514.0867c0 6.4397 5.5777 11.8732 12.1883 11.8732 6.8172 0 12.1884-5.4335 12.1884-11.8732s-5.5777-11.8731-12.1884-11.8731c-6.6106 0-12.1883 5.4334-12.1883 11.8731z"
                      fill="#0070f0"
                      fill-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div class="method-info">
                <h4>YooKassa</h4>
                <p>Банковская карта, ЮMoney, СБП</p>
              </div>
              <div class="method-check">
                <div class="checkmark"></div>
              </div>
            </div>

            <div
              :class="[
                'method-card',
                {
                  'method-active': payments.value === 'Inn',
                  'method-disabled': isLoading,
                },
              ]"
              @click="!isLoading && changePaymentsValue('Inn')"
            >
              <div class="method-icon">
                <div class="icon-wrapper">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M9 12h6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M9 16h6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div class="method-info">
                <h4>Оплата по счету</h4>
                <p>Для юридических лиц и ИП</p>
              </div>
              <div class="method-check">
                <div class="checkmark"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Основная кнопка -->
        <button
          type="submit"
          class="btn btn-primary action-btn"
          :disabled="!isFormValid || isLoading"
        >
          <span v-if="loadingStates.payment" class="btn-loading">
            <div class="btn-spinner"></div>
            Обработка...
          </span>
          <span v-else-if="loadingStates.invoice" class="btn-loading">
            <div class="btn-spinner"></div>
            Генерация счета...
          </span>
          <span v-else class="btn-content">
            <span v-if="payments.value === 'Inn'">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M9 12h6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path
                  d="M9 16h6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Получить счет на оплату
            </span>
            <span v-else>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="5"
                  width="20"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path d="M2 10h20" stroke="currentColor" stroke-width="2" />
                <path
                  d="M6 15h4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              {{ $t("depositPay.button") }}
            </span>
          </span>
        </button>
      </form>

      <!-- Сообщение об ошибке -->
      <transition name="slide-fade">
        <div v-if="payments.errorMessage" class="error-card">
          <div class="error-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="error-content">
            <p>{{ payments.errorMessage }}</p>
          </div>
        </div>
      </transition>
    </div>
  </section>

  <!-- Модалка сгенерированного счета -->
  <div
    v-if="showInvoiceModal"
    class="modal-overlay"
    @click="closeInvoiceModal"
  ></div>
  <transition name="modal">
    <section v-if="showInvoiceModal" class="invoice-modal">
      <div class="invoice-modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Счет готов к оплате</h2>
          <button @click="closeInvoiceModal" class="close-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <div class="invoice-success">
          <div class="success-icon-large">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" fill="#10b981" />
              <path
                d="M9 12l2 2 4-4"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="success-message">
            <h3>Счет успешно сгенерирован</h3>
            <p>Вы можете просмотреть или скачать счет для оплаты</p>
          </div>
        </div>

        <div class="invoice-details">
          <div class="detail-item">
            <span class="detail-label">Сумма:</span>
            <span class="detail-value">{{ payments.amount }} ₽</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">ИНН:</span>
            <span class="detail-value">{{ innValue }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Дата создания:</span>
            <span class="detail-value">{{
              new Date().toLocaleDateString("ru-RU")
            }}</span>
          </div>
        </div>

        <div class="invoice-actions-modal">
          <button
            @click="downloadInvoice"
            class="btn btn-primary btn-large"
            :disabled="downloadingInvoice"
          >
            <span v-if="downloadingInvoice" class="btn-loading">
              <div class="btn-spinner"></div>
              Скачивание...
            </span>
            <span v-else class="btn-content">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
                <polyline
                  points="7,10 12,15 17,10"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
                <line
                  x1="12"
                  y1="15"
                  x2="12"
                  y2="3"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
              Скачать PDF
            </span>
          </button>

          <button
            @click="openInvoiceInNewTab"
            class="btn btn-outline btn-large"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
            Посмотреть счет
          </button>

          <button
            @click="closeInvoiceModal"
            class="btn btn-secondary btn-large"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Закрыть
          </button>
        </div>
      </div>
    </section>
  </transition>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from "vue";
import axios from "axios";
const apiUrl = import.meta.env.VITE_PAY_URL;

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const props = defineProps({
  changeCreatePayments: {
    type: Function,
  },
});

// Реактивные состояния
const payments = reactive({
  value: "YooKassa",
  errorMessage: "",
  amount: null,
  email: "", // Добавьте это поле
});

const emailError = ref("");
const innValue = ref("");
const innError = ref("");
const innSaved = ref(false);
const invoiceLink = ref("");
const paymentUrl = ref(null);
const innFromBackend = ref(null);
const isEditingInn = ref(false);
const loadingInnFromBackend = ref(false);
const showInvoiceModal = ref(false);
const downloadingInvoice = ref(false);

// Состояния загрузки
const isLoading = ref(false);
const loadingText = ref("");
const loadingStates = reactive({
  inn: false,
  payment: false,
  invoice: false,
});

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

// Валидации
const validateEmail = (email) => {
  if (!email) return "Email обязателен для заполнения";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Введите корректный email адрес";
  return "";
};

const isEmailValid = computed(() => {
  return payments.email && !validateEmail(payments.email);
});

// Валидации
const isInnValid = computed(() => {
  return innValue.value && !validateInn(innValue.value);
});

const isAmountValid = computed(() => {
  return payments.amount >= 10 && payments.amount <= 50000;
});

const isFormValid = computed(() => {
  if (!isAmountValid.value) return false;

  // Для YooKassa проверяем email
  if (payments.value === "YooKassa") {
    return isEmailValid.value;
  }

  // Для ИНН проверяем сохраненный ИНН
  if (payments.value === "Inn") {
    return (
      innSaved.value && innFromBackend.value && innFromBackend.value !== ""
    );
  }

  return true;
});

const validateInn = (inn) => {
  if (!inn) return "ИНН обязателен для заполнения";
  if (!/^\d+$/.test(inn)) return "ИНН должен содержать только цифры";
  if (inn.length < 10) return "ИНН должен содержать минимум 10 цифр";
  if (inn.length > 12) return "ИНН должен содержать максимум 12 цифр";
  if (inn.length !== 10 && inn.length !== 12)
    return "ИНН должен содержать 10 или 12 цифр";
  return "";
};

const validateAmount = () => {
  //  if (payments.amount > 50000) payments.amount = 50000;
  //  if (payments.amount < 10) payments.amount = 10;
};

const validateInnOnInput = () => {
  innError.value = validateInn(innValue.value);
};

const enableInnEditing = () => {
  isEditingInn.value = true;
  innSaved.value = false;
};

// API функции
const saveInn = async () => {
  innError.value = validateInn(innValue.value);
  if (innError.value) return;

  loadingStates.inn = true;
  isLoading.value = true;
  loadingText.value = "Сохранение ИНН...";

  try {
    const response = await axios.get(
      `https://bapi88.apitter.com/api/v1/invoices/saveInn`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        params: { inn: innValue.value },
      }
    );

    if (response.data.ok) {
      innSaved.value = true;
      innFromBackend.value = innValue.value;
      isEditingInn.value = false;
      payments.errorMessage = "";
      await handleSendLog(
        "payment",
        "saveInn",
        { inn: innValue.value },
        response.data,
        response.data
      );
    }
  } catch (error) {
    console.error("error", error);
    payments.errorMessage =
      error.response?.data?.message || "Ошибка при сохранении ИНН";
  } finally {
    loadingStates.inn = false;
    isLoading.value = false;
    loadingText.value = "";
  }
};

const generateInvoice = async () => {
  loadingStates.invoice = true;
  isLoading.value = true;
  loadingText.value = "Генерация счета...";

  try {
    const response = await axios.post(
      `https://bapi88.apitter.com/api/v1/invoices/generateInvoice`,
      { amount: payments.amount },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.ok) {
      invoiceLink.value = response.data.data.invoice_link;
      showInvoiceModal.value = true;
      await handleSendLog(
        "payment",
        "generateInvoice",
        { amount: payments.amount },
        response.data,
        response.data
      );
    }
    return response;
  } catch (error) {
    console.error("Error in generateInvoice:", error);
    payments.errorMessage =
      error.response?.data?.message || "Ошибка при генерации счета";
    return null;
  } finally {
    loadingStates.invoice = false;
    isLoading.value = false;
    loadingText.value = "";
  }
};

const createPayment = async () => {
  payments.errorMessage = "";
  loadingStates.payment = true;
  isLoading.value = true;
  loadingText.value = "Создание платежа...";

  try {
    const response = await axios.post(
      `${apiUrl}/create_payment`,
      {
        amount: payments.amount,
        currency: "RUB",
        type: "+",
        domain: `https://${window.location.hostname}/Payments`,
        email: payments.email, // Добавьте email в запрос
      },
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );

    if (response.data) {
      await handleSendLog(
        "payment",
        "create_payment",
        {
          amount: payments.amount,
          currency: "RUB",
          email: payments.email,
        },
        response.data,
        response.data
      );
    }

    if (response.data.success) {
      paymentUrl.value = response.data.confirmation_url;
      window.location.href = paymentUrl.value;
    }
  } catch (error) {
    console.error("error", error);
    payments.errorMessage = error.response?.data?.message || "Ошибка сети";
  } finally {
    loadingStates.payment = false;
    isLoading.value = false;
    loadingText.value = "";
  }
};

const checkPay = () => {
  payments.errorMessage = "";

  if (!payments.value) {
    payments.errorMessage = "Ошибка! Выберите способ оплаты";
  } else if (!payments.amount || payments.amount < 10) {
    payments.errorMessage = "Ошибка! Минимальная сумма оплаты - 10 руб.";
  } else if (payments.amount > 50000) {
    payments.errorMessage = "Ошибка! Максимальная сумма оплаты - 50,000 руб.";
  } else if (payments.value === "YooKassa" && !isEmailValid.value) {
    payments.errorMessage = "Ошибка! Введите корректный email адрес";
  } else if (payments.value === "Inn" && !innSaved) {
    payments.errorMessage = "Ошибка! Сначала сохраните ИНН";
  } else if (payments.value === "YooKassa") {
    createPayment();
  } else if (payments.value === "Inn") {
    generateInvoice();
  }
};

const changePaymentsValue = (pay) => {
  payments.value = pay;
  payments.errorMessage = "";
  showInvoiceModal.value = false;

  // При выборе ИНН начинаем загрузку
  if (pay === "Inn") {
    getInn();
  }
};

const getInn = async () => {
  loadingInnFromBackend.value = true;

  try {
    const response = await axios.get(
      `https://bapi88.apitter.com/api/v1/invoices/getInn`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );

    if (response.data.ok && response.data.data.inn) {
      innValue.value = response.data.data.inn;
      innSaved.value = true;
      innFromBackend.value = response.data.data.inn;
    } else {
      innFromBackend.value = "";
      innSaved.value = false;
      isEditingInn.value = true; // Автоматически разрешаем редактирование если ИНН нет
    }
  } catch (error) {
    console.error("error", error);
    innFromBackend.value = "";
    innSaved.value = false;
    isEditingInn.value = true; // Автоматически разрешаем редактирование при ошибке
  } finally {
    loadingInnFromBackend.value = false;
  }
};

const downloadInvoice = async () => {
  if (!invoiceLink.value) return;

  downloadingInvoice.value = true;

  try {
    // Используем axios с credentials для обхода CORS
    const response = await axios.get(invoiceLink.value, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Счет_${innValue.value}_${payments.amount}руб_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Ошибка при скачивании счета:", error);

    // Альтернативный способ - открыть в новой вкладке для скачивания
    if (error.code === "ERR_NETWORK" || error.message.includes("CORS")) {
      window.open(invoiceLink.value, "_blank");
    } else {
      payments.errorMessage = "Ошибка при скачивании счета";
    }
  } finally {
    downloadingInvoice.value = false;
  }
};

const openInvoiceInNewTab = () => {
  if (invoiceLink.value) {
    window.open(invoiceLink.value, "_blank");
  }
};

const closeInvoiceModal = () => {
  showInvoiceModal.value = false;
};

onMounted(() => {
  // Загружаем ИНН только если выбран соответствующий способ оплаты
  if (payments.value === "Inn") {
    getInn();
  }
});
</script>

<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 1000;
}

.payment-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  width: 440px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-container {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-left: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

.loading-text {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.modal-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(85vh - 48px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.input-error {
  border-color: #ef4444;
}

.input-currency {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 500;
}

.amount-hints {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #9ca3af;
}

.inn-section {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  color: #6b7280;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.input-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.email-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.inn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.inn-loader {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.inn-empty-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  font-size: 14px;
  color: #92400e;
  margin-bottom: 12px;
}

.input-with-action {
  position: relative;
  display: flex;
  align-items: center;
}

.edit-inn-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-inn-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.inn-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #059669;
  margin-top: 4px;
}

.info-icon {
  color: #059669;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.save-inn-btn {
  margin-top: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  width: 100%;
  flex-shrink: 0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-outline {
  background: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-outline:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-large {
  padding: 14px 20px;
  font-size: 16px;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.payment-methods {
  margin: 4px 0;
  flex-shrink: 0;
}

.methods-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.method-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  gap: 12px;
}

.method-card:hover:not(.method-disabled) {
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.method-active {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.method-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.method-icon {
  flex-shrink: 0;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-info {
  flex: 1;
}

.method-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 2px 0;
}

.method-info p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.method-check {
  flex-shrink: 0;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s;
}

.method-active .checkmark {
  border-color: #3b82f6;
  background: #3b82f6;
}

.method-active .checkmark::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 6px;
  width: 6px;
  height: 3px;
  border: 2px solid white;
  border-top: none;
  border-right: none;
  transform: rotate(-45deg);
}

.action-btn {
  margin-top: auto;
  flex-shrink: 0;
}

.error-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  margin-top: 16px;
  flex-shrink: 0;
}

.error-icon {
  color: #dc2626;
}

.error-content p {
  margin: 0;
  font-size: 14px;
}

/* Модалка счета */
.invoice-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1002;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  width: 400px;
  max-height: 90vh;
  overflow: hidden;
}

.invoice-modal-content {
  padding: 24px;
}

.invoice-success {
  text-align: center;
  margin-bottom: 24px;
}

.success-icon-large {
  margin-bottom: 16px;
}

.success-message h3 {
  font-size: 18px;
  font-weight: 600;
  color: #065f46;
  margin: 0 0 8px 0;
}

.success-message p {
  font-size: 14px;
  color: #047857;
  margin: 0;
}

.invoice-details {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-item:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.detail-label {
  font-size: 14px;
  color: #6b7280;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.invoice-actions-modal {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Анимации */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

/* Убираем скролл */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 480px) {
  .payment-modal,
  .invoice-modal {
    width: 95vw;
    margin: 20px;
    max-height: 90vh;
  }

  .modal-content {
    padding: 20px;
    max-height: calc(90vh - 40px);
  }

  .method-card {
    padding: 10px;
    gap: 10px;
  }

  .icon-wrapper {
    width: 36px;
    height: 36px;
  }
}
</style>
