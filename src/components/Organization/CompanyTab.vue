<template>
  <div class="company-tab">
    <div class="settings-header">
      <h3 class="settings-title">Данные организации</h3>
      <p class="settings-description">
        Эти данные видит только администратор — используются для
        отображения в интерфейсе и в закрывающих документах.
      </p>
    </div>

    <div class="settings-content">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Название</label>
          <input v-model.trim="form.name" type="text" class="form-input" :disabled="saving" />
        </div>
        <div class="form-group">
          <label class="form-label">Бренд</label>
          <input v-model.trim="form.brand" type="text" class="form-input" :disabled="saving" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">ИНН</label>
          <input v-model.trim="form.inn" type="text" class="form-input" :disabled="saving" />
        </div>
        <div class="form-group">
          <label class="form-label">Организационно-правовая форма</label>
          <input v-model.trim="form.legal_form" type="text" class="form-input" :disabled="saving" placeholder="ООО, ИП..." />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Телефон</label>
          <input v-model.trim="form.phone" type="text" class="form-input" :disabled="saving" />
        </div>
        <div class="form-group">
          <label class="form-label">Локаль</label>
          <input v-model.trim="form.locale" type="text" class="form-input" :disabled="saving" placeholder="ru-RU" />
        </div>
      </div>

      <div class="enabled-row">
        <div class="enabled-text">
          <span class="enabled-title">Организация {{ isEnabled ? "включена" : "выключена" }}</span>
          <span class="enabled-hint">
            При выключении все сотрудники (кроме владельца) теряют доступ к личному кабинету.
          </span>
        </div>
        <label class="switch">
          <input type="checkbox" :checked="isEnabled" :disabled="toggling" @change="handleToggleEnabled" />
          <span class="slider round"></span>
        </label>
      </div>
    </div>

    <div class="action-buttons">
      <button class="btn btn-primary" :disabled="!form.name || saving" @click="handleSave">
        {{ saving ? "Сохраняем..." : "Сохранить" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useCompanyStore } from "@/stores/companyStore";
import { useCompanyApi } from "@/composables/useCompanyApi";
import { useStationLoading } from "@/composables/useStationLoading";

const companyStore = useCompanyStore();
const { updateCompany, toggleCompanyEnabled } = useCompanyApi();
const { setLoadingStatus } = useStationLoading();

const form = reactive({
  name: "",
  brand: "",
  inn: "",
  legal_form: "",
  phone: "",
  locale: "",
});

const saving = ref(false);
const toggling = ref(false);

const isEnabled = computed(() => companyStore.getCompany?.enabled !== false);

const fillFromStore = () => {
  const company = companyStore.getCompany || {};
  form.name = company.name || "";
  form.brand = company.brand || "";
  form.inn = company.inn || "";
  form.legal_form = company.legal_form || "";
  form.phone = company.phone || "";
  form.locale = company.locale || "";
};

const handleSave = async () => {
  if (!form.name) return;
  saving.value = true;
  try {
    await updateCompany({ ...form });
    setLoadingStatus(true, "success", "Данные организации сохранены");
  } catch (error) {
    console.error("Ошибка при сохранении организации:", error);
    setLoadingStatus(
      true,
      "error",
      error.response?.data?.message || "Не удалось сохранить данные организации",
    );
  } finally {
    saving.value = false;
  }
};

const handleToggleEnabled = async (event) => {
  const nextValue = event.target.checked;
  toggling.value = true;
  try {
    await toggleCompanyEnabled(nextValue);
    setLoadingStatus(true, "success", nextValue ? "Организация включена" : "Организация выключена");
  } catch (error) {
    console.error("Ошибка при переключении статуса организации:", error);
    event.target.checked = !nextValue;
    setLoadingStatus(true, "error", "Не удалось изменить статус организации");
  } finally {
    toggling.value = false;
  }
};

watch(() => companyStore.getCompany, fillFromStore, { deep: true });

onMounted(fillFromStore);
</script>

<style scoped>
.company-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.settings-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
}

.settings-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--headerAccountText);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.form-input:disabled {
  background: var(--tableAccountBg);
  cursor: not-allowed;
}

.enabled-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: var(--tableAccountBg);
  border-radius: 0.5rem;
}

.enabled-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.enabled-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.enabled-hint {
  font-size: 0.78rem;
  color: var(--headerAccountText);
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #cbd5e1;
  transition: all 0.3s ease;
  border-radius: 22px;
}

.slider::before {
  content: "";
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: all 0.3s ease;
  border-radius: 50%;
}

input:checked + .slider {
  background: var(--primary);
}

input:checked + .slider::before {
  transform: translateX(18px);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
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

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
