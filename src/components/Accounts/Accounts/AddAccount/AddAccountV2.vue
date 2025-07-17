<template>
    <div class="modal-overlay" @click.self="openModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Настройка интеграции</h2>
          <button class="close-btn" @click="openModal">&times;</button>
        </div>
  
        <div class="modal-content">
          <!-- Group Select -->
          <div class="form-group">
            <label>Тип интеграции</label>
            <div
              class="custom-select"
              v-click-outside="() => closeDropdown('group')"
            >
              <div class="selected-option" @click="toggleDropdown('group')">
                <span>{{ selectedGroup || "Выберите тип" }}</span>
                <svg
                  class="dropdown-icon"
                  :class="{ 'rotate-180': dropdownOpen.group }"
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="#6B7280"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="dropdown-options" v-show="dropdownOpen.group">
                <div
                  v-for="option in formData.data.options"
                  :key="option.value"
                  class="option"
                  @click="selectOption('group', option.value)"
                >
                  {{ option.value }}
                </div>
              </div>
            </div>
          </div>
  
          <!-- Source Select (for messenger) -->
          <div
            v-if="
              selectedGroup === 'messenger' &&
              currentChildren &&
              currentChildren.type === 'select'
            "
            class="form-group"
          >
            <label>Источник</label>
            <div
              class="custom-select"
              v-click-outside="() => closeDropdown('source')"
            >
              <div class="selected-option" @click="toggleDropdown('source')">
                <span>{{ selectedSource || "Выберите источник" }}</span>
                <svg
                  class="dropdown-icon"
                  :class="{ 'rotate-180': dropdownOpen.source }"
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="#6B7280"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="dropdown-options" v-show="dropdownOpen.source">
                <div
                  v-for="option in currentChildren.options"
                  :key="option.value"
                  class="option"
                  @click="selectOption('source', option.value)"
                >
                  {{ option.value }}
                </div>
              </div>
            </div>
          </div>
  
          <!-- Type Select (for whatsapp) -->
          <div
            v-if="
              selectedSource === 'whatsapp' &&
              sourceChildren &&
              sourceChildren.type === 'select'
            "
            class="form-group"
          >
            <label>Тип подключения</label>
            <div
              class="custom-select"
              v-click-outside="() => closeDropdown('type')"
            >
              <div class="selected-option" @click="toggleDropdown('type')">
                <span>{{ selectedType || "Выберите тип" }}</span>
                <svg
                  class="dropdown-icon"
                  :class="{ 'rotate-180': dropdownOpen.type }"
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="#6B7280"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="dropdown-options" v-show="dropdownOpen.type">
                <div
                  v-for="option in sourceChildren.options"
                  :key="option.value"
                  class="option"
                  @click="selectOption('type', option.value)"
                >
                  {{ option.value }}
                </div>
              </div>
            </div>
          </div>
  
          <!-- Fields for edna -->
          <div
            v-if="selectedType === 'edna' && typeChildren && typeChildren.length"
            class="fields-group"
          >
            <div
              v-for="field in typeChildren"
              :key="field.name"
              class="form-field"
            >
              <label>{{ getFieldLabel(field.name) }}</label>
              <input
                v-model="formValues[field.name]"
                :type="field.type === 'input' ? 'text' : field.type"
                :required="field.required"
                :placeholder="getFieldPlaceholder(field.name)"
              />
            </div>
          </div>
  
          <!-- Field for telegram -->
          <div
            v-if="
              selectedSource === 'telegram' &&
              sourceChildren &&
              sourceChildren.type === 'input'
            "
            class="form-field"
          >
            <label>Номер телефона</label>
            <input
              v-model="formValues[sourceChildren.name]"
              type="text"
              required
              placeholder="+71234567890"
            />
          </div>
  
          <!-- Message for empty children -->
          <div
            v-if="
              (selectedSource === 'sms' && !sourceChildren) ||
              (selectedGroup === 'crm' &&
                selectedType === 'bitrix24' &&
                !typeChildren)
            "
            class="info-message"
          >
            <p>Дополнительная настройка не требуется</p>
          </div>
  
          <!-- Fields for megaplan -->
          <div
            v-if="
              selectedType === 'megaplan' && typeChildren && typeChildren.length
            "
            class="fields-group"
          >
            <div
              v-for="field in typeChildren"
              :key="field.name"
              class="form-field"
            >
              <label>{{ getFieldLabel(field.name) }}</label>
              <input
                v-model="formValues[field.name]"
                :type="field.type === 'input' ? 'text' : field.type"
                :required="field.required"
                :placeholder="getFieldPlaceholder(field.name)"
              />
            </div>
          </div>
  
          <!-- Link for amocrm -->
          <div v-if="selectedType === 'amocrm'" class="info-message">
            <p>
              Перейдите по <a href="#" class="link">ссылке</a> для подключения
              AmoCRM
            </p>
          </div>
        </div>
  
        <div class="modal-footer">
          <button class="cancel-btn" @click="openModal">Отмена</button>
          <button class="submit-btn" @click="submitForm" :disabled="!isFormValid">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
  import axios from "axios";
  
  const props = defineProps({
    isOpen: Boolean,
    openModal: {
      type: Function,
    }
  });
  
  const emit = defineEmits(["close", "submit"]);
  
  // Form data
  const formData = ref({
    ok: true,
    message: null,
    data: {
      type: "select",
      required: true,
      validate: false,
      name: "group",
      options: [
        {
          value: "messenger",
          children: {
            type: "select",
            required: true,
            validate: false,
            name: "source",
            options: [
              {
                value: "whatsapp",
                children: {
                  type: "select",
                  required: true,
                  validate: false,
                  name: "type",
                  options: [
                    {
                      value: "touchapi",
                      children: [],
                    },
                    {
                      value: "edna",
                      children: [
                        {
                          type: "input",
                          required: true,
                          validate: false,
                          name: "token",
                          value: "",
                        },
                        {
                          type: "input",
                          required: false,
                          validate: false,
                          name: "login",
                          value: "",
                        },
                      ],
                    },
                  ],
                },
              },
              {
                value: "telegram",
                children: {
                  type: "input",
                  required: true,
                  validate: "phone",
                  name: "login",
                  value: "",
                },
              },
              {
                value: "sms",
                children: [],
              },
            ],
          },
        },
        {
          value: "crm",
          children: {
            type: "select",
            required: true,
            validate: false,
            name: "type",
            options: [
              {
                value: "",
              },
              {
                value: "amocrm",
                children: {
                  type: "p",
                  value: "link",
                },
              },
              {
                value: "bitrix24",
                children: [],
              },
              {
                value: "megaplan",
                children: [
                  {
                    type: "input",
                    required: true,
                    validate: false,
                    name: "token",
                    value: "",
                  },
                  {
                    type: "input",
                    required: true,
                    validate: false,
                    name: "login",
                    value: "",
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  });
  
  // Selected values
  const selectedGroup = ref("");
  const selectedSource = ref("");
  const selectedType = ref("");
  
  // Dropdown states
  const dropdownOpen = ref({
    group: false,
    source: false,
    type: false,
  });
  
  // Children references
  const currentChildren = ref(null);
  const sourceChildren = ref(null);
  const typeChildren = ref(null);
  
  // Form values
  const formValues = ref({});
  
  // Field labels and placeholders mapping
  const fieldLabels = {
    token: "API Токен",
    login: "Логин",
  };
  
  const fieldPlaceholders = {
    token: "Введите ваш API токен",
    login: "Введите ваш логин",
  };
  
  // Директива для закрытия при клике вне элемента
  const vClickOutside = {
    beforeMount(el, binding) {
      el.clickOutsideEvent = function (event) {
        if (!(el === event.target || el.contains(event.target))) {
          binding.value();
        }
      };
      document.addEventListener("click", el.clickOutsideEvent);
    },
    unmounted(el) {
      document.removeEventListener("click", el.clickOutsideEvent);
    },
  };
  
  // Helper functions
  const getFieldLabel = (name) => fieldLabels[name] || name;
  const getFieldPlaceholder = (name) => fieldPlaceholders[name] || "";
  
  // Fetch form data
  onMounted(async () => {
    try {
      const response = await axios.get(
        "https://bapi88.developtech.ru/api/v1/forms/getAddInstanceForm2"
      );
      formData.value = response.data;
    } catch (error) {
      console.error("Error fetching form data:", error);
    }
  });
  
  // Отслеживаем открытие/закрытие модального окна
  watch(
    () => props.isOpen,
    (newVal) => {
      if (newVal) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  );
  
  // Очищаем при размонтировании
  onBeforeUnmount(() => {
    document.body.style.overflow = "";
  });
  
  // Dropdown methods
  const toggleDropdown = (name) => {
    // Закрываем все другие dropdown
    Object.keys(dropdownOpen.value).forEach((key) => {
      if (key !== name) dropdownOpen.value[key] = false;
    });
    // Переключаем текущий
    dropdownOpen.value[name] = !dropdownOpen.value[name];
  };
  
  const closeDropdown = (name) => {
    dropdownOpen.value[name] = false;
  };
  
  const selectOption = (name, value) => {
    if (name === "group") {
      selectedGroup.value = value;
      handleGroupChange();
    } else if (name === "source") {
      selectedSource.value = value;
      handleSourceChange();
    } else if (name === "type") {
      selectedType.value = value;
      handleTypeChange();
    }
    // Закрываем dropdown после выбора
    closeDropdown(name);
  };
  
  // Form validation
  const isFormValid = computed(() => {
    if (!selectedGroup.value) return false;
  
    // Messenger validation
    if (selectedGroup.value === "messenger") {
      if (!selectedSource.value) return false;
  
      // Telegram validation
      if (selectedSource.value === "telegram") {
        return !!formValues.value.login;
      }
  
      // WhatsApp edna validation
      if (selectedSource.value === "whatsapp" && selectedType.value === "edna") {
        return !!formValues.value.token;
      }
    }
  
    // CRM validation
    if (selectedGroup.value === "crm") {
      if (!selectedType.value) return false;
  
      // Megaplan validation
      if (selectedType.value === "megaplan") {
        return !!formValues.value.token && !!formValues.value.login;
      }
    }
  
    return true;
  });
  
  // Handlers
  const handleGroupChange = () => {
    selectedSource.value = "";
    selectedType.value = "";
    formValues.value = {};
  
    const selectedOption = formData.value.data.options.find(
      (opt) => opt.value === selectedGroup.value
    );
    currentChildren.value = selectedOption ? selectedOption.children : null;
    sourceChildren.value = null;
    typeChildren.value = null;
  };
  
  const handleSourceChange = () => {
    selectedType.value = "";
  
    if (currentChildren.value && currentChildren.value.options) {
      const selectedOption = currentChildren.value.options.find(
        (opt) => opt.value === selectedSource.value
      );
      sourceChildren.value = selectedOption ? selectedOption.children : null;
  
      // For telegram, initialize the field
      if (
        selectedSource.value === "telegram" &&
        sourceChildren.value &&
        sourceChildren.value.name
      ) {
        formValues.value[sourceChildren.value.name] = "";
      }
    }
  };
  
  const handleTypeChange = () => {
    if (sourceChildren.value && sourceChildren.value.options) {
      const selectedOption = sourceChildren.value.options.find(
        (opt) => opt.value === selectedType.value
      );
      typeChildren.value = selectedOption ? selectedOption.children : null;
  
      // Initialize field values
      if (Array.isArray(typeChildren.value)) {
        typeChildren.value.forEach((field) => {
          if (field.name && !formValues.value[field.name]) {
            formValues.value[field.name] = field.value || "";
          }
        });
      }
    }
  };
  
  const closeModal = () => {
    props.openModal()
  };
  
  const submitForm = () => {
    const formData = {
      group: selectedGroup.value,
      source: selectedSource.value,
      type: selectedType.value,
      ...formValues.value,
    };
    emit("submit", formData);
    closeModal();
  };
  </script>
  
  <style scoped>
  /* Base styles */
  * {
    box-sizing: border-box;
  }
  
  /* Modal overlay */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
    animation: fadeIn 0.3s ease-out;
    overflow-y: auto;
  }
  
  .modal-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 500px;
    margin: 20px;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease-out;
    height: 600px;
  }
  
  /* Modal header */
  .modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    line-height: 1;
  }
  
  .close-btn:hover {
    color: #111827;
  }
  
  /* Modal content */
  .modal-content {
    padding: 20px;
    overflow-y: auto;
    flex-grow: 1;
  }
  
  /* Form styles */
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }
  
  /* Custom select styles */
  .custom-select {
    position: relative;
    width: 100%;
    cursor: pointer;
  }
  
  .selected-option {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    transition: all 0.2s;
  }
  
  .selected-option:hover {
    border-color: #9ca3af;
  }
  
  .dropdown-icon {
    transition: transform 0.2s ease;
  }
  
  .rotate-180 {
    transform: rotate(180deg);
  }
  
  .dropdown-options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: min(200px, 50vh);
    overflow-y: auto;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    margin-top: 4px;
    animation: fadeIn 0.2s ease-out;
  }
  
  .option {
    padding: 10px 12px;
    transition: background-color 0.2s;
  }
  
  .option:hover {
    background-color: #f3f4f6;
  }
  
  .option:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
  
  /* Form fields */
  .fields-group {
    margin-bottom: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px;
    background-color: #f9fafb;
  }
  
  .form-field {
    margin-bottom: 15px;
  }
  
  .form-field:last-child {
    margin-bottom: 0;
  }
  
  .form-field label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }
  
  .form-field input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: border-color 0.2s;
  }
  
  .form-field input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
  
  /* Info message */
  .info-message {
    padding: 12px;
    background-color: #eff6ff;
    border-radius: 6px;
    color: #1e40af;
    font-size: 0.875rem;
    margin-bottom: 20px;
  }
  
  .info-message p {
    margin: 0;
  }
  
  .link {
    color: #1e40af;
    text-decoration: underline;
  }
  
  .link:hover {
    color: #1e3a8a;
  }
  
  /* Modal footer */
  .modal-footer {
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  .cancel-btn {
    padding: 8px 16px;
    background-color: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .cancel-btn:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
  
  .submit-btn {
    padding: 8px 16px;
    background-color: #6366f1;
    border: 1px solid #6366f1;
    border-radius: 6px;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .submit-btn:hover {
    background-color: #4f46e5;
    border-color: #4f46e5;
  }
  
  .submit-btn:disabled {
    background-color: #d1d5db;
    border-color: #d1d5db;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeInDropdown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>
  