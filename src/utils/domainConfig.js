const domains = import.meta.env.VITE_DOMAINS?.split(",") || [];
const navigateValues = import.meta.env.VITE_NAVIGATE_VALUES?.split(",") || [];
const logos = import.meta.env.VITE_LOGOS?.split(",") || [];
const titleLogos = import.meta.env.VITE_TITLE_LOGOS?.split(",") || [];
const urlLogos = import.meta.env.VITE_URL_LOGOS?.split(",") || [];
const additionalLogos = import.meta.env.VITE_ADDITIONAL_LOGOS?.split(",") || [];

// Создаем карту конфигураций для быстрого доступа
export const domainConfigMap = domains.reduce((map, domain, index) => {
  map[domain] = {
    navigate: {
      value: navigateValues[index] || "",
    },
    cosmetics: {
      logo: logos[index] || "",
      titleLogo: titleLogos[index] || "",
      urlLogo: urlLogos[index] || "",
      additionallyLogo: additionalLogos[index] || "",
    },
  };
  return map;
}, {});

// Получаем конфигурацию для текущего домена
export function getDomainConfig(hostname) {
  return domainConfigMap[hostname] || getDefaultConfig();
}

// Конфигурация по умолчанию
export function getDefaultConfig() {
  return {
    navigate: {
      value: "touchapi", // или другое значение по умолчанию
    },
    cosmetics: {
      logo: "Default",
      titleLogo: "Default",
      urlLogo: "/default.svg",
      additionallyLogo: "",
    },
  };
}
