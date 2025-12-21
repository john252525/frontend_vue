import axios from "axios";
import { fetchChats } from "@/utils/getChats";
import { useDomain } from "@/composables/getDomain";

export function useAccountData(storeConfig, stateRefs) {
  const { accountStore, chatStore, props, chatsLoadingChange } = storeConfig;
  const {
    dataStationNone,
    dataStation,
    loadDataStation,
    errorAccountBolean,
    instanceData,
  } = stateRefs;

  const { stationDomain } = useDomain();
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

  const getInfoWhats = async (source, login, type, storage) => {
    try {
      const response = await axios.post(
        `${FRONTEND_URL}getInfo`,
        { source, login, type, storage },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${accountStore.getAccountToken}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error in getInfoWhats:", error);
      return null;
    }
  };

  const changePayDataForAccounts = (item) => {
    const index = instanceData.value.findIndex(
      (account) => account.uuid === item.uuid
    );
    if (index !== -1) {
      instanceData.value[index] = { ...instanceData.value[index], isPay: true };
      setTimeout(() => {
        instanceData.value[index] = {
          ...instanceData.value[index],
          isPay: false,
        };
      }, 3000);
    }
  };

  const getAccounts = async () => {
    if (!accountStore || typeof accountStore.setLoading !== "function") {
      console.error("❌ Store или setLoading не доступны");
      return [];
    }

    try {
      accountStore.setLoading(true);
      dataStationNone.value = false;
      errorAccountBolean.value = false;
      instanceData.value = [];

      let params = {
        source: accountStore.getAccountStation,
        skipDetails: true,
        group: "messenger",
      };

      if (
        stationDomain.navigate.value === "touchapi" ||
        stationDomain.navigate.value === "whatsapi"
      ) {
        params = {
          source: accountStore.getSource,
          type: accountStore.getType,
          group: accountStore.getGroup,
          add_deleted: accountStore.getAddDeleted,
        };
      }

      loadDataStation.value = true;

      const response = await axios.post(
        `${FRONTEND_URL}getInfoByToken`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accountStore.getAccountToken}`,
          },
        }
      );

      if (response.data.ok === true) {
        instanceData.value = response.data.data.instances.map((instance) => ({
          ...instance,
          step: instance.step === null ? "Н/Д" : instance.step,
          loading: true,
          storage: instance.storage || "undefined",
          type: instance.type || "undefined",
        }));

        await props.changeAllAccounts(instanceData.value);

        if (instanceData.value.length === 0) {
          loadDataStation.value = false;
          dataStationNone.value = true;
        } else {
          loadDataStation.value = false;
          dataStation.value = true;

          // Логика загрузки чатов и информации...
          const promises = instanceData.value.map(async (instance) => {
            try {
              const infoResponse = await getInfoWhats(
                instance.source,
                instance.login,
                instance.type,
                instance.storage
              );
              if (infoResponse?.data?.step) {
                instance.step = infoResponse.data.step;
              }
            } catch (error) {
              console.error(`Error for ${instance.login}:`, error);
            } finally {
              instance.loading = false;
            }
          });

          await Promise.all(promises);
          chatsLoadingChange();
        }
      }
    } catch (error) {
      loadDataStation.value = false;
      errorAccountBolean.value = true;
      console.error("Error:", error);
    } finally {
      accountStore.setLoading(false);
      return instanceData.value;
    }
  };

  return { getInfoWhats, getAccounts, changePayDataForAccounts };
}
