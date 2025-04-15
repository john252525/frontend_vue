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

    if (currentDomain.value === "app4.developtech.ru") {
      stationDomen.navigate.value = "settings";
      stationDomen.cosmetics.logo = "Crypto";
      stationDomen.cosmetics.titleLogo = "Crypto";
      stationDomen.cosmetics.urlLogo = "/crypto.svg";
    }

    if (currentDomain.value === "app2.developtech.ru") {
      stationDomen.navigate.value = "whatsapi";
      stationDomen.cosmetics.logo = "WhatsApi";
      stationDomen.cosmetics.titleLogo = "WhatsApi";
      stationDomen.cosmetics.urlLogo = "/whats_api.svg";
    }

    if (currentDomain.value === "app1.developtech.ru") {
      stationDomen.navigate.value = "touchapi";
      stationDomen.cosmetics.logo = "TouchApi";
      stationDomen.cosmetics.titleLogo = "Touch-Api";
      stationDomen.cosmetics.urlLogo =
        "https://static.tildacdn.com/tild3630-6562-4930-b532-356635636363/favicon.ico";
    }
    console.log("Текущий домен:", stationDomen);
  });

  return {
    stationDomen,
  };
}
