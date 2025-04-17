import { ref, onMounted, reactive } from "vue";

const currentDomain = ref("");

const stationDomen = reactive({
  navigate: {
    value: "",
  },
  cosmetics: {
    logo: "",
    titleLogo: "",
    urlLogo: "",
  },
});

export function useDomain() {
  onMounted(() => {
    currentDomain.value = window.location.hostname;

    if (currentDomain.value === import.meta.env.VITE_DOMEN_APP4) {
      stationDomen.navigate.value = import.meta.env.VITE_DOMEN_APP4_NAVIGATE;
      stationDomen.cosmetics.logo = import.meta.env.VITE_DOMEN_APP4_LOFO;
      stationDomen.cosmetics.titleLogo = import.meta.env.VITE_DOMEN_APP4_LOFO;
      stationDomen.cosmetics.urlLogo = import.meta.env.VITE_DOMEN_APP4_LOFO_URL;
    }

    if (currentDomain.value === "helly.apitter.com") {
      stationDomen.navigate.value = "whatsapi";
      stationDomen.cosmetics.logo = "WhatsApi";
      stationDomen.cosmetics.titleLogo = "WhatsApi";
      stationDomen.cosmetics.urlLogo =
        "https://static.tildacdn.com/tild3630-6562-4930-b532-356635636363/favicon.ico";
    }

    if (currentDomain.value === import.meta.env.VITE_DOMEN_APP2) {
      stationDomen.navigate.value = import.meta.env.VITE_DOMEN_APP2_NAVIGATE;
      stationDomen.cosmetics.logo = import.meta.env.VITE_DOMEN_APP2_LOFO;
      stationDomen.cosmetics.titleLogo = import.meta.env.VITE_DOMEN_APP2_LOFO;
      stationDomen.cosmetics.urlLogo = import.meta.env.VITE_DOMEN_APP2_LOFO_URL;
    }

    if (currentDomain.value === import.meta.env.VITE_DOMEN_APP1) {
      stationDomen.navigate.value = import.meta.env.VITE_DOMEN_APP1_NAVIGATE;
      stationDomen.cosmetics.logo = import.meta.env.VITE_DOMEN_APP1_LOFO;
      stationDomen.cosmetics.titleLogo = import.meta.env.VITE_DOMEN_APP1_LOFO;
      stationDomen.cosmetics.urlLogo = import.meta.env.VITE_DOMEN_APP1_LOFO_URL;
    }
    console.log("Текущий домен:", stationDomen);
  });

  return {
    stationDomen,
  };
}
