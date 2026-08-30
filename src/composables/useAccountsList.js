import { ref, computed } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";
import { useInstancesStore } from "@/stores/instancesStore";
import { fetchChats } from "@/utils/getChats";
import { useDomain } from "@/composables/getDomain";

// Общая логика получения аккаунтов (getInfoByToken -> getInfo по каждому)
// и сохранения их в instancesStore. Используется как на странице аккаунтов
// (AccountsListV2), так и на странице подписок (Subscriptions).
export function useAccountsList(options = {}) {
  const { onAccountsLoaded, chatsLoadingChange } = options;

  const accountStore = useAccountStore();
  const instancesStore = useInstancesStore();
  const { stationDomain } = useDomain();

  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

  const token = computed(() => accountStore.getAccountToken);
  const accountStation = computed(() => accountStore.getAccountStation);
  const sourceGroup = computed(() => accountStore.getSource);
  const addDeleted = computed(() => accountStore.getAddDeleted);
  const typeGroup = computed(() => accountStore.getType);

  const dataStationNone = ref(false);
  const dataStation = ref(false);
  const loadDataStation = ref(false);
  const errorAccountBolean = ref(false);
  const instanceData = ref([]);
  const accounts = ref([]);

  const getInfoWhats = async (source, login, type, storage) => {
    try {
      const response = await axios.post(
        `${FRONTEND_URL}getInfo`,
        {
          source: source,
          login: login,
          type: type,
          storage: storage,
        },
        {
          timeout: 15000,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${token.value}`,
          },
        },
      );
      return response;
    } catch (error) {
      console.error("Error in getInfoWhats:", error);
      return null;
    }
  };

  // Применяет текущее состояние фильтров из accountStore к allInstances без API-запроса
  const filterInstances = () => {
    if (!instancesStore.hasAllInstances) return;

    const sources = sourceGroup.value;
    const types = typeGroup.value;
    const showDeleted = addDeleted.value;

    const messengerSources = [
      "telegram",
      "whatsapp",
      "waba",
      "fbm",
      "max",
      "max-bot",
      "instagram",
      "vk-bot",
    ];

    const filtered = instancesStore.allInstances.filter((inst) => {
      // Фильтр удалённых аккаунтов
      if (!showDeleted && inst.enable === "0") return false;

      // Если все фильтры сброшены — показываем всё
      if (sources.length === 0 && types.length === 0) return true;

      // Мессенджеры фильтруются ТОЛЬКО по source, не по type
      if (messengerSources.includes(inst.source)) {
        return sources.includes(inst.source);
      }

      // Остальные аккаунты (SMS, Email, CRM): по source или type
      if (sources.length > 0 && sources.includes(inst.source)) return true;

      // Соответствие по type (SMS → touchapi, Email → adapter, CRM-типы)
      if (types.length > 0 && types.includes(inst.type)) return true;

      return false;
    });

    instanceData.value = filtered.map((inst) => ({ ...inst }));
    instancesStore.setInstances([...instanceData.value]);

    dataStation.value = instanceData.value.length > 0;
    dataStationNone.value = instanceData.value.length === 0;
  };

  const retryGetInfo = async (item) => {
    const accountIndex = instanceData.value.findIndex(
      (acc) => acc.login === item.login && acc.source === item.source,
    );
    if (accountIndex === -1) return;

    instanceData.value[accountIndex] = {
      ...instanceData.value[accountIndex],
      loading: true,
      getInfoError: false,
    };
    instancesStore.updateInstanceByUuid(item.uuid, {
      loading: true,
      getInfoError: false,
    });

    let getInfoError = false;
    try {
      const infoResponse = await getInfoWhats(
        item.source,
        item.login,
        item.type,
        item.storage,
      );

      if (!infoResponse) {
        getInfoError = true;
      } else {
        if (infoResponse.data?.step) {
          instanceData.value[accountIndex].step = infoResponse.data.step;
        }
        instanceData.value[accountIndex].connectedPhone =
          infoResponse.data?.connectedPhone || "";
      }
    } catch (error) {
      getInfoError = true;
      console.error(`Retry getInfo error for ${item.login}:`, error);
    } finally {
      instanceData.value[accountIndex].loading = false;
      instanceData.value[accountIndex].getInfoError = getInfoError;
      instancesStore.updateInstanceByUuid(item.uuid, {
        loading: false,
        step: instanceData.value[accountIndex].step,
        connectedPhone: instanceData.value[accountIndex].connectedPhone || "",
        getInfoError,
      });
    }
  };

  // Вынесено из getAccounts, чтобы refreshAccountsSilently ниже могла делать
  // тот же запрос без дублирования этой логики построения параметров.
  const buildAccountsParams = () => {
    let params = {
      source: accountStation.value,
      skipDetails: true,
      group: "messenger",
    };

    if (stationDomain.navigate.value === "touchapi") {
      // Fetch ALL accounts — client-side filtering applied afterwards
      params = {
        source: [
          "telegram",
          "whatsapp",
          "waba",
          "fbm",
          "max",
          "vk-bot",
          "max-bot",
          "instagram",
          "sms",
          "email",
        ],
        type: ["amocrm", "bitrix24", "uon", "adapter", "touchapi"],
        group: ["messenger", "crm"],
        add_deleted: true,
      };
    }

    if (stationDomain.navigate.value === "whatsapi") {
      // Fetch ALL accounts — client-side filtering applied afterwards
      params = {
        source: [
          "telegram",
          "whatsapp",
          "waba",
          "fbm",
          "max",
          "vk-bot",
          "max-bot",
          "instagram",
          "sms",
          "email",
        ],
        type: ["amocrm", "bitrix24", "uon", "bulk", "adapter", "touchapi"],
        group: ["messenger", "crm", "bulk"],
        add_deleted: true,
      };
    } else if (stationDomain.navigate.value === "webest") {
      params = {
        source: [
          "telegram",
          "whatsapp",
          "waba",
          "fbm",
          "max",
          "vk-bot",
          "max-bot",
          "instagram",
          "sms",
          "email",
        ],
        type: ["amocrm", "bitrix24", "uon", "bulk", "adapter", "touchapi"],
        group: ["messenger", "crm", "bulk"],
        add_deleted: true,
      };
    }

    return params;
  };

  // Тихое обновление списка — в отличие от getAccounts НЕ сбрасывает
  // instanceData в [] и не трогает loadDataStation/dataStationNone, поэтому
  // уже показанный список не "гаснет" во время обновления (используется
  // сразу после создания аккаунта, пока пользователь продолжает работать
  // со страницей).
  const refreshAccountsSilently = async () => {
    try {
      const response = await axios.post(
        `${FRONTEND_URL}getInfoByToken`,
        buildAccountsParams(),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.value}`,
          },
        },
      );

      if (response.data.ok === true) {
        const freshList = (response.data.data?.instances || []).map(
          (instance) => ({
            ...instance,
            step: instance.step === null ? "Н/Д" : instance.step,
            loading: false,
            storage: instance.storage || "undefined",
            type: instance.type || "undefined",
          }),
        );

        instanceData.value = freshList;
        instancesStore.setAllInstances([...freshList]);
        filterInstances();
        dataStation.value = freshList.length > 0;
        dataStationNone.value = freshList.length === 0;

        return freshList;
      }
    } catch (error) {
      console.error("Ошибка тихого обновления списка аккаунтов:", error);
    }

    return instanceData.value;
  };

  const getAccounts = async () => {
    if (!accountStore || typeof accountStore.setLoading !== "function") {
      console.error("❌ useAccountsList: store или setLoading не доступны");
      return [];
    }

    try {
      accountStore.setLoading(true);

      dataStationNone.value = false;
      errorAccountBolean.value = false;
      instanceData.value = [];

      const params = buildAccountsParams();

      loadDataStation.value = true;

      try {
        const response = await axios.post(
          `${FRONTEND_URL}getInfoByToken`,
          params,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token.value}`,
            },
          },
        );

        if (response.data.ok === true) {
          accounts.value = response.data;
          instanceData.value = (accounts.value.data?.instances || []).map(
            (instance) => ({
              ...instance,
              step: instance.step === null ? "Н/Д" : instance.step,
              loading: true,
              storage: instance.storage || "undefined",
              type: instance.type || "undefined",
            }),
          );

          if (onAccountsLoaded) {
            await onAccountsLoaded(instanceData.value);
          }

          if (instanceData.value.length === 0) {
            loadDataStation.value = false;
            dataStationNone.value = true;
          } else {
            loadDataStation.value = false;
            dataStation.value = true;

            // Сразу показываем аккаунты и разблокируем UI
            instancesStore.setAllInstances([...instanceData.value]);
            filterInstances();

            if (
              accountStation.value === "whatsapp" ||
              accountStation.value === "telegram"
            ) {
              // Фоновый переопрос getInfo — не блокирует интерфейс
              (async () => {
                const accountsToFetch = instanceData.value.filter(
                  (instance) =>
                    instance.step?.value === 5 &&
                    !["bulk", "amocrm", "bitrix24", "uon"].includes(
                      instance.type,
                    ) &&
                    ((instance.storage === "binder" &&
                      instance.type !== "touchapi") ||
                      (instance.storage === "whatsapi" &&
                        instance.type === "whatsapi")),
                );

                if (accountsToFetch.length > 0) {
                  try {
                    await new Promise((resolve) =>
                      setTimeout(resolve, 200 * accountsToFetch.length),
                    );
                    await fetchChats({
                      token: token.value,
                      accounts: accountsToFetch,
                    });
                  } catch (e) {
                    console.error("Ошибка при сохранении аккаунтов:", e);
                  }
                }

                const promises = instanceData.value.map(async (instance) => {
                  if (
                    instance.type === "bulk" ||
                    instance.type === "amocrm" ||
                    instance.type === "bitrix24" ||
                    instance.type === "uon"
                  ) {
                    instance.loading = false;
                    instancesStore.updateInstanceByUuid(instance.uuid, {
                      loading: false,
                    });
                    return;
                  }

                  if (
                    (instance.storage === "binder" &&
                      instance.type !== "touchapi") ||
                    (instance.storage === "whatsapi" &&
                      instance.type === "whatsapi")
                  ) {
                    instance.loading = false;
                    instancesStore.updateInstanceByUuid(instance.uuid, {
                      loading: false,
                    });
                    return;
                  }

                  let getInfoError = false;
                  try {
                    const infoResponse = await getInfoWhats(
                      instance.source,
                      instance.login,
                      instance.type,
                      instance.storage,
                    );

                    if (!infoResponse) {
                      getInfoError = true;
                    } else {
                      if (infoResponse.data?.step) {
                        instance.step = infoResponse.data.step;
                      }
                      instance.connectedPhone =
                        infoResponse.data?.connectedPhone || "";
                    }
                  } catch (error) {
                    getInfoError = true;
                    console.error(`Error for ${instance.login}:`, error);
                  } finally {
                    instance.loading = false;
                    instance.getInfoError = getInfoError;
                    instancesStore.updateInstanceByUuid(instance.uuid, {
                      loading: false,
                      step: instance.step,
                      connectedPhone: instance.connectedPhone || "",
                      getInfoError,
                    });
                  }
                });

                await Promise.all(promises);
                chatsLoadingChange?.();

                // Обновляем стор после завершения фоновых запросов
                instancesStore.setAllInstances([...instanceData.value]);
                filterInstances();
              })();
            } else {
              instanceData.value.forEach((instance) => {
                instance.loading = false;
              });
              instancesStore.setAllInstances([...instanceData.value]);
              filterInstances();
            }
          }
        }
      } catch (error) {
        loadDataStation.value = false;
        errorAccountBolean.value = true;
        console.error("Error:", error);
      }
    } catch (error) {
      console.error("❌ useAccountsList: ошибка в основном блоке:", error);
    } finally {
      accountStore.setLoading(false);
      return instanceData.value;
    }
  };

  return {
    // state
    dataStationNone,
    dataStation,
    loadDataStation,
    errorAccountBolean,
    instanceData,
    accounts,
    token,
    accountStation,
    // methods
    getInfoWhats,
    filterInstances,
    retryGetInfo,
    getAccounts,
    refreshAccountsSilently,
  };
}
