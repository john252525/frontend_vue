import { ref, onMounted } from 'vue'

const currentDomain = ref('')

export function useDomain() {
  onMounted(() => {
    currentDomain.value = window.location.hostname
    console.log('Текущий домен:', currentDomain.value)
  })
  
  return {
    currentDomain
  }
}