import { ref, onMounted, reactive } from "vue";
import { getDomainConfig } from "@/utils/domainConfig";

const currentDomain = ref("");
const stationDomain = reactive({
  navigate: {
    value: "",
  },
  cosmetics: {
    logo: "",
    titleLogo: "",
    urlLogo: "",
    additionallyLogo: "",
  },
});

export function useDomain() {
  onMounted(() => {
    currentDomain.value = window.location.hostname;

    // Получаем конфигурацию для текущего домена
    const config = getDomainConfig(currentDomain.value);

    // Обновляем stationDomain
    Object.assign(stationDomain, config);
  });

  return {
    stationDomain,
    currentDomain,
  };
}
