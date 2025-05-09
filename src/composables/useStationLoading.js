import { reactive } from "vue";

const stationLoading = reactive({
  successfully: null,
  error: null,
  isOpen: false,
  timer: null,
});

export function useStationLoading() {
  const setLoadingStatus = (isOpen, type = null, message = null) => {
    // Очищаем предыдущий таймер, если он есть
    if (stationLoading.timer) {
      clearTimeout(stationLoading.timer);
      stationLoading.timer = null;
    }

    stationLoading.isOpen = isOpen;

    if (type === "success") {
      stationLoading.successfully = true; // Сохраняем сообщение
      stationLoading.error = null;
    } else if (type === "error") {
      stationLoading.successfully = false; // Сохраняем сообщение
      stationLoading.successfully = null;
    } else {
      stationLoading.successfully = null;
      stationLoading.error = null;
    }

    // Если открываем модалку, запускаем таймер на закрытие
    if (isOpen) {
      stationLoading.timer = setTimeout(() => {
        setLoadingStatus(false);
      }, 5000);
    }
  };

  // Функция для ручного закрытия (с очисткой таймера)
  const closeModal = () => {
    setLoadingStatus(false);
  };

  return {
    stationLoading,
    setLoadingStatus,
    closeModal,
  };
}
