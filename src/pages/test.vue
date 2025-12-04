<template>
  <div class="tester-container">
    <div class="tester-wrapper">
      <h1 class="tester-title">API Vendor Groups Tester</h1>
      <p class="tester-subtitle">
        Полный тест всех методов API с визуализацией запросов и ответов
      </p>

      <!-- Token Info -->
      <div class="token-info">
        <p class="token-text">
          <span class="token-label">Bearer Token:</span>
          {{
            token.value
              ? token.value.substring(0, 40) + "..."
              : "Токен не найден"
          }}
        </p>
      </div>

      <!-- Global Loading & Error -->
      <div v-if="globalError" class="global-error">❌ {{ globalError }}</div>

      <!-- 1. GET /api/v1/groups -->
      <div class="api-section api-section-blue">
        <div class="section-header">
          <div>
            <h2 class="section-title">1. GET /api/v1/groups</h2>
            <p class="section-description">Получение всех групп с вендорами</p>
          </div>
          <span class="method-badge method-badge-blue">GET</span>
        </div>

        <div class="code-block">
          <div>curl -X GET "https://bapi88.developtech.ru/api/v1/groups" \</div>
          <div class="code-indent">
            -H "Authorization: Bearer {{ token.value?.substring(0, 20) }}..."
          </div>
        </div>

        <button
          @click="executeGetGroups"
          :disabled="isLoading.getGroups"
          class="execute-button execute-button-blue"
        >
          {{ isLoading.getGroups ? "⏳ Загрузка..." : "► Выполнить запрос" }}
        </button>

        <!-- Response -->
        <div v-if="responses.getGroups" class="response-container">
          <div v-if="responses.getGroups.ok" class="response-success">
            <p class="response-title">✅ Успешный ответ (200 OK)</p>
            <div class="response-content">
              <div
                v-for="(group, index) in Object.values(
                  responses.getGroups.data.vendor_groups
                )"
                :key="index"
                class="group-item"
              >
                <div class="group-name">📦 {{ group.name }}</div>
                <div class="group-details">
                  <div>
                    UUID: <span class="code-text">{{ group.uuid }}</span>
                  </div>
                  <div>
                    Тип: <span class="code-text">{{ group.type }}</span>
                  </div>
                  <div>
                    ID: <span class="code-text">{{ group.id }}</span>
                  </div>
                  <div
                    v-if="Object.keys(group.vendors).length > 0"
                    class="vendors-section"
                  >
                    <div class="vendors-title">
                      Вендоры ({{ Object.keys(group.vendors).length }}):
                    </div>
                    <div
                      v-for="vendor in Object.values(group.vendors)"
                      :key="vendor.uuid"
                      class="vendor-item"
                    >
                      {{ vendor.login }}
                      <span class="vendor-source">({{ vendor.source }})</span>
                    </div>
                  </div>
                  <div v-else class="no-vendors">Нет вендоров</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. POST /api/v1/groups/add -->
      <div class="api-section api-section-green">
        <div class="section-header">
          <div>
            <h2 class="section-title">2. POST /api/v1/groups/add</h2>
            <p class="section-description">Добавление новой группы</p>
          </div>
          <span class="method-badge method-badge-green">POST</span>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Имя группы</label>
            <input
              v-model="addGroupForm.name"
              type="text"
              placeholder="Например: WhatsApp Group"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Тип</label>
            <select v-model="addGroupForm.type" class="form-input">
              <option value="cascade">cascade</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Порядок отправки (через запятую)</label>
          <input
            v-model="addGroupForm.cascade"
            type="text"
            placeholder="Например: telegram,whatsapp,max"
            class="form-input"
          />
        </div>

        <div class="code-block">
          <div>POST https://bapi88.developtech.ru/api/v1/groups/add</div>
          <div class="code-label">Body:</div>
          <pre class="code-pre">{{
            JSON.stringify(buildAddGroupPayload(), null, 2)
          }}</pre>
        </div>

        <button
          @click="executeAddGroup"
          :disabled="isLoading.addGroup || !addGroupForm.name"
          class="execute-button execute-button-green"
        >
          {{ isLoading.addGroup ? "⏳ Создание..." : "► Создать группу" }}
        </button>

        <div v-if="responses.addGroup" class="response-container">
          <div v-if="responses.addGroup.ok" class="response-success">
            <p class="response-title">✅ Группа создана (200 OK)</p>
            <pre class="response-json">{{
              JSON.stringify(responses.addGroup, null, 2)
            }}</pre>
          </div>
          <div v-else class="response-error">
            <p class="response-title">❌ Ошибка</p>
            <pre class="response-json">{{
              JSON.stringify(responses.addGroup, null, 2)
            }}</pre>
          </div>
        </div>
      </div>

      <!-- 3. POST /api/v1/groups/update -->
      <div class="api-section api-section-orange">
        <div class="section-header">
          <div>
            <h2 class="section-title">3. POST /api/v1/groups/update</h2>
            <p class="section-description">Обновление существующей группы</p>
          </div>
          <span class="method-badge method-badge-orange">POST</span>
        </div>

        <div class="form-stack">
          <div class="form-group">
            <label class="form-label">Выберите группу</label>
            <select v-model="updateGroupForm.uuid" class="form-input">
              <option value="">-- Выберите группу --</option>
              <option
                v-for="group in Object.values(allGroups)"
                :key="group.uuid"
                :value="group.uuid"
              >
                {{ group.name }} ({{ group.uuid }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Новое имя (опционально)</label>
            <input
              v-model="updateGroupForm.name"
              type="text"
              placeholder="Новое имя группы"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label"
              >Новый порядок отправки (опционально)</label
            >
            <input
              v-model="updateGroupForm.cascade"
              type="text"
              placeholder="Например: telegram,whatsapp"
              class="form-input"
            />
          </div>
        </div>

        <div class="code-block">
          <div>POST https://bapi88.developtech.ru/api/v1/groups/update</div>
          <div class="code-label">Body:</div>
          <pre class="code-pre">{{
            JSON.stringify(buildUpdateGroupPayload(), null, 2)
          }}</pre>
        </div>

        <button
          @click="executeUpdateGroup"
          :disabled="isLoading.updateGroup || !updateGroupForm.uuid"
          class="execute-button execute-button-orange"
        >
          {{ isLoading.updateGroup ? "⏳ Обновление..." : "► Обновить группу" }}
        </button>

        <div v-if="responses.updateGroup" class="response-container">
          <div v-if="responses.updateGroup.ok" class="response-success">
            <p class="response-title">✅ Группа обновлена (200 OK)</p>
            <pre class="response-json">{{
              JSON.stringify(responses.updateGroup, null, 2)
            }}</pre>
          </div>
          <div v-else class="response-error">
            <p class="response-title">❌ Ошибка</p>
            <pre class="response-json">{{
              JSON.stringify(responses.updateGroup, null, 2)
            }}</pre>
          </div>
        </div>
      </div>

      <!-- 4. POST /api/v1/groups/addVendor -->
      <div class="api-section api-section-purple">
        <div class="section-header">
          <div>
            <h2 class="section-title">4. POST /api/v1/groups/addVendor</h2>
            <p class="section-description">Добавление вендора в группу</p>
          </div>
          <span class="method-badge method-badge-purple">POST</span>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Группа</label>
            <select v-model="addVendorForm.groupUuid" class="form-input">
              <option value="">-- Выберите группу --</option>
              <option
                v-for="group in Object.values(allGroups)"
                :key="group.uuid"
                :value="group.uuid"
              >
                {{ group.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">UUID вендора</label>
            <input
              v-model="addVendorForm.vendorUuid"
              type="text"
              placeholder="Введите UUID вендора"
              class="form-input"
            />
          </div>
        </div>

        <div class="code-block">
          <div>POST https://bapi88.developtech.ru/api/v1/groups/addVendor</div>
          <div class="code-label">Body:</div>
          <pre class="code-pre">{{
            JSON.stringify(buildAddVendorPayload(), null, 2)
          }}</pre>
        </div>

        <button
          @click="executeAddVendor"
          :disabled="
            isLoading.addVendor ||
            !addVendorForm.groupUuid ||
            !addVendorForm.vendorUuid
          "
          class="execute-button execute-button-purple"
        >
          {{ isLoading.addVendor ? "⏳ Добавление..." : "► Добавить вендора" }}
        </button>

        <div v-if="responses.addVendor" class="response-container">
          <div v-if="responses.addVendor.ok" class="response-success">
            <p class="response-title">✅ Вендор добавлен (200 OK)</p>
            <pre class="response-json">{{
              JSON.stringify(responses.addVendor, null, 2)
            }}</pre>
          </div>
          <div v-else class="response-error">
            <p class="response-title">❌ Ошибка</p>
            <pre class="response-json">{{
              JSON.stringify(responses.addVendor, null, 2)
            }}</pre>
          </div>
        </div>
      </div>

      <!-- 5. POST /api/v1/groups/deleteVendor -->
      <div class="api-section api-section-red">
        <div class="section-header">
          <div>
            <h2 class="section-title">5. POST /api/v1/groups/deleteVendor</h2>
            <p class="section-description">Удаление вендора из группы</p>
          </div>
          <span class="method-badge method-badge-red">POST</span>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Группа</label>
            <select v-model="deleteVendorForm.groupUuid" class="form-input">
              <option value="">-- Выберите группу --</option>
              <option
                v-for="group in Object.values(allGroups)"
                :key="group.uuid"
                :value="group.uuid"
              >
                {{ group.name }} ({{
                  Object.keys(group.vendors).length
                }}
                вендоров)
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Вендор</label>
            <select v-model="deleteVendorForm.vendorUuid" class="form-input">
              <option value="">-- Выберите вендора --</option>
              <option
                v-for="vendor in Object.values(
                  getGroupVendors(deleteVendorForm.groupUuid)
                )"
                :key="vendor.uuid"
                :value="vendor.uuid"
              >
                {{ vendor.login }} ({{ vendor.source }})
              </option>
            </select>
          </div>
        </div>

        <div class="code-block">
          <div>
            POST https://bapi88.developtech.ru/api/v1/groups/deleteVendor
          </div>
          <div class="code-label">Body:</div>
          <pre class="code-pre">{{
            JSON.stringify(buildDeleteVendorPayload(), null, 2)
          }}</pre>
        </div>

        <button
          @click="executeDeleteVendor"
          :disabled="
            isLoading.deleteVendor ||
            !deleteVendorForm.groupUuid ||
            !deleteVendorForm.vendorUuid
          "
          class="execute-button execute-button-red"
        >
          {{ isLoading.deleteVendor ? "⏳ Удаление..." : "► Удалить вендора" }}
        </button>

        <div v-if="responses.deleteVendor" class="response-container">
          <div v-if="responses.deleteVendor.ok" class="response-success">
            <p class="response-title">✅ Вендор удален (200 OK)</p>
            <pre class="response-json">{{
              JSON.stringify(responses.deleteVendor, null, 2)
            }}</pre>
          </div>
          <div v-else class="response-error">
            <p class="response-title">❌ Ошибка</p>
            <pre class="response-json">{{
              JSON.stringify(responses.deleteVendor, null, 2)
            }}</pre>
          </div>
        </div>
      </div>

      <!-- 6. POST /api/v1/groups/delete -->
      <div class="api-section api-section-rose">
        <div class="section-header">
          <div>
            <h2 class="section-title">6. POST /api/v1/groups/delete</h2>
            <p class="section-description">Удаление группы</p>
          </div>
          <span class="method-badge method-badge-rose">POST</span>
        </div>

        <div class="form-group">
          <label class="form-label">Выберите группу для удаления</label>
          <select v-model="deleteGroupForm.uuid" class="form-input">
            <option value="">-- Выберите группу --</option>
            <option
              v-for="group in Object.values(allGroups)"
              :key="group.uuid"
              :value="group.uuid"
            >
              {{ group.name }} ({{ group.uuid }})
            </option>
          </select>
        </div>

        <div class="code-block">
          <div>POST https://bapi88.developtech.ru/api/v1/groups/delete</div>
          <div class="code-label">Body:</div>
          <pre class="code-pre">{{
            JSON.stringify(buildDeleteGroupPayload(), null, 2)
          }}</pre>
        </div>

        <button
          @click="executeDeleteGroup"
          :disabled="isLoading.deleteGroup || !deleteGroupForm.uuid"
          class="execute-button execute-button-rose"
        >
          {{ isLoading.deleteGroup ? "⏳ Удаление..." : "► Удалить группу" }}
        </button>

        <div v-if="responses.deleteGroup" class="response-container">
          <div v-if="responses.deleteGroup.ok" class="response-success">
            <p class="response-title">✅ Группа удалена (200 OK)</p>
            <pre class="response-json">{{
              JSON.stringify(responses.deleteGroup, null, 2)
            }}</pre>
          </div>
          <div v-else class="response-error">
            <p class="response-title">❌ Ошибка</p>
            <pre class="response-json">{{
              JSON.stringify(responses.deleteGroup, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAccountStore } from "@/stores/accountStore";
import axios from "axios";

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const API_BASE_URL = "https://bapi88.developtech.ru";

// State
const allGroups = ref({});
const globalError = ref("");

const isLoading = ref({
  getGroups: false,
  addGroup: false,
  updateGroup: false,
  addVendor: false,
  deleteVendor: false,
  deleteGroup: false,
});

const responses = ref({
  getGroups: null,
  addGroup: null,
  updateGroup: null,
  addVendor: null,
  deleteVendor: null,
  deleteGroup: null,
});

// Forms
const addGroupForm = ref({
  name: "",
  type: "cascade",
  cascade: "",
});

const updateGroupForm = ref({
  uuid: "",
  name: "",
  cascade: "",
});

const addVendorForm = ref({
  groupUuid: "",
  vendorUuid: "",
});

const deleteVendorForm = ref({
  groupUuid: "",
  vendorUuid: "",
});

const deleteGroupForm = ref({
  uuid: "",
});

// Helpers
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`;
    }
    return config;
  });

  return instance;
};

const handleError = (err: any) => {
  console.error("API Error:", err);
  globalError.value = err.response?.data?.message || err.message;
  setTimeout(() => {
    globalError.value = "";
  }, 5000);
};

// API Methods
const executeGetGroups = async () => {
  isLoading.value.getGroups = true;
  try {
    const axiosInstance = createAxiosInstance();
    const res = await axiosInstance.get("/api/v1/groups");
    responses.value.getGroups = res.data;
    allGroups.value = res.data.data.vendor_groups;
  } catch (err) {
    handleError(err);
  } finally {
    isLoading.value.getGroups = false;
  }
};

const buildAddGroupPayload = () => {
  return {
    type: addGroupForm.value.type,
    name: addGroupForm.value.name || undefined,
    settings: {
      cascade: addGroupForm.value.cascade
        ? addGroupForm.value.cascade.split(",").map((s) => s.trim())
        : [],
    },
  };
};

const executeAddGroup = async () => {
  isLoading.value.addGroup = true;
  try {
    const axiosInstance = createAxiosInstance();
    const payload = buildAddGroupPayload();
    const res = await axiosInstance.post("/api/v1/groups/add", payload);
    responses.value.addGroup = res.data;

    // Refresh groups list
    await executeGetGroups();

    // Reset form
    addGroupForm.value = { name: "", type: "cascade", cascade: "" };
  } catch (err) {
    handleError(err);
  } finally {
    isLoading.value.addGroup = false;
  }
};

const buildUpdateGroupPayload = () => {
  const payload: any = {
    uuid: updateGroupForm.value.uuid,
  };

  if (updateGroupForm.value.name) {
    payload.name = updateGroupForm.value.name;
  }

  if (updateGroupForm.value.cascade) {
    payload.settings = {
      cascade: updateGroupForm.value.cascade.split(",").map((s) => s.trim()),
    };
  }

  return payload;
};

const executeUpdateGroup = async () => {
  isLoading.value.updateGroup = true;
  try {
    const axiosInstance = createAxiosInstance();
    const payload = buildUpdateGroupPayload();
    const res = await axiosInstance.post("/api/v1/groups/update", payload);
    responses.value.updateGroup = res.data;

    // Refresh groups list
    await executeGetGroups();

    // Reset form
    updateGroupForm.value = { uuid: "", name: "", cascade: "" };
  } catch (err) {
    handleError(err);
  } finally {
    isLoading.value.updateGroup = false;
  }
};

const buildAddVendorPayload = () => {
  return {
    group_uuid: addVendorForm.value.groupUuid,
    vendor_uuid: addVendorForm.value.vendorUuid,
  };
};

const executeAddVendor = async () => {
  isLoading.value.addVendor = true;
  try {
    const axiosInstance = createAxiosInstance();
    const payload = buildAddVendorPayload();
    const res = await axiosInstance.post("/api/v1/groups/addVendor", payload);
    responses.value.addVendor = res.data;

    // Refresh groups list
    await executeGetGroups();

    // Reset form
    addVendorForm.value = { groupUuid: "", vendorUuid: "" };
  } catch (err) {
    handleError(err);
  } finally {
    isLoading.value.addVendor = false;
  }
};

const buildDeleteVendorPayload = () => {
  return {
    group_uuid: deleteVendorForm.value.groupUuid,
    vendor_uuid: deleteVendorForm.value.vendorUuid,
  };
};

const executeDeleteVendor = async () => {
  isLoading.value.deleteVendor = true;
  try {
    const axiosInstance = createAxiosInstance();
    const payload = buildDeleteVendorPayload();
    const res = await axiosInstance.post(
      "/api/v1/groups/deleteVendor",
      payload
    );
    responses.value.deleteVendor = res.data;

    // Refresh groups list
    await executeGetGroups();

    // Reset form
    deleteVendorForm.value = { groupUuid: "", vendorUuid: "" };
  } catch (err) {
    handleError(err);
  } finally {
    isLoading.value.deleteVendor = false;
  }
};

const buildDeleteGroupPayload = () => {
  return {
    uuid: deleteGroupForm.value.uuid,
  };
};

const executeDeleteGroup = async () => {
  if (!confirm("⚠️ Вы уверены? Удаление группы необратимо")) {
    return;
  }

  isLoading.value.deleteGroup = true;
  try {
    const axiosInstance = createAxiosInstance();
    const payload = buildDeleteGroupPayload();
    const res = await axiosInstance.post("/api/v1/groups/delete", payload);
    responses.value.deleteGroup = res.data;

    // Refresh groups list
    await executeGetGroups();

    // Reset form
    deleteGroupForm.value = { uuid: "" };
  } catch (err) {
    handleError(err);
  } finally {
    isLoading.value.deleteGroup = false;
  }
};

const getGroupVendors = (groupUuid: string) => {
  if (!groupUuid) return {};
  return allGroups.value[groupUuid]?.vendors || {};
};

// Initialize
onMounted(() => {
  executeGetGroups();
});
</script>

<style scoped>
/* Container */
.tester-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 32px;
}

.tester-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

.tester-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #111827;
}

.tester-subtitle {
  color: #4b5563;
  margin-bottom: 32px;
}

/* Token Info */
.token-info {
  background-color: #eff6ff;
  border: 1px solid #93c5fd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 32px;
}

.token-text {
  font-size: 14px;
  color: #1e40af;
}

.token-label {
  font-weight: 600;
}

/* Global Error */
.global-error {
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 24px;
}

/* API Sections */
.api-section {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
}

.api-section-blue {
  border-left-color: #3b82f6;
}

.api-section-green {
  border-left-color: #10b981;
}

.api-section-orange {
  border-left-color: #f97316;
}

.api-section-purple {
  border-left-color: #a855f7;
}

.api-section-red {
  border-left-color: #ef4444;
}

.api-section-rose {
  border-left-color: #e11d48;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.section-description {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* Method Badge */
.method-badge {
  padding: 8px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

.method-badge-blue {
  background-color: #dbeafe;
  color: #1e40af;
}

.method-badge-green {
  background-color: #dcfce7;
  color: #166534;
}

.method-badge-orange {
  background-color: #fed7aa;
  color: #92400e;
}

.method-badge-purple {
  background-color: #e9d5ff;
  color: #6b21a8;
}

.method-badge-red {
  background-color: #fee2e2;
  color: #991b1b;
}

.method-badge-rose {
  background-color: #ffe4e6;
  color: #be123c;
}

/* Code Block */
.code-block {
  background-color: #1f2937;
  color: #d1d5db;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  font-family: "Monaco", "Courier New", monospace;
  font-size: 13px;
  overflow-x: auto;
}

.code-indent {
  margin-left: 16px;
}

.code-label {
  color: #9ca3af;
  margin-top: 8px;
  font-size: 12px;
}

.code-pre {
  margin: 8px 0 0 0;
  font-size: 12px;
  overflow-x: auto;
}

.code-text {
  font-family: "Monaco", "Courier New", monospace;
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}

/* Forms */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  ring: 2px;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Buttons */
.execute-button {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.execute-button-blue {
  background-color: #3b82f6;
  color: white;
}

.execute-button-blue:hover:not(:disabled) {
  background-color: #2563eb;
}

.execute-button-green {
  background-color: #10b981;
  color: white;
}

.execute-button-green:hover:not(:disabled) {
  background-color: #059669;
}

.execute-button-orange {
  background-color: #f97316;
  color: white;
}

.execute-button-orange:hover:not(:disabled) {
  background-color: #ea580c;
}

.execute-button-purple {
  background-color: #a855f7;
  color: white;
}

.execute-button-purple:hover:not(:disabled) {
  background-color: #9333ea;
}

.execute-button-red {
  background-color: #ef4444;
  color: white;
}

.execute-button-red:hover:not(:disabled) {
  background-color: #dc2626;
}

.execute-button-rose {
  background-color: #e11d48;
  color: white;
}

.execute-button-rose:hover:not(:disabled) {
  background-color: #be123c;
}

.execute-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Response Container */
.response-container {
  margin-top: 16px;
}

.response-success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 16px;
}

.response-error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 16px;
}

.response-title {
  font-weight: 600;
  color: #15803d;
  margin-bottom: 12px;
  font-size: 14px;
}

.response-error .response-title {
  color: #991b1b;
}

.response-json {
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  font-family: "Monaco", "Courier New", monospace;
  overflow-x: auto;
  margin: 0;
}

/* Groups Display */
.response-content {
  background-color: white;
  border: 1px solid #bbf7d0;
  border-radius: 4px;
  max-height: 600px;
  overflow-y: auto;
}

.group-item {
  padding: 12px;
  border-bottom: 1px solid #dcfce7;
  font-size: 14px;
}

.group-item:last-child {
  border-bottom: none;
}

.group-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.group-details {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.vendors-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.vendors-title {
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.vendor-item {
  background-color: #f9fafb;
  padding: 6px 8px;
  border-radius: 3px;
  margin-top: 4px;
  font-size: 12px;
}

.vendor-source {
  color: #3b82f6;
}

.no-vendors {
  color: #9ca3af;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .tester-container {
    padding: 16px;
  }

  .tester-title {
    font-size: 28px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
