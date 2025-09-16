<template>
  <div class="accounts-page">
    <div class="page-header">
      <h1>Управление аккаунтами</h1>
      <div class="header-actions">
        <button 
          @click="fetchAccounts" 
          :disabled="loading"
          class="refresh-btn"
        >
          <span v-if="!loading">Обновить</span>
          <span v-else>Загрузка...</span>
        </button>
        <div class="stats">
          <span>Всего: {{ allAccounts.length }}</span>
          <span>Активных: {{ filteredAccounts.length }}</span>
        </div>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Источник:</label>
        <select v-model="filters.source">
          <option value="">Все</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="telegram">Telegram</option>
          <option value="crm">CRM</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Тип:</label>
        <select v-model="filters.type">
          <option value="">Все</option>
          <option value="undefined">Undefined</option>
          <option value="bulk">Bulk</option>
          <option value="amocrm">AmoCRM</option>
          <option value="bitrix24">Bitrix24</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Статус:</label>
        <select v-model="filters.status">
          <option value="active">Только активные (шаг 5)</option>
          <option value="all">Все аккаунты</option>
        </select>
      </div>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка данных аккаунтов...</p>
    </div>

    <!-- Состояние ошибки -->
    <div v-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Произошла ошибка</h3>
      <p>{{ error }}</p>
      <button @click="fetchAccounts" class="retry-btn">Повторить попытку</button>
    </div>

    <!-- Контент когда данные загружены -->
    <div v-if="!loading && !error">
      <!-- Сообщение если нет аккаунтов -->
      <div v-if="displayedAccounts.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Аккаунты не найдены</h3>
        <p>Нет аккаунтов, соответствующих выбранным фильтрам</p>
        <button @click="resetFilters" class="reset-filters-btn">Сбросить фильтры</button>
      </div>

      <!-- Список аккаунтов -->
      <div v-else class="accounts-grid">
        <div 
          v-for="account in displayedAccounts" 
          :key="account.uuid || account.id" 
          class="account-card"
          :class="{'account-active': account.step?.value === 5}"
        >
          <div class="account-header">
            <h3>{{ account.name || account.login }}</h3>
            <span class="account-badge" :class="getSourceClass(account.source)">
              {{ account.source }}
            </span>
          </div>

          <div class="account-body">
            <div class="account-info">
              <div class="info-row">
                <span class="label">Логин:</span>
                <span class="value">{{ account.login }}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Тип:</span>
                <span class="value">{{ account.type }}</span>
              </div>
              
              <div class="info-row" v-if="account.connectedPhone">
                <span class="label">Телефон:</span>
                <span class="value">{{ account.connectedPhone }}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Хранилище:</span>
                <span class="value">{{ account.storage || 'local' }}</span>
              </div>
              
              <div class="info-row" v-if="account.subscription_dt_to">
                <span class="label">Подписка до:</span>
                <span class="value">{{ formatDate(account.subscription_dt_to) }}</span>
              </div>
            </div>

            <div class="account-status">
              <div class="status-indicator" :class="getStatusClass(account.step?.value)">
                <span class="status-dot"></span>
                <span class="status-text">
                  {{ account.step?.message || 'Статус неизвестен' }}
                </span>
              </div>
              
              <div v-if="account.webhookUrl || account.webhookUrls?.length" class="webhook-info">
                <span class="label">Webhook:</span>
                <span class="value">
                  {{ account.webhookUrl || account.webhookUrls[0] }}
                </span>
              </div>
            </div>
          </div>

          <div class="account-actions">
            <button class="btn-primary">Управление</button>
            <button class="btn-secondary">Подробнее</button>
          </div>
        </div>
      </div>

      <!-- Пагинация -->
      <div v-if="displayedAccounts.length > 0" class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="currentPage--"
          class="pagination-btn"
        >
          Назад
        </button>
        
        <span class="page-info">
          Страница {{ currentPage }} из {{ totalPages }}
        </span>
        
        <button 
          :disabled="currentPage === totalPages" 
          @click="currentPage++"
          class="pagination-btn"
        >
          Вперед
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountsPage',
  data() {
    return {
      loading: false,
      error: null,
      allAccounts: [],
      accountsInfo: [],
      currentPage: 1,
      itemsPerPage: 9,
      filters: {
        source: '',
        type: '',
        status: 'active'
      }
    }
  },
  computed: {
    // Аккаунты с шагом 5
    filteredAccounts() {
      return this.accountsInfo.filter(account => account.step?.value === 5)
    },
    
    // Аккаунты с учетом фильтров
    filteredByFilters() {
      let accounts = this.filters.status === 'active' ? this.filteredAccounts : this.accountsInfo
      
      return accounts.filter(account => {
        const matchesSource = !this.filters.source || account.source === this.filters.source
        const matchesType = !this.filters.type || account.type === this.filters.type
        return matchesSource && matchesType
      })
    },
    
    // Аккаунты для отображения с пагинацией
    displayedAccounts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredByFilters.slice(start, end)
    },
    
    totalPages() {
      return Math.ceil(this.filteredByFilters.length / this.itemsPerPage)
    }
  },
  mounted() {
    this.fetchAccounts()
  },
  watch: {
    filters: {
      handler() {
        this.currentPage = 1
      },
      deep: true
    }
  },
  methods: {
    async fetchAccounts() {
      this.loading = true
      this.error = null
      
      try {
        // Первый запрос - получение списка аккаунтов
        const response = await this.$axios.post('/api/v1/instances/getInfoByToken', {
          group: ["messenger", "crm", "bulk"],
          source: ["telegram", "whatsapp", "crm"],
          type: ["amocrm", "bitrix24", "bulk"]
        })
        
        if (response.data.ok) {
          this.allAccounts = response.data.data.instances
          // Получаем дополнительную информацию для каждого аккаунта
          await this.fetchAccountsInfo()
        } else {
          throw new Error(response.data.message || 'Ошибка получения аккаунтов')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Произошла ошибка при загрузке данных'
        console.error('Ошибка при получении аккаунтов:', error)
      } finally {
        this.loading = false
      }
    },
    
    async fetchAccountsInfo() {
      this.accountsInfo = []
      
      // Создаем массив промисов для параллельного выполнения запросов
      const promises = this.allAccounts.map(async (account) => {
        try {
          const payload = {
            source: account.source,
            login: account.login,
            type: account.type,
            storage: account.storage || 'local'
          }
          
          const response = await this.$axios.post('/api/v1/instances/getInfo', payload)
          
          return {
            ...account,
            ...response.data
          }
        } catch (error) {
          console.error(`Ошибка при получении информации для аккаунта ${account.login}:`, error)
          return {
            ...account,
            step: { value: null, message: 'Ошибка загрузки' },
            connectedPhone: null,
            webhookUrl: '',
            webhookUrls: []
          }
        }
      })
      
      // Ждем завершения всех запросов
      this.accountsInfo = await Promise.all(promises)
    },
    
    getSourceClass(source) {
      return `source-${source}`
    },
    
    getStatusClass(stepValue) {
      if (stepValue === 5) return 'status-success'
      if (stepValue === null || stepValue === undefined) return 'status-error'
      return 'status-warning'
    },
    
    formatDate(dateString) {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleDateString('ru-RU')
    },
    
    resetFilters() {
      this.filters = {
        source: '',
        type: '',
        status: 'active'
      }
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
.accounts-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.refresh-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.stats {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #666;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 500;
  font-size: 14px;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 40px 20px;
  background: #ffe6e6;
  border: 1px solid #ffcccc;
  border-radius: 8px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.retry-btn {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.reset-filters-btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.account-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.account-active {
  border-left: 4px solid #28a745;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.account-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.account-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.source-whatsapp { background: #25d366; }
.source-telegram { background: #0088cc; }
.source-crm { background: #6f42c1; }

.account-body {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
  text-align: right;
}

.account-status {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-success .status-dot { background: #28a745; }
.status-warning .status-dot { background: #ffc107; }
.status-error .status-dot { background: #dc3545; }

.status-text {
  font-size: 14px;
  font-weight: 500;
}

.webhook-info {
  font-size: 12px;
  color: #666;
}

.account-actions {
  display: flex;
  gap: 10px;
}

.btn-primary, .btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
}
</style>