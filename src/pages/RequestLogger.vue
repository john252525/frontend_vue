<template>
  <div class="request-logger-container">
    <!-- Фильтры и управление -->
    <div class="controls-panel">
      <div class="filters">
        <input
          v-model="searchQuery"
          placeholder="Поиск по URL..."
          class="search-input"
        />
        <select v-model="methodFilter" class="method-select">
          <option value="">Все методы</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
        <select v-model="statusFilter" class="status-select">
          <option value="">Все статусы</option>
          <option value="success">Успешные (2xx)</option>
          <option value="error">Ошибки (4xx,5xx)</option>
          <option value="redirect">Редиректы (3xx)</option>
        </select>
      </div>

      <div class="stats-and-actions">
        <div class="compact-stats">
          <div class="stat-item">
            <span class="stat-value">{{ filteredRequests.length }}</span>
            <span class="stat-label">Всего</span>
          </div>
          <div class="stat-item success">
            <span class="stat-value">{{ successCount }}</span>
            <span class="stat-label">Успех</span>
          </div>
          <div class="stat-item error">
            <span class="stat-value">{{ errorCount }}</span>
            <span class="stat-label">Ошибки</span>
          </div>
          <div class="stat-item average">
            <span class="stat-value">{{ averageDuration }}ms</span>
            <span class="stat-label">Среднее</span>
          </div>
        </div>

        <div class="actions">
          <button
            @click="toggleRecording"
            :class="{ active: isRecording }"
            class="record-btn"
          >
            <span class="icon">{{ isRecording ? "⏸️" : "▶️" }}</span>
            {{ isRecording ? "Пауза" : "Запись" }}
          </button>
          <button @click="clearLogs" class="clear-btn">
            <span class="icon">🗑️</span>
            Очистить
          </button>
          <button @click="exportLogs" class="export-btn">
            <span class="icon">📤</span>
            Экспорт
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица запросов -->
    <div class="requests-table">
      <table>
        <thead>
          <tr>
            <th>Метод</th>
            <th>URL</th>
            <th>Статус</th>
            <th>Время</th>
            <th>Длит.</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="req in paginatedRequests"
            :key="req.id"
            :class="getStatusClass(req)"
            @click="showDetails(req)"
          >
            <td>
              <span class="method-badge" :class="req.method.toLowerCase()">
                {{ req.method }}
              </span>
            </td>
            <td class="url-cell">
              <div class="url-content">
                {{ truncateUrl(req.url) }}
                <span
                  v-if="req.requestBody"
                  class="has-body-indicator"
                  title="Есть тело запроса"
                  >📦</span
                >
              </div>
            </td>
            <td>
              <span class="status-badge" :class="getStatusClass(req)">
                {{ req.status }} {{ req.statusText }}
              </span>
            </td>
            <td class="time-cell">
              {{ formatTime(req.timestamp) }}
            </td>
            <td class="duration-cell">
              <span :class="getDurationClass(req.duration)">
                {{ req.duration }}ms
              </span>
            </td>
            <td class="actions-cell">
              <button
                @click.stop="copyRequest(req)"
                class="icon-btn"
                title="Копировать запрос"
              >
                📋
              </button>
              <button
                @click.stop="resendRequest(req)"
                class="icon-btn"
                title="Повторить запрос"
              >
                🔄
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Пагинация -->
      <div class="pagination">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ◀
        </button>

        <span
          v-for="page in pages"
          :key="page"
          @click="goToPage(page)"
          :class="{ active: page === currentPage }"
          class="page-number"
        >
          {{ page }}
        </span>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          ▶
        </button>

        <span class="page-info">
          Страница {{ currentPage }} из {{ totalPages }}
        </span>
      </div>
    </div>

    <!-- Модальное окно с деталями -->
    <div
      v-if="selectedRequest"
      class="modal-overlay"
      @click.self="selectedRequest = null"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h3>Детали запроса</h3>
          <button @click="selectedRequest = null" class="close-btn">×</button>
        </div>

        <div class="modal-body">
          <div class="tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="{ active: activeTab === tab.id }"
              class="tab-btn"
            >
              {{ tab.label }}
            </button>
            <button
              @click="activeTab = 'hl'"
              :class="{ active: activeTab === 'hl' }"
              class="tab-btn"
            >
              HL
            </button>
          </div>

          <div class="tab-content">
            <!-- Общая информация -->
            <div v-if="activeTab === 'overview'" class="overview-tab">
              <div class="info-row">
                <span class="info-label">Метод:</span>
                <span
                  class="method-badge"
                  :class="selectedRequest.method.toLowerCase()"
                >
                  {{ selectedRequest.method }}
                </span>
              </div>

              <div class="info-row">
                <span class="info-label">URL:</span>
                <span class="info-value url-value">{{
                  selectedRequest.url
                }}</span>
                <button
                  @click="copyToClipboard(selectedRequest.url)"
                  class="copy-btn"
                >
                  Копировать
                </button>
              </div>

              <div class="info-row">
                <span class="info-label">Статус:</span>
                <span
                  class="status-badge"
                  :class="getStatusClass(selectedRequest)"
                >
                  {{ selectedRequest.status }} {{ selectedRequest.statusText }}
                </span>
              </div>

              <div class="info-row">
                <span class="info-label">Время:</span>
                <span class="info-value">{{
                  formatDateTime(selectedRequest.timestamp)
                }}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Длительность:</span>
                <span class="info-value">{{ selectedRequest.duration }}ms</span>
              </div>
            </div>

            <!-- Заголовки запроса -->
            <div v-if="activeTab === 'requestHeaders'" class="headers-tab">
              <h4>Заголовки запроса</h4>
              <div class="json-viewer">
                <pre>{{ formatHeaders(selectedRequest.requestHeaders) }}</pre>
              </div>
              <button
                @click="
                  copyToClipboard(formatHeaders(selectedRequest.requestHeaders))
                "
                class="copy-btn"
              >
                Копировать заголовки
              </button>
            </div>

            <!-- Тело запроса -->
            <div
              v-if="activeTab === 'requestBody' && selectedRequest.requestBody"
              class="body-tab"
            >
              <h4>Тело запроса</h4>
              <div class="json-viewer">
                <pre>{{ formatJson(selectedRequest.requestBody) }}</pre>
              </div>
              <button
                @click="
                  copyToClipboard(formatJson(selectedRequest.requestBody))
                "
                class="copy-btn"
              >
                Копировать тело
              </button>
            </div>

            <!-- Заголовки ответа -->
            <div v-if="activeTab === 'responseHeaders'" class="headers-tab">
              <h4>Заголовки ответа</h4>
              <div class="json-viewer">
                <pre>{{ formatHeaders(selectedRequest.responseHeaders) }}</pre>
              </div>
              <button
                @click="
                  copyToClipboard(
                    formatHeaders(selectedRequest.responseHeaders)
                  )
                "
                class="copy-btn"
              >
                Копировать заголовки
              </button>
            </div>

            <!-- Тело ответа -->
            <div
              v-if="
                activeTab === 'responseBody' && selectedRequest.responseBody
              "
              class="body-tab"
            >
              <h4>Тело ответа</h4>
              <div class="json-viewer">
                <pre>{{ formatJson(selectedRequest.responseBody) }}</pre>
              </div>
              <button
                @click="
                  copyToClipboard(formatJson(selectedRequest.responseBody))
                "
                class="copy-btn"
              >
                Копировать тело
              </button>
            </div>

            <!-- Вкладка HL -->
            <div v-if="activeTab === 'hl'" class="hl-tab">
              <h4>Форматированный запрос</h4>
              <div class="hl-content">
                <div class="hl-method-url">
                  {{ selectedRequest.method }}
                  {{ extractDomain(selectedRequest.url) }}
                </div>

                <div v-if="selectedRequest.requestBody" class="hl-body">
                  <pre>{{ formatJson(selectedRequest.requestBody) }}</pre>
                </div>

                <div v-if="hasAuthHeader(selectedRequest)" class="hl-auth">
                  header: Authorization: {{ getAuthHeader(selectedRequest) }}
                </div>
              </div>
              <button @click="copyHlRequest(selectedRequest)" class="copy-btn">
                Копировать HL
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="copyFullRequest(selectedRequest)" class="action-btn">
            Копировать весь запрос
          </button>
          <button
            @click="resendRequest(selectedRequest)"
            class="action-btn primary"
          >
            Повторить запрос
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRequestsStore } from "@/stores/requests";
import { mapState, mapActions, mapGetters } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export default {
  setup() {
    const selectedRequest = ref(null);
    const activeTab = ref("overview");
    const searchQuery = ref("");
    const methodFilter = ref("");
    const statusFilter = ref("");
    const currentPage = ref(1);
    const itemsPerPage = 6;

    return {
      selectedRequest,
      activeTab,
      searchQuery,
      methodFilter,
      statusFilter,
      currentPage,
      itemsPerPage,
    };
  },

  computed: {
    ...mapState(useRequestsStore, ["requests", "isRecording"]),
    ...mapGetters(useRequestsStore, ["getSuccessCount", "getErrorCount"]),

    tabs() {
      return [
        { id: "overview", label: "Обзор" },
        { id: "requestHeaders", label: "Заголовки запроса" },
        { id: "requestBody", label: "Тело запроса" },
        { id: "responseHeaders", label: "Заголовки ответа" },
        { id: "responseBody", label: "Тело ответа" },
        { id: "hl", label: "HL" },
      ].filter((tab) => {
        if (tab.id === "requestBody") return this.selectedRequest?.requestBody;
        if (tab.id === "responseBody")
          return this.selectedRequest?.responseBody;
        return true;
      });
    },

    filteredRequests() {
      return this.requests
        .filter((req) => {
          const matchesSearch = req.url
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());

          const matchesMethod =
            !this.methodFilter || req.method === this.methodFilter;

          let matchesStatus = true;
          if (this.statusFilter === "success") {
            matchesStatus = req.status >= 200 && req.status < 300;
          } else if (this.statusFilter === "error") {
            matchesStatus = req.status >= 400;
          } else if (this.statusFilter === "redirect") {
            matchesStatus = req.status >= 300 && req.status < 400;
          }

          return matchesSearch && matchesMethod && matchesStatus;
        })
        .reverse();
    },

    successCount() {
      return this.filteredRequests.filter(
        (req) => req.status >= 200 && req.status < 300
      ).length;
    },

    errorCount() {
      return this.filteredRequests.filter((req) => req.status >= 400).length;
    },

    averageDuration() {
      if (this.filteredRequests.length === 0) return 0;
      const total = this.filteredRequests.reduce(
        (sum, req) => sum + req.duration,
        0
      );
      return Math.round(total / this.filteredRequests.length);
    },

    totalPages() {
      return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
    },

    pages() {
      const pages = [];
      const maxVisiblePages = 5;

      if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(
          this.totalPages,
          startPage + maxVisiblePages - 1
        );

        if (endPage - startPage + 1 < maxVisiblePages) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
          pages.push(1);
          if (startPage > 2) pages.push("...");
        }

        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }

        if (endPage < this.totalPages) {
          if (endPage < this.totalPages - 1) pages.push("...");
          pages.push(this.totalPages);
        }
      }

      return pages;
    },

    paginatedRequests() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredRequests.slice(start, end);
    },
  },

  methods: {
    ...mapActions(useRequestsStore, ["clearRequests", "toggleRecording"]),

    showDetails(req) {
      this.selectedRequest = req;
      this.activeTab = "overview";
    },

    getStatusClass(req) {
      if (req.status >= 200 && req.status < 300) return "success";
      if (req.status >= 400) return "error";
      if (req.status >= 300 && req.status < 400) return "redirect";
      return "";
    },

    hasAuthHeader(request) {
      return !!this.getAuthHeader(request);
    },

    getAuthHeader(request) {
      return (
        request.requestHeaders?.Authorization ||
        request.requestHeaders?.authorization
      );
    },

    extractDomain(url) {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname + urlObj.pathname;
      } catch {
        return url;
      }
    },

    copyHlRequest(req) {
      let hlText = `${req.method} ${this.extractDomain(req.url)}\n`;

      if (req.requestBody) {
        hlText += this.formatJson(req.requestBody) + "\n";
      }

      const authHeader = this.getAuthHeader(req);
      if (authHeader) {
        hlText += `header: Authorization: ${authHeader}`;
      }

      this.copyToClipboard(hlText);
      this.showToast("HL формат скопирован");
    },

    getDurationClass(duration) {
      if (duration > 1000) return "slow";
      if (duration > 500) return "medium";
      return "fast";
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    },

    formatDateTime(timestamp) {
      return new Date(timestamp).toLocaleString();
    },

    truncateUrl(url, maxLength = 60) {
      if (url.length <= maxLength) return url;
      return url.substring(0, maxLength) + "...";
    },

    formatHeaders(headers) {
      if (!headers) return "Нет данных";
      if (typeof headers === "string") return headers;
      return JSON.stringify(headers, null, 2);
    },

    formatJson(data) {
      if (!data) return "Нет данных";
      if (typeof data === "string") {
        try {
          return JSON.stringify(JSON.parse(data), null, 2);
        } catch {
          return data;
        }
      }
      return JSON.stringify(data, null, 2);
    },

    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast("Скопировано в буфер обмена");
      });
    },

    copyRequest(req) {
      const requestData = {
        method: req.method,
        url: req.url,
        headers: req.requestHeaders,
        body: req.requestBody,
      };
      this.copyToClipboard(JSON.stringify(requestData, null, 2));
      this.showToast("Запрос скопирован");
    },

    copyFullRequest(req) {
      const fullRequest = {
        request: {
          method: req.method,
          url: req.url,
          headers: req.requestHeaders,
          body: req.requestBody,
        },
        response: {
          status: req.status,
          statusText: req.statusText,
          headers: req.responseHeaders,
          body: req.responseBody,
        },
        duration: req.duration,
        timestamp: req.timestamp,
      };
      this.copyToClipboard(JSON.stringify(fullRequest, null, 2));
      this.showToast("Полный запрос скопирован");
    },

    async resendRequest(req) {
      try {
        const config = {
          method: req.method,
          url: req.url,
          headers: req.requestHeaders,
        };

        if (req.requestBody) {
          config.data = req.requestBody;
        }

        const response = await axios(config);
        this.showToast("Запрос успешно повторен");
        return response;
      } catch (error) {
        this.showToast("Ошибка при повторении запроса: " + error.message);
        throw error;
      }
    },

    exportLogs() {
      const data = JSON.stringify(this.filteredRequests, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `requests_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    goToPage(page) {
      if (page !== "...") {
        this.currentPage = page;
      }
    },

    showToast(message) {
      console.log("Toast:", message);
      alert(message);
    },
  },

  watch: {
    filteredRequests() {
      this.currentPage = 1;
    },
  },
};
</script>

<style scoped>
/* Основные стили контейнера */
.request-logger-container {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  background-color: #f5f7fa;
}

/* Панель управления с интегрированной статистикой */
.controls-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  min-width: 250px;
  flex-grow: 1;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #2196f3;
  outline: none;
}

.method-select,
.status-select {
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.method-select:hover,
.status-select:hover {
  border-color: #bdbdbd;
}

.method-select:focus,
.status-select:focus {
  border-color: #2196f3;
  outline: none;
}

/* Блок статистики и действий */
.stats-and-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.compact-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  min-width: 70px;
  transition: transform 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-weight: 700;
  font-size: 17px;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-item.success {
  background-color: #e8f5e9;
}

.stat-item.success .stat-value {
  color: #2e7d32;
}

.stat-item.error {
  background-color: #ffebee;
}

.stat-item.error .stat-value {
  color: #c62828;
}

.stat-item.average {
  background-color: #fff8e1;
}

.stat-item.average .stat-value {
  color: #f57f17;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.record-btn,
.clear-btn,
.export-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
}

.record-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.record-btn.active {
  background-color: #bbdefb;
}

.clear-btn {
  background-color: #ffebee;
  color: #d32f2f;
}

.export-btn {
  background-color: #e8f5e9;
  color: #388e3c;
}

.record-btn:hover,
.clear-btn:hover,
.export-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 16px;
}

/* Таблица запросов */
.requests-table {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #f8f9fa;
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

tr:hover {
  background-color: #f8f9fa;
}

.method-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
}

.get {
  background-color: #e3f2fd;
  color: #1976d2;
}

.post {
  background-color: #e8f5e9;
  color: #388e3c;
}

.put {
  background-color: #fff8e1;
  color: #ffa000;
}

.delete {
  background-color: #ffebee;
  color: #d32f2f;
}

.patch {
  background-color: #f3e5f5;
  color: #8e24aa;
}

.url-cell {
  max-width: 300px;
}

.url-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.has-body-indicator {
  font-size: 12px;
  opacity: 0.7;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.error {
  background-color: #ffebee;
  color: #c62828;
}

.redirect {
  background-color: #fff8e1;
  color: #f57f17;
}

.time-cell {
  white-space: nowrap;
}

.duration-cell .fast {
  color: #4caf50;
}

.duration-cell .medium {
  color: #ff9800;
}

.duration-cell .slow {
  color: #f44336;
}

.actions-cell {
  white-space: nowrap;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 6px;
  margin: 0 2px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.icon-btn:hover {
  opacity: 1;
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  gap: 6px;
}

.page-btn {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background-color: #f1f1f1;
}

.page-number {
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 14px;
}

.page-number:hover {
  background-color: #f1f1f1;
}

.page-number.active {
  background-color: #2196f3;
  color: white;
}

.page-info {
  margin-left: 16px;
  font-size: 14px;
  color: #666;
}

/* Модальное окно */
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
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0 10px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #2196f3;
  border-bottom-color: #2196f3;
}

.tab-content {
  padding: 12px 0;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-label {
  font-weight: 500;
  min-width: 120px;
  color: #666;
}

.info-value {
  flex: 1;
}

.url-value {
  word-break: break-all;
  margin-right: 12px;
}

.copy-btn {
  background-color: #f5f5f5;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background-color: #e0e0e0;
}

.json-viewer {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
}

pre {
  margin: 0;
  font-family: "Consolas", monospace;
  white-space: pre-wrap;
  line-height: 1.5;
}

/* Стили для вкладки HL */
.hl-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hl-content {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #eee;
  font-family: "Consolas", monospace;
}

.hl-method-url {
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 8px;
  word-break: break-all;
}

.hl-body {
  background-color: #fff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  margin-bottom: 12px;
}

.hl-auth {
  color: #6d4c41;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.action-btn {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.action-btn:hover {
  background-color: #f5f5f5;
}

.action-btn.primary {
  background-color: #2196f3;
  color: white;
  border-color: #2196f3;
}

.action-btn.primary:hover {
  background-color: #0d8bf2;
}

/* Адаптивность */
@media (max-width: 768px) {
  .controls-panel {
    padding: 16px;
  }

  .filters {
    flex-direction: column;
    gap: 10px;
  }

  .search-input,
  .method-select,
  .status-select {
    width: 100%;
  }

  .stats-and-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .compact-stats {
    justify-content: space-between;
  }

  .actions {
    justify-content: center;
  }

  th,
  td {
    padding: 10px 12px;
    font-size: 14px;
  }

  .modal-content {
    width: 95%;
  }

  .tabs {
    overflow-x: auto;
    white-space: nowrap;
    flex-wrap: nowrap;
  }
}

@media (max-width: 480px) {
  .stat-item {
    padding: 8px 10px;
    min-width: 60px;
  }

  .stat-value {
    font-size: 15px;
  }

  .stat-label {
    font-size: 11px;
  }

  .record-btn,
  .clear-btn,
  .export-btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .page-number {
    padding: 4px 8px;
    font-size: 13px;
  }

  .page-info {
    font-size: 13px;
    margin-left: 12px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
