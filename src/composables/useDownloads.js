import { ref } from "vue";

// Глобальное состояние загрузок
const downloads = ref([]);
const isDownloadsVisible = ref(false);

export function useDownloads() {
  // Добавить новую загрузку
  const addDownload = (name) => {
    const newDownload = {
      id: Date.now() + Math.random(),
      name: name,
      status: "loading",
      progress: 0,
      timestamp: new Date(),
    };

    downloads.value.unshift(newDownload);
    isDownloadsVisible.value = true;

    return newDownload.id;
  };

  // Обновить прогресс загрузки
  const updateDownloadProgress = (id, progress) => {
    const download = downloads.value.find((d) => d.id === id);
    if (download) {
      download.progress = Math.min(100, Math.max(0, progress));
    }
  };

  // Завершить загрузку
  const completeDownload = (id, success = true) => {
    const download = downloads.value.find((d) => d.id === id);
    if (download) {
      download.status = success ? "success" : "error";
      download.progress = success ? 100 : 0;
    }
  };

  // Очистить завершенные загрузки
  const clearCompleted = () => {
    downloads.value = downloads.value.filter(
      (download) => download.status === "loading"
    );
  };

  // Очистить все загрузки
  const clearAll = () => {
    downloads.value = [];
  };

  // Показать/скрыть коробку загрузок
  const toggleDownloads = () => {
    isDownloadsVisible.value = !isDownloadsVisible.value;
  };

  return {
    downloads,
    isDownloadsVisible,
    addDownload,
    updateDownloadProgress,
    completeDownload,
    clearCompleted,
    clearAll,
    toggleDownloads,
  };
}
