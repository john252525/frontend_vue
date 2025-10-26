<template>
  <div id="control-tour"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const emit = defineEmits(["tour-complete", "tour-close"]);

const driverObj = ref(null);

const tourSteps = [
  {
    element: ".modal-content",
    popover: {
      title: "Панель управления аккаунтом",
      description:
        "Здесь собраны все основные действия для управления вашим аккаунтом. Вы можете выполнять различные операции с аккаунтом через эту панель.",
      side: "left",
      align: "start",
    },
  },
  {
    element: ".control-settings-btn",
    popover: {
      title: "Настройки аккаунта",
      description:
        "Открывает настройки аккаунта для изменения параметров и конфигурации.",
      side: "left",
      align: "start",
    },
  },
  {
    element: ".control-extend-btn",
    popover: {
      title: "Продление аккаунта",
      description: "Позволяет продлить срок действия аккаунта или подписки.",
      side: "left",
      align: "start",
    },
  },
  {
    element: ".control-screenshot-btn",
    popover: {
      title: "Скриншот",
      description: "Сделать скриншот текущего состояния аккаунта или сессии.",
      side: "left",
      align: "start",
    },
  },
  {
    element: ".control-enable-btn",
    popover: {
      title: "Включение аккаунта",
      description: "Активировать и включить аккаунт для работы.",
      side: "left",
      align: "start",
    },
  },
  {
    element: ".control-disable-btn",
    popover: {
      title: "Выключение аккаунта",
      description: "Деактивировать и выключить аккаунт.",
      side: "left",
      align: "start",
    },
  },
  {
    element: ".control-reset-btn",
    popover: {
      title: "Сброс аккаунта",
      description: "Выполнить сброс аккаунта к начальным настройкам.",
      side: "left",
      align: "start",
    },
  },
  {
    element: ".control-proxy-btn",
    popover: {
      title: "Смена прокси",
      description: "Изменить прокси-сервер для аккаунта.",
      side: "left",
      align: "start",
    },
  },
  {
    element: ".control-delete-btn",
    popover: {
      title: "Удаление аккаунта",
      description:
        "Полностью удалить аккаунт из системы. Внимание: это действие необратимо!",
      side: "left",
      align: "start",
    },
  },
];

onMounted(() => {
  driverObj.value = driver({
    showProgress: true,
    animate: false,
    overlayOpacity: 0.7,
    smoothScroll: false,
    allowClose: true,
    stagePadding: 10,
    overlayColor: "#000",
    popoverClass: "custom-control-popover",
    doneBtnText: "Завершить обучение",
    closeBtnText: "Закрыть",
    nextBtnText: "Далее →",
    prevBtnText: "← Назад",

    onPopoverRender: (popover, { config }) => {
      const popoverElement = popover.popover;
      if (popoverElement) {
        popoverElement.style.position = "fixed";
        popoverElement.style.bottom = "20px";
        popoverElement.style.left = "50%";
        popoverElement.style.transform = "translateX(-50%)";
        popoverElement.style.width = "90%";
        popoverElement.style.maxWidth = "500px";
        popoverElement.style.zIndex = "10020";
        popoverElement.style.margin = "0";
      }
    },

    onHighlightStarted: (element) => {
      if (element?.node) {
        element.node.style.boxShadow =
          "0 0 0 3px #ffffff, 0 0 0 6px rgba(79, 70, 229, 0.8)";
        element.node.style.borderRadius = "8px";
        element.node.style.transition = "all 0.3s ease";
        element.node.style.zIndex = "10019";
        element.node.style.position = "relative";
        element.node.style.background = "oklch(0.541 0.198 267)";
        element.node.style.color = "white";
        element.node.style.borderColor = "white";
      }
    },

    onDeselected: (element) => {
      if (element?.node) {
        element.node.style.boxShadow = "";
        element.node.style.borderRadius = "";
        element.node.style.zIndex = "";
        element.node.style.position = "";
        element.node.style.background = "";
        element.node.style.color = "";
        element.node.style.borderColor = "";
      }
    },

    onDestroyed: () => {
      emit("tour-complete");
    },

    onReset: () => {
      emit("tour-close");
    },
  });
});

const startTour = () => {
  if (driverObj.value) {
    driverObj.value.setSteps(tourSteps);
    driverObj.value.drive();
  }
};

defineExpose({
  startTour,
});
</script>

<style scoped>
#control-tour {
  position: relative;
}
</style>

<style>
.custom-control-popover {
  z-index: 10020 !important;
  position: fixed !important;
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 90% !important;
  max-width: 500px !important;
  margin: 0 !important;
}

.driver-popover {
  z-index: 10020 !important;
  position: fixed !important;
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 90% !important;
  max-width: 500px !important;
  margin: 0 !important;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
}

.driver-overlay {
  z-index: 10015 !important;
  opacity: 0.7 !important;
  background: #000 !important;
}

.driver-active-element {
  position: relative !important;
  z-index: 10019 !important;
}

.driver-popover-arrow {
  display: none !important;
}

.driver-popover-title {
  font-size: 18px !important;
  font-weight: 600 !important;
  margin-bottom: 8px !important;
  color: #1f2937 !important;
}

.driver-popover-description {
  font-size: 14px !important;
  line-height: 1.4 !important;
  margin-bottom: 16px !important;
  color: #4b5563 !important;
}

.driver-popover-footer {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 8px !important;
}

.driver-popover-progress-text {
  font-weight: 500 !important;
  color: #666 !important;
}

.driver-btn {
  padding: 8px 16px !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  border: none !important;
  cursor: pointer !important;
  font-size: 14px !important;
}

.driver-next-btn {
  background: #4f46e5 !important;
  color: white !important;
}

.driver-next-btn:hover {
  background: #4338ca !important;
}

.driver-prev-btn {
  background: #f3f4f6 !important;
  color: #374151 !important;
}

.driver-prev-btn:hover {
  background: #e5e7eb !important;
}

.driver-close-btn {
  background: #ef4444 !important;
  color: white !important;
}

.driver-close-btn:hover {
  background: #dc2626 !important;
}
</style>
