import { ref, onMounted, reactive } from "vue";

const currentDomain = ref("");

const stationDomain = reactive({
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
      stationDomain.navigate.value = "settings";
      stationDomain.cosmetics.logo = "Crypto";
      stationDomain.cosmetics.titleLogo = "Crypto";
      stationDomain.cosmetics.urlLogo = "/crypto.svg";
    }

    if (currentDomain.value === "localhost") {
      stationDomain.navigate.value = "touchapi";
      stationDomain.cosmetics.logo = "TouchApi";
      stationDomain.cosmetics.titleLogo = "Touch-Api";
      stationDomain.cosmetics.urlLogo =
        "https://static.tildacdn.com/tild3630-6562-4930-b532-356635636363/favicon.ico";
    }

    if (currentDomain.value === "helly.apitter.com") {
      stationDomain.navigate.value = "whatsapi";
      stationDomain.cosmetics.logo = "WhatsApi";
      stationDomain.cosmetics.titleLogo = "WhatsApi";
      stationDomain.cosmetics.urlLogo = "/whatsApi_logo.svg";
    }

    if (currentDomain.value === "app2.developtech.ru") {
      stationDomain.navigate.value = "whatsapi";
      stationDomain.cosmetics.logo = "WhatsApi";
      stationDomain.cosmetics.titleLogo = "WhatsApi";
      stationDomain.cosmetics.urlLogo = "/whatsApi_logo.svg";
    }

    if (currentDomain.value === "app2.touch-api.com") {
      stationDomain.navigate.value = "touchapi";
      stationDomain.cosmetics.logo = "TouchApi";
      stationDomain.cosmetics.titleLogo = "Touch-Api";
      stationDomain.cosmetics.urlLogo =
        "https://static.tildacdn.com/tild3630-6562-4930-b532-356635636363/favicon.ico";
    }

    if (currentDomain.value === "app1.developtech.ru") {
      stationDomain.navigate.value = "touchapi";
      stationDomain.cosmetics.logo = "TouchApi";
      stationDomain.cosmetics.titleLogo = "Touch-Api";
      stationDomain.cosmetics.urlLogo =
        "https://static.tildacdn.com/tild3630-6562-4930-b532-356635636363/favicon.ico";
    }
  });

  return {
    stationDomain,
  };
}
