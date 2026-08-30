import { reactive } from "vue";

const stationLoading = reactive({
  successfully: null,
  error: null,
  loading: false,
  progress: 0,
  isOpen: false,
  timer: null,
  text: "",
});

export function useStationLoading() {
  const setLoadingStatus = (isOpen, type = null, message = null, progress = null) => {
    // Очищаем предыдущий таймер, если он есть
    if (stationLoading.timer) {
      clearTimeout(stationLoading.timer);
      stationLoading.timer = null;
    }

    stationLoading.isOpen = isOpen;

    if (type === "loading") {
      // Промежуточное состояние длительной операции (например, создания
      // аккаунта) — висит, пока вызывающий код сам не переключит его в
      // success/error, поэтому таймер автозакрытия ниже для него не заводим.
      // progress задаётся вызывающим кодом по шагам самой операции (напр.
      // 50 — "создание", 90 — "добавление"), а не считается автоматически.
      stationLoading.loading = true;
      stationLoading.successfully = null;
      stationLoading.error = null;
      stationLoading.text = message || "";
      stationLoading.progress = progress ?? stationLoading.progress;
    } else if (type === "success") {
      stationLoading.loading = false;
      stationLoading.successfully = true;
      stationLoading.error = null;
      stationLoading.text = message || "";
      stationLoading.progress = 100;
    } else if (type === "error") {
      stationLoading.loading = false;
      stationLoading.successfully = null;
      stationLoading.text = message;
      stationLoading.progress = 0;
    } else {
      stationLoading.loading = false;
      stationLoading.successfully = null;
      stationLoading.error = null;
      stationLoading.progress = 0;
    }

    // Если открываем модалку, запускаем таймер на закрытие — кроме
    // промежуточного "loading", у которого нет фиксированной длительности.
    if (isOpen && type !== "loading") {
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
