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
    console.log(currentDomain);

    const config = getDomainConfig(currentDomain.value);
    console.log(config, "config");

    // Обновляем stationDomain
    Object.assign(stationDomain, config);
  });

  return {
    stationDomain,
    currentDomain,
  };
}
