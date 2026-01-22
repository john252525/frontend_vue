<template>
  <div class="modal-overlay">
    <div @click="close" class="black-fon"></div>

    <div class="modal-card">
      <header class="modal-header">
        <h2 class="modal-title">Настройки блокировок</h2>
        <button @click="close" class="close-x">&times;</button>
      </header>

      <div class="form-section">
        <div class="form-group">
          <label class="input-label">Имя (для блокировки)</label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="Введите имя"
            class="custom-input"
          />
        </div>

        <div class="form-group">
          <label class="input-label">Номер телефона</label>
          <input
            v-model="formData.phone"
            type="text"
            placeholder="79000000000"
            class="custom-input"
          />
        </div>

        <div class="button-row">
          <button
            @click="handleAction('block')"
            :disabled="loading"
            class="btn-action btn-primary"
          >
            {{ loading ? "..." : "Заблокировать" }}
          </button>
          <button
            @click="handleAction('unblock')"
            :disabled="loading"
            class="btn-action btn-secondary"
          >
            Разблокировать
          </button>
        </div>
      </div>

      <div class="list-section">
        <h3 class="list-title">Заблокированные пользователи</h3>
        <div v-if="listLoading" class="status-info">Загрузка...</div>
        <div v-else-if="blockedUsers.length === 0" class="empty-text">
          Список пуст
        </div>
        <div v-else class="scroll-area">
          <div v-for="user in blockedUsers" :key="user.id" class="user-item">
            <div class="user-info">
              <span class="name">{{ user.name }}</span>
              <span class="phone">{{ user.phone || user.thread }}</span>
            </div>
            <button
              @click="quickUnblock(user.phone)"
              class="btn-remove"
              title="Разблокировать"
            >
              &times;
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="statusMessage"
        :class="['status-msg', isError ? 'error' : 'success']"
      >
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  close: { type: Function },
  item: { type: Object },
});

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const FRONTEND_URL = import.meta.env.VITE_BASE_URL;

const loading = ref(false);
const listLoading = ref(false);
const statusMessage = ref("");
const isError = ref(false);
const blockedUsers = ref([]);

const formData = ref({
  name: "",
  phone: "",
});

// Общие заголовки с Bearer токеном
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token.value}`,
});

const fetchBlockedList = async () => {
  listLoading.value = true;
  try {
    const response = await fetch(
      `${FRONTEND_URL}/uon-account/getBlockedMessengerUsers`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          uuid: props.item?.uuid,
          user_id: props.item?.user_id,
          brand_slug: props.item?.brand_slug || "whatsapi",
        }),
      },
    );
    const result = await response.json();
    if (result.ok) blockedUsers.value = result.data;
  } catch (e) {
    console.error("Ошибка загрузки списка:", e);
  } finally {
    listLoading.value = false;
  }
};

const handleAction = async (type) => {
  if (!formData.value.phone) {
    showStatus("Укажите номер телефона", true);
    return;
  }

  loading.value = true;
  const endpoint =
    type === "block"
      ? "/uon-account/blockMessengerUser"
      : "/uon-account/unblockMessengerUser";

  try {
    const payload = {
      uuid: props.item?.uuid,
      user_id: props.item?.user_id,
      brand_slug: props.item?.brand_slug || "whatsapi",
      phone: formData.value.phone,
    };

    if (type === "block") {
      payload.name = formData.value.name || "Без имени";
    }

    const response = await fetch(`${FRONTEND_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (result.ok) {
      showStatus(
        type === "block" ? "Пользователь заблокирован" : "Разблокирован",
        false,
      );
      formData.value.phone = "";
      formData.value.name = "";
      fetchBlockedList();
    } else {
      showStatus(result.message || "Ошибка", true);
    }
  } catch (e) {
    showStatus("Ошибка сети", true);
  } finally {
    loading.value = false;
  }
};

const quickUnblock = (phone) => {
  formData.value.phone = phone;
  handleAction("unblock");
};

const showStatus = (msg, error) => {
  statusMessage.value = msg;
  isError.value = error;
  setTimeout(() => (statusMessage.value = ""), 3000);
};

onMounted(fetchBlockedList);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.black-fon {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45); /* Только прозрачность, без блюра */
}

.modal-card {
  position: relative;
  background: white;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  z-index: 10001;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
}

.close-x {
  background: none;
  border: none;
  font-size: 24px;
  color: #aaa;
  cursor: pointer;
}

.custom-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.button-row {
  display: flex;
  gap: 10px;
}

.btn-action {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #5356d3;
  color: white;
}
.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.list-section {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.scroll-area {
  max-height: 180px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 5px;
}

.name {
  font-weight: 600;
  font-size: 13px;
  display: block;
}
.phone {
  font-size: 12px;
  color: #888;
}

.btn-remove {
  background: none;
  border: none;
  color: #ff4d4f;
  font-size: 20px;
  cursor: pointer;
}

.status-msg {
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
}
.success {
  background: #e6fffa;
  color: #0694a2;
}
.error {
  background: #fff5f5;
  color: #e53e3e;
}
</style>
