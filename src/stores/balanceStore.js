import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAccountStore } from './accountStore'
import useFrontendLogger from '@/composables/useFrontendLogger'

export const useBalanceStore = defineStore('balance', () => {
  const balance = ref('')
  const balanceError = ref(false)
  const balanceLoading = ref(false)
  
  const apiUrl = import.meta.env.VITE_PAY_URL
  const { sendLog } = useFrontendLogger()
  
  const accountStore = useAccountStore()
  const token = computed(() => accountStore.getAccountToken)

  const handleSendLog = async (location, method, params, results, answer) => {
    try {
      await sendLog(location, method, params, results, answer)
    } catch (err) {
      console.error('error', err)
    }
  }

  const removeDecimalZeros = (value) => {
    return value.toString().replace(/\.00$/, '')
  }

  const formattedBalance = computed(() => {
    return balance.value ? `${removeDecimalZeros(balance.value)} ₽` : ''
  })

  const regBalanceUser = async () => {
    try {
      balanceLoading.value = true

      const response = await axios.post(
        `${apiUrl}/createUser`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
        }
      )

      if (response.data) {
        await handleSendLog(
          'balance',
          'get-payment-sum',
          null,
          response.data,
          response.data
        )
      }
      if (response.data.success) {
        await getBalance()
      }
    } catch (err) {
      balanceLoading.value = false
      balanceError.value = true
      console.error('error', err.response ? err.response.data : err.message)
    }
  }

  const getBalance = async () => {
    try {
      balanceLoading.value = true
      balanceError.value = false

      const response = await axios.post(
        `${apiUrl}/getUserBalance`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
        }
      )

      if (response.data) {
        await handleSendLog(
          'balance',
          'get-payment-sum',
          null,
          response.data,
          response.data
        )
      }
      
      balance.value = response.data.balance
      balanceError.value = false
    } catch (err) {
      balanceError.value = true
      console.error('error', err.response ? err.response.data : err.message)
    } finally {
      balanceLoading.value = false
    }
  }

  // Функция для принудительного обновления баланса
  const refreshBalance = async () => {
    await getBalance()
  }

  return {
    balance,
    balanceError,
    balanceLoading,
    formattedBalance,
    regBalanceUser,
    getBalance,
    refreshBalance
  }
})