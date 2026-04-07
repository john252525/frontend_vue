<template>
  <div class="notif-wrap" ref="wrapRef">
    <!-- Колокольчик -->
    <button class="bell-btn" @click="toggleDropdown" :class="{ active: open }">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <!-- Дропдаун -->
    <div v-if="open" class="notif-dropdown">
      <div class="notif-header">
        <span class="notif-title">Уведомления</span>
        <span v-if="unreadCount > 0" class="notif-count">{{ unreadCount }} новых</span>
      </div>

      <div v-if="loading" class="notif-state">Загрузка...</div>
      <div v-else-if="error" class="notif-state notif-error">{{ error }}</div>
      <div v-else-if="unreadNotifications.length === 0" class="notif-state">
        Нет непрочитанных уведомлений
      </div>

      <ul v-else class="notif-list">
        <li
          v-for="item in unreadNotifications"
          :key="item.id"
          class="notif-item"
          @click="handleNotifClick(item)"
        >
          <div class="notif-dot"></div>
          <div class="notif-body">
            <div class="notif-item-title">
              {{ item.entity?.title || typeLabel(item.type) }}
            </div>
            <div v-if="item.entity?.description" class="notif-item-desc">
              {{ item.entity.description }}
            </div>
            <div class="notif-item-date">{{ formatDate(item.dt_ins) }}</div>
          </div>
        </li>
      </ul>

      <div v-if="unreadNotifications.length > 0" class="notif-footer">
        <button class="read-all-btn" @click="markAllRead" :disabled="markingAll">
          {{ markingAll ? 'Отмечаю...' : 'Отметить все как прочитанные' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useNotifications } from "@/composables/useNotifications";

const { unreadNotifications, unreadCount, loading, error, fetchUnread, markAsRead } = useNotifications();

const open = ref(false);
const markingAll = ref(false);
const wrapRef = ref(null);

const toggleDropdown = async () => {
  open.value = !open.value;
  if (open.value) {
    await fetchUnread({ full: true });
  }
};

const handleNotifClick = async (item) => {
  await markAsRead(item.id);
};

const markAllRead = async () => {
  markingAll.value = true;
  const ids = [...unreadNotifications.value.map((n) => n.id)];
  for (const id of ids) {
    await markAsRead(id);
  }
  markingAll.value = false;
};

const typeLabel = (type) => {
  const labels = { article: "Новая статья", message: "Сообщение" };
  return labels[type] ?? "Уведомление";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Закрыть при клике вне
const onClickOutside = (e) => {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) {
    open.value = false;
  }
};

onMounted(async () => {
  document.addEventListener("click", onClickOutside);
  // Загружаем счётчик при монтировании
  await fetchUnread();
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<style scoped>
.notif-wrap {
  position: relative;
  flex-shrink: 0;
}

.bell-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}

.bell-btn:hover,
.bell-btn.active {
  background: rgba(64, 71, 202, 0.08);
  color: oklch(0.541 0.198 267);
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
}

.notif-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 340px;
  background: var(--bg, #fff);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 200;
  overflow: hidden;
  animation: fadeDown 0.15s ease-out;
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #f3f4f6;
}

.notif-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
}

.notif-count {
  font-size: 0.8rem;
  color: oklch(0.541 0.198 267);
  font-weight: 600;
  background: rgba(84, 92, 200, 0.1);
  padding: 2px 8px;
  border-radius: 999px;
}

.notif-state {
  padding: 2rem 1rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
}

.notif-error {
  color: #ef4444;
}

.notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 320px;
  overflow-y: auto;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f9fafb;
}

.notif-item:hover {
  background: #f9fafb;
}

.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: oklch(0.541 0.198 267);
  margin-top: 5px;
  flex-shrink: 0;
}

.notif-body {
  flex: 1;
  min-width: 0;
}

.notif-item-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-item-desc {
  font-size: 0.82rem;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-item-date {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 4px;
}

.notif-footer {
  padding: 10px 16px;
  border-top: 1px solid #f3f4f6;
}

.read-all-btn {
  width: 100%;
  background: none;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.82rem;
  padding: 7px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.read-all-btn:hover:not(:disabled) {
  border-color: oklch(0.541 0.198 267);
  color: oklch(0.541 0.198 267);
}

.read-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 400px) {
  .notif-dropdown {
    width: calc(100vw - 24px);
    right: -50px;
  }
}
</style>
