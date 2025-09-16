<template>
  <div class="simple-accounts-container">
    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading">
      <p>Загрузка аккаунтов...</p>
    </div>

    <!-- Состояние ошибки -->
    <div v-if="error" class="error">
      <p>Ошибка: {{ error }}</p>
      <button @click="fetchAccounts">Повторить</button>
    </div>

    <!-- Список аккаунтов -->
    <div v-if="!loading && !error">
      <div v-if="filteredAccounts.length === 0" class="no-accounts">
        <p>Нет аккаунтов с шагом 5</p>
      </div>

      <div v-else class="accounts-grid">
        <div 
          v-for="account in filteredAccounts" 
          :key="account.uuid || account.id" 
          class="account-card"
        >
          <div class="account-info">
            <h3 class="account-name">{{ account.name || account.login }}</h3>
            <p class="account-source">{{ account.source }}</p>
          </div>

          <div class="account-actions">
            <button 
              @click="openChat(account)" 
              class="chat-button"
            >
              Чат
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const loading = ref(false)
const error = ref(null)
const accounts = ref([])

// Фильтруем только аккаунты с шагом 5
const filteredAccounts = ref([])

onMounted(() => {
  fetchAccounts()
})

async function fetchAccounts() {
  loading.value = true
  error.value = null
  
  try {
    // Первый запрос - получение списка аккаунтов
    const response = await axios.post('/api/v1/instances/getInfoByToken', {
      group: ["messenger", "crm", "bulk"],
      source: ["telegram", "whatsapp", "crm"],
      type: ["amocrm", "bitrix24", "bulk"]
    })
    
    if (response.data.ok) {
      const allAccounts = response.data.data.instances
      // Получаем дополнительную информацию для каждого аккаунта
      await fetchAccountsInfo(allAccounts)
    } else {
      throw new Error(response.data.message || 'Ошибка получения аккаунтов')
    }
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при загрузке данных'
    console.error('Ошибка при получении аккаунтов:', err)
  } finally {
    loading.value = false
  }
}

async function fetchAccountsInfo(allAccounts) {
  const promises = allAccounts.map(async (account) => {
    try {
      const payload = {
        source: account.source,
        login: account.login,
        type: account.type,
        storage: account.storage || 'local'
      }
      
      const response = await axios.post('/api/v1/instances/getInfo', payload)
      
      return {
        ...account,
        ...response.data
      }
    } catch (err) {
      console.error(`Ошибка при получении информации для аккаунта ${account.login}:`, err)
      return {
        ...account,
        step: { value: null, message: 'Ошибка загрузки' }
      }
    }
  })
  
  // Ждем завершения всех запросов
  const accountsInfo = await Promise.all(promises)
  accounts.value = accountsInfo
  // Фильтруем только аккаунты с step=5
  filteredAccounts.value = accountsInfo.filter(account => account.step?.value === 5)
}

function openChat(account) {
  // Переход в чаты с параметрами аккаунта
  router.push({
    name: 'Chats',
    query: {
      source: account.source,
      login: account.login,
      type: account.type
    }
  })
}
</script>

<style scoped>
.simple-accounts-container {
  padding: 20px;
}

.loading, .error, .no-accounts {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.error button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.account-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
}

.account-source {
  font-size: 14px;
  color: #666;
  margin: 0;
  text-transform: capitalize;
}

.chat-button {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.chat-button:hover {
  background: #218838;
}

@media (max-width: 768px) {
  .accounts-grid {
    grid-template-columns: 1fr;
  }
}
</style>