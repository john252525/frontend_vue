export function useAccountActions(config) {
  const { accountStore, chatStore, getInfoWhats } = config;

  const changeForceStopItemData = async (item, instanceData) => {
    try {
      const accountIndex = instanceData.findIndex(
        (acc) => acc.login === item.login && acc.source === item.source
      );

      if (accountIndex === -1) return;

      instanceData[accountIndex].loading = true;

      const infoResponse = await getInfoWhats(
        item.source,
        item.login,
        item.type,
        item.storage
      );

      if (!infoResponse?.data) {
        throw new Error("Invalid response structure");
      }

      const currentStep = infoResponse.data.step || { value: "-", message: "" };

      instanceData[accountIndex] = {
        ...instanceData[accountIndex],
        step: currentStep,
        loading: false,
      };

      if (currentStep.value === 5) {
        updateLocalStorage(item.login, item.source, item.storage, item.type);
      }
    } catch (error) {
      console.error("Error:", error);
      const accountIndex = instanceData.findIndex(
        (acc) => acc.login === item.login && acc.source === item.source
      );
      if (accountIndex !== -1) {
        instanceData[accountIndex].loading = false;
      }
    }
  };

  const changeEnableStation = (toggleRef) => {
    toggleRef.value = !toggleRef.value;
  };

  const changeGetScreenStation = (toggleRef) => {
    toggleRef.value = !toggleRef.value;
  };

  const closeScreen = (toggleRef) => {
    toggleRef.value = false;
  };

  const changeStationGetHistory = (toggleRef) => {
    toggleRef.value = !toggleRef.value;
  };

  const changeBindingStation = (toggleRef) => {
    toggleRef.value = !toggleRef.value;
  };

  const updateLocalStorage = (login, source, storage, type) => {
    try {
      const newLoginData = {
        login,
        source,
        storage: storage || "undefined",
        type: type || "undefined",
      };
      chatStore.addOrUpdateChat(newLoginData);
      console.log("Account saved:", newLoginData);
    } catch (e) {
      console.error("Error:", e);
    }
  };

  return {
    changeForceStopItemData,
    changeEnableStation,
    changeGetScreenStation,
    closeScreen,
    changeStationGetHistory,
    changeBindingStation,
  };
}
