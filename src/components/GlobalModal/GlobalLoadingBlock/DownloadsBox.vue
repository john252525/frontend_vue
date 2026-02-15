<template>
  <div
    class="downloads-container"
    :class="{ 'container-expanded': isDownloadsVisible }"
  >
    <div v-if="hasAnyDownloads" class="downloads-icon" @click="toggleDownloads">
      <svg
        v-if="hasActiveDownloads"
        class="loading-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        ></path>
      </svg>
      <svg
        v-else
        class="default-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        ></path>
      </svg>

      <span v-if="activeDownloadsCount > 0" class="downloads-badge">
        {{ activeDownloadsCount }}
      </span>

      <span v-if="hasActiveDownloads" class="pulse-animation"></span>
    </div>

    <!-- Развернутый блок с загрузками -->
    <div v-if="isDownloadsVisible" class="downloads-content">
      <div class="downloads-header">
        <h3 class="downloads-title">Загрузки</h3>
        <button class="close-button" @click="toggleDownloads">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="downloads-list">
        <div
          v-for="download in downloads"
          :key="download.id"
          class="download-item"
        >
          <div class="download-info">
            <span class="download-name">{{ download.name }}</span>
            <!-- Статус и прогресс справа -->
            <div class="download-status-right">
              <span
                v-if="
                  download.status === 'loading' &&
                  download.progress !== undefined
                "
                class="download-progress"
              >
                {{ download.progress }}%
              </span>
              <span v-else class="status-icon">
                <svg
                  v-if="download.status === 'success'"
                  class="status-success"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <svg
                  v-else-if="download.status === 'error'"
                  class="status-error"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </span>
            </div>
          </div>

          <div class="download-status">
            <svg
              v-if="download.status === 'loading'"
              class="status-loading"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 2v4"></path>
              <path d="M12 18v4"></path>
              <path d="M4.93 4.93l2.83 2.83"></path>
              <path d="M16.24 16.24l2.83 2.83"></path>
              <path d="M2 12h4"></path>
              <path d="M18 12h4"></path>
              <path d="M4.93 19.07l2.83-2.83"></path>
              <path d="M16.24 7.76l2.83-2.83"></path>
            </svg>

            <div v-if="download.status === 'loading'" class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: download.progress + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div v-if="downloads.length === 0" class="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            ></path>
          </svg>
          <p>Нет активных загрузок</p>
        </div>
      </div>

      <div class="downloads-actions">
        <button
          v-if="hasCompletedDownloads"
          class="action-button clear-button"
          @click="clearCompleted"
        >
          Очистить завершенные
        </button>
        <button
          v-if="downloads.length > 0"
          class="action-button clear-all-button"
          @click="clearAll"
        >
          Очистить все
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDownloads } from "@/composables/useDownloads";
import { computed } from "vue";

const {
  downloads,
  isDownloadsVisible,
  clearCompleted,
  clearAll,
  toggleDownloads,
} = useDownloads();

// Вычисляемые свойства
const hasActiveDownloads = computed(() => {
  return downloads.value.some((download) => download.status === "loading");
});

const hasAnyDownloads = computed(() => {
  return downloads.value.length > 0;
});

const activeDownloadsCount = computed(() => {
  return downloads.value.filter((download) => download.status === "loading")
    .length;
});

const hasCompletedDownloads = computed(() => {
  return downloads.value.some(
    (download) => download.status === "success" || download.status === "error",
  );
});
</script>

<style scoped>
.downloads-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1001;
  transition: all 0.3s ease;
}

.downloads-icon {
  position: relative;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
  animation: bounce-in 0.6s ease;
}

.downloads-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(59, 130, 246, 0.4);
}

.downloads-icon .loading-icon {
  color: white;
  animation: spin 1.5s linear infinite;
}

.downloads-icon .default-icon {
  color: white;
}

.downloads-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 600;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

.pulse-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  animation: pulse 2s infinite;
  z-index: -1;
}

.downloads-content {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  animation: slide-up 0.3s ease;
}

.downloads-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.downloads-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.downloads-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0 20px;
}

.download-item {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.download-item:last-child {
  border-bottom: none;
}

.download-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.download-name {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-status-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.download-progress {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.status-icon {
  display: flex;
  align-items: center;
}

.status-loading {
  color: #3b82f6;
  animation: spin 1s linear infinite;
}

.status-success {
  color: #10b981;
}

.status-error {
  color: #ef4444;
}

.download-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-state svg {
  margin-bottom: 12px;
  color: #d1d5db;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.downloads-actions {
  padding: 16px 20px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

.action-button {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-button {
  background: #f3f4f6;
  color: #374151;
}

.clear-button:hover {
  background: #e5e7eb;
}

.clear-all-button {
  background: #fee2e2;
  color: #dc2626;
}

.clear-all-button:hover {
  background: #fecaca;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .downloads-container {
    bottom: 10px;
    right: 10px;
  }

  .downloads-content {
    width: 280px;
    right: -10px;
  }

  .downloads-icon {
    width: 44px;
    height: 44px;
  }

  .downloads-icon svg {
    width: 20px;
    height: 20px;
  }
}

.downloads-container {
  animation: fade-in 0.5s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
