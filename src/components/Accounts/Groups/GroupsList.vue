<template>
  <section class="groups-list-section">
    <!-- Header с кнопками -->
    <div class="groups-header">
      <h3 class="groups-title">Группы</h3>

      <button @click="openCreateGroupModal" class="create-group-button">
        <svg class="icon" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          ></path>
        </svg>
        Создать группу
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">❌ {{ error }}</div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка групп...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="allGroupsList.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-5-9h10v2H7z"
        />
      </svg>
      <p class="empty-title">Нет групп</p>
      <p class="empty-description">Создайте первую группу для начала</p>
      <button @click="openCreateGroupModal" class="empty-action-button">
        Создать группу
      </button>
    </div>

    <!-- Groups Grid -->
    <div v-else class="groups-grid">
      <div v-for="group in allGroupsList" :key="group.uuid" class="group-card">
        <div class="group-header-card">
          <div class="group-info">
            <h4 class="group-name">{{ group.name }}</h4>
          </div>
          <div class="group-actions">
            <button
              @click="openEditGroupModal(group)"
              class="action-button edit-button"
              title="Редактировать"
            >
              <svg viewBox="0 0 20 20">
                <path
                  d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                ></path>
              </svg>
            </button>
            <button
              @click="openDeleteGroupModal(group)"
              class="action-button delete-button"
              v-show="group.is_default != '1'"
              title="Удалить"
            >
              <svg viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Vendors List -->
        <div class="vendors-list">
          <div
            v-for="vendor in Object.values(group.vendors)"
            :key="vendor.uuid"
            class="vendor-item"
          >
            <div class="vendor-badge" :class="`vendor-${vendor.source}`">
              {{ vendor.source.toUpperCase() }}
            </div>
            <div class="vendor-info">
              <p v-if="vendor.name" class="vendor-login">{{ vendor.name }}</p>
              <p v-else class="vendor-login">{{ vendor.login }}</p>
            </div>
            <button
              @click="openRemoveVendorModal(group, vendor)"
              class="remove-vendor-button"
              title="Удалить аккаунт"
            >
              <svg viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>

          <!-- Add Vendor Button (если слот не полный) -->
          <button
            v-if="Object.keys(group.vendors).length < 3"
            @click="openAddVendorModal(group)"
            class="add-vendor-button"
          >
            <svg viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Добавить аккаунт
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CreateGroupModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="onGroupCreated"
    />

    <EditGroupModal
      v-if="showEditModal && selectedGroup"
      :group="selectedGroup"
      @close="showEditModal = false"
      @updated="onGroupUpdated"
    />

    <DeleteGroupModal
      v-if="showDeleteModal && selectedGroup"
      :group="selectedGroup"
      @close="showDeleteModal = false"
      @deleted="onGroupDeleted"
    />

    <AddVendorModal
      v-if="showAddVendorModal && selectedGroup"
      :group="selectedGroup"
      :accountListRef="{ getAllAccounts: () => availableAccounts }"
      @close="showAddVendorModal = false"
      @added="onVendorAdded"
    />

    <RemoveVendorModal
      v-if="showRemoveVendorModal && selectedGroup && selectedVendor"
      :group="selectedGroup"
      :vendor="selectedVendor"
      @close="showRemoveVendorModal = false"
      @removed="onVendorRemoved"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useVendorGroups } from "@/composables/useVendorGroups";
import { useAccountStore } from "@/stores/accountStore";
import CreateGroupModal from "@/components/Accounts/Accounts/ModalAccount/CreateGroupModal.vue";
import EditGroupModal from "@/components/Accounts/Accounts/ModalAccount/EditGroupModal.vue";
import DeleteGroupModal from "@/components/Accounts/Accounts/ModalAccount/DeleteGroupModal.vue";
import AddVendorModal from "@/components/Accounts/Accounts/ModalAccount/AddVendorModal.vue";
import RemoveVendorModal from "@/components/Accounts/Accounts/ModalAccount/RemoveVendorModal.vue";

const props = defineProps({
  getAccounts: Function,
});

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const { allGroupsList, loading, error, getGroups } = useVendorGroups(token);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showAddVendorModal = ref(false);
const showRemoveVendorModal = ref(false);

const selectedGroup = ref(null);
const selectedVendor = ref(null);
const availableAccounts = ref([]);

const filteredAccounts = computed(() => {
  return availableAccounts.value.filter((account) =>
    ["whatsapp", "telegram"].includes(account.source || account.type)
  );
});

