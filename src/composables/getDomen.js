import { ref, onMounted, reactive } from "vue";

const currentDomain = ref("");

const stationDomen = reactive({
  navigate: {
    value: "",
  },
  сosmetics: {
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
      stationDomen.сosmetics.logo = "Crypto";
      stationDomen.сosmetics.titleLogo = "Crypto";
      stationDomen.сosmetics.urlLogo = "/crypto.svg";
    }

    if (currentDomain.value === "app2.developtech.ru") {
      stationDomen.navigate.value = "whatsapi";
      stationDomen.сosmetics.logo = "WhatsApi";
      stationDomen.сosmetics.titleLogo = "WhatsApi";
      stationDomen.сosmetics.urlLogo = "/whats_api.svg";
    }
    
    if (currentDomain.value === "app1.developtech.ru") {
      stationDomen.navigate.value = "touchapi";
      stationDomen.сosmetics.logo = "TouchApi";
      stationDomen.сosmetics.titleLogo = "Touch-Api";
      stationDomen.сosmetics.urlLogo =
        "https://static.tildacdn.com/tild3630-6562-4930-b532-356635636363/favicon.ico";
    }
    console.log("Текущий домен:", stationDomen);
  });

  return {
    stationDomen,
  };
}
