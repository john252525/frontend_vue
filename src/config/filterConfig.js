export const FILTER_CONFIG = {
  whatsapi: {
    filters: [
      {
        id: "telegram",
        name: "Telegram",
        enabled: true,
      },
      {
        id: "whatsapp",
        name: "WhatsApp",
        enabled: true,
      },
      {
        id: "max",
        name: "Max",
        enabled: true,
      },
      {
        id: "vk",
        name: "VK",
        enabled: true,
      },
      {
        id: "bulk",
        name: "Рассылки",
        enabled: true,
      },
      {
        id: "crm",
        name: "CRM",
        enabled: true,
        subFilters: [
          { id: "amocrm", name: "AmoCRM", enabled: true },
          { id: "bitrix24", name: "Bitrix24", enabled: true },
          { id: "uon", name: "U-ON", enabled: true },
        ],
      },
    ],
    showDeletedToggle: true,
  },

  touchapi: {
    filters: [
      {
        id: "telegram",
        name: "Telegram",
        enabled: true,
      },
      {
        id: "whatsapp",
        name: "WhatsApp",
        enabled: true,
      },
      {
        id: "max",
        name: "Max",
        enabled: true,
      },
      {
        id: "bulk",
        name: "Рассылки",
        enabled: true,
      },
      {
        id: "crm",
        name: "CRM",
        enabled: true,
        subFilters: [
          { id: "amocrm", name: "AmoCRM", enabled: true },
          { id: "bitrix24", name: "Bitrix24", enabled: true },
          { id: "uon", name: "U-ON", enabled: false },
        ],
      },
    ],
    showDeletedToggle: true,
  },
};

export const getFilterConfigForDomain = (domainValue) => {
  return FILTER_CONFIG[domainValue] || FILTER_CONFIG.whatsapi;
};