const openCreateGroupModal = () => {
  showCreateModal.value = true;
};

const openEditGroupModal = (group) => {
  selectedGroup.value = group;
  showEditModal.value = true;
};

const openDeleteGroupModal = (group) => {
  selectedGroup.value = group;
  showDeleteModal.value = true;
};

const openAddVendorModal = (group) => {
  selectedGroup.value = group;
  showAddVendorModal.value = true;
};

const openRemoveVendorModal = (group, vendor) => {
  selectedGroup.value = group;
  selectedVendor.value = vendor;
  showRemoveVendorModal.value = true;
};

const onGroupCreated = async () => {
  showCreateModal.value = false;
  await getGroups();
};

const onGroupUpdated = async () => {
  showEditModal.value = false;
  selectedGroup.value = null;
  await getGroups();
};

const onGroupDeleted = async () => {
  showDeleteModal.value = false;
  selectedGroup.value = null;
  await getGroups();
};

const onVendorAdded = async () => {
  showAddVendorModal.value = false;
  selectedGroup.value = null;
  await getGroups();
};

const onVendorRemoved = async () => {
  showRemoveVendorModal.value = false;
  selectedGroup.value = null;
  selectedVendor.value = null;
  await getGroups();
};

onMounted(async () => {
  console.log("📋 GroupsList: монтирование");
  await getGroups();

  if (props.getAccounts && typeof props.getAccounts === "function") {
    console.log("🔍 GroupsList: загружаем аккаунты");
    try {
      const accounts = await props.getAccounts();
      console.log("✅ GroupsList: получены аккаунты:", accounts);
      availableAccounts.value = accounts || [];
    } catch (err) {
      console.error("❌ GroupsList: ошибка загрузки аккаунтов:", err);
    }
  } else {
    console.warn("⚠️ GroupsList: getAccounts не передана или не функция");
  }
});
</script>

<style scoped>
.groups-list-section {
  padding: 20px;
}

.groups-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.groups-title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  margin: 0;
}

.create-group-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: oklch(0.541 0.198 267);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s;
}

.create-group-button:hover {
  background: #565cc8;
}

.create-group-button:active {
  background: #3e43ae;
}

.icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 24px;
  font-size: 14px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid oklch(0.541 0.198 267);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: var(--text);
  margin: 0;
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: var(--background);
  border-radius: 8px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  fill: #d1d5db;
  margin-bottom: 16px;
}

.empty-title {
  font-weight: 600;
  font-size: 18px;
  color: var(--text);
  margin: 0 0 8px 0;
}

.empty-description {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.empty-action-button {
  padding: 8px 16px;
  background: oklch(0.541 0.198 267);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s;
}

.empty-action-button:hover {
  background: #565cc8;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.group-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.25s;
}

.group-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.group-header-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.group-info {
  flex: 1;
}

.group-name {
  font-weight: 600;
  font-size: 16px;
  color: var(--text);
  margin: 0 0 4px 0;
}

.group-type {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s;
}

.action-button svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.edit-button {
  color: #3b82f6;
}

.edit-button:hover {
  background: #dbeafe;
}

.delete-button {
  color: #ef4444;
}

.delete-button:hover {
  background: #fee2e2;
}

.vendors-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vendor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  transition: all 0.25s;
}

.vendor-item:hover {
  background: #f3f4f6;
}

.vendor-badge {
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.vendor-whatsapp {
  background: #dcfce7;
  color: #166534;
}

.vendor-telegram {
  background: #dbeafe;
  color: #1e40af;
}

.vendor-info {
  flex: 1;
  min-width: 0;
}

.vendor-login {
  font-weight: 500;
  font-size: 13px;
  color: var(--text);
  margin: 0 0 2px 0;
  word-break: break-all;
}

.vendor-id {
  font-size: 11px;
  color: #6b7280;
  margin: 0;
}

.remove-vendor-button {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.25s;
}

.remove-vendor-button:hover {
  background: #fca5a5;
}

.remove-vendor-button svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.add-vendor-button {
  width: 100%;
  padding: 12px;
  border: 2px dashed #d1d5db;
  background: transparent;
  color: #6b7280;
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.25s;
}

.add-vendor-button:hover {
  border-color: oklch(0.541 0.198 267);
  color: oklch(0.541 0.198 267);
  background: rgba(85, 102, 200, 0.02);
}

.add-vendor-button svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

@media (max-width: 768px) {
  .groups-grid {
    grid-template-columns: 1fr;
  }

  .groups-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .create-group-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
