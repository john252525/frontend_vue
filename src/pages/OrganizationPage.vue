<template>
  <div class="organization-page">
    <header class="accounts-onboarding-header">
      <section class="account-section">
        <h2 class="title">Организация</h2>
      </section>
      <section v-if="hasCompany" class="account-section">
        <div class="tab-switcher">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-button', { active: activeTab === tab.id }]"
          >
            {{ tab.label }}
          </button>
        </div>
        <!-- Кнопки-действия конкретных вкладок (например "+ Добавить офис",
             "+ Отправить приглашение") телепортируются сюда из самих
             вкладок — так они физически лежат в шапке рядом с
             переключателем, а логика и состояние остаются в дочернем
             компоненте, которому принадлежат. -->
        <div id="organization-header-actions" class="header-actions"></div>
      </section>
    </header>

    <div class="content-wrapper">
      <div v-if="loading" class="state-loading">
        <div class="spinner"></div>
        Загрузка...
      </div>

      <!-- Компания есть — показываем вкладки -->
      <template v-else-if="hasCompany">
        <div class="tab-content">
          <CompanyTab v-if="activeTab === 'company'" />
          <OfficesTab v-else-if="activeTab === 'offices'" />
          <RolesTab v-else-if="activeTab === 'roles'" />
          <EmployeesTab v-else-if="activeTab === 'employees'" />
        </div>
      </template>

      <!-- Компании нет и создать её может только владелец аккаунта -->
      <div v-else-if="!isOwner" class="upsell-card">
        <p class="upsell-description">
          Компания ещё не подключена. Обратитесь к владельцу аккаунта, чтобы
          настроить корпоративный доступ.
        </p>
      </div>

      <!-- Владелец аккаунта ещё не подключал корпоративный доступ -->
      <div v-else class="upsell-card">
        <div class="upsell-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 21V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14M15 21V11a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10M3 21h18M9 9h.01M9 13h.01M9 17h.01"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="upsell-title">Корпоративный доступ</h2>
        <p class="upsell-description">
          Подключите корпоративный доступ, если в компании несколько
          сотрудников: можно будет распределить роли (менеджер, старший
          менеджер, администратор), закрепить сотрудников за офисами и
          ограничить, что каждому из них видно и доступно.
          Если вы работаете в одиночку — эта настройка не нужна.
        </p>
        <button class="btn btn-primary" :disabled="creating" @click="showCreateForm = true">
          Подключить корпоративный доступ
        </button>

        <div v-if="showCreateForm" class="create-form">
          <div class="form-group">
            <label class="form-label">Название компании</label>
            <input v-model.trim="newCompany.name" type="text" class="form-input" placeholder="ООО «Ромашка»" />
          </div>
          <div class="form-group">
            <label class="form-label">Телефон</label>
            <input v-model.trim="newCompany.phone" type="text" class="form-input" placeholder="+7 900 000-00-00" />
          </div>
          <div class="form-actions">
            <button class="btn btn-secondary" :disabled="creating" @click="showCreateForm = false">
              Отмена
            </button>
            <button
              class="btn btn-primary"
              :disabled="!newCompany.name || creating"
              @click="handleCreateCompany"
            >
              {{ creating ? "Создаём..." : "Создать" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useCompanyStore } from "@/stores/companyStore";
import { useCompanyApi } from "@/composables/useCompanyApi";
import { useStationLoading } from "@/composables/useStationLoading";
import { usePermissions } from "@/composables/usePermissions";
import CompanyTab from "@/components/Organization/CompanyTab.vue";
import OfficesTab from "@/components/Organization/OfficesTab.vue";
import RolesTab from "@/components/Organization/RolesTab.vue";
import EmployeesTab from "@/components/Organization/EmployeesTab.vue";

const companyStore = useCompanyStore();
const { fetchCompany, createCompany, fetchRolesAll } = useCompanyApi();
const { setLoadingStatus } = useStationLoading();
const { isOwner } = usePermissions();

const loading = ref(true);
const showCreateForm = ref(false);
const creating = ref(false);
const newCompany = reactive({ name: "", phone: "" });

const hasCompany = computed(() => companyStore.hasCompany);

const activeTab = ref("company");
const tabs = [
  { id: "company", label: "Организация" },
  { id: "offices", label: "Офисы" },
  { id: "roles", label: "Роли" },
  { id: "employees", label: "Сотрудники" },
];

const handleCreateCompany = async () => {
  if (!newCompany.name) return;
  creating.value = true;
  try {
    await createCompany({ name: newCompany.name, phone: newCompany.phone });
    setLoadingStatus(true, "success", "Компания создана");
    showCreateForm.value = false;
  } catch (error) {
    console.error("Ошибка при создании компании:", error);
    setLoadingStatus(true, "error", error.response?.data?.message || "Не удалось создать компанию");
  } finally {
    creating.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  await fetchCompany();
  // Права нужны сразу всем вкладкам (кнопки "Добавить офис"/"Пригласить
  // сотрудника" гейтятся по ним) — грузим один раз здесь, а не в каждой
  // вкладке отдельно.
  if (companyStore.hasCompany) {
    await fetchRolesAll();
  }
  loading.value = false;
});
</script>

<style scoped>
.organization-page {
  display: flex;
  flex-direction: column;
  min-height: 80vh;
}

.accounts-onboarding-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 12px 18px 18px;
  box-sizing: border-box;
}

.account-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  margin: 0;
}

.content-wrapper {
  padding: 0 18px 24px 18px;
  box-sizing: border-box;
  flex: 1;
}

.state-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--headerAccountText);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--line);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.upsell-card {
  max-width: 520px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
}

.upsell-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(var(--primary-rgb), 0.12);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upsell-title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}

.upsell-description {
  margin: 0 0 1.25rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--headerAccountText);
}

.create-form {
  margin-top: 1.5rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--headerAccountText);
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 2px solid var(--line);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  background: var(--input);
  color: var(--text);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primaryHover);
}

.btn-secondary {
  background-color: var(--tableAccountBg);
  color: var(--text);
  border: 1px solid var(--line);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--line);
}

.tab-switcher {
  display: flex;
  gap: 4px;
  width: fit-content;
  background: var(--bg);
  box-sizing: border-box;
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--line);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions:empty {
  display: none;
}

.tab-button {
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--headerAccountText);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button:hover {
  background: var(--tableAccountBg);
  color: var(--text);
}

.tab-button.active {
  background: var(--primary);
  color: white;
}

@media (max-width: 1100px) {
  .accounts-onboarding-header {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
