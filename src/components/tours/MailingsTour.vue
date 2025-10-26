<template>
  <div id="mailing-tour"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const emit = defineEmits(["tour-complete", "tour-close"]);

const driverObj = ref(null);

const tourSteps = [
  {
    element: ".account-section .title",
    popover: {
      title: "Раздел рассылок",
      description:
        "Это основной раздел управления рассылками. Здесь вы можете создавать, просматривать и управлять всеми вашими рассылками.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: ".add-account-button",
    popover: {
      title: "Создать рассылку",
      description:
        "Нажмите эту кнопку для создания новой рассылки. Перед созданием система проверит статус вашей подписки.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: ".mailing-list-section",
    popover: {
      title: "Список рассылок",
      description:
        "Здесь отображаются все ваши созданные рассылки. Вы можете просматривать их статус, статистику и управлять ими.",
      side: "top",
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
    popoverClass: "custom-mailing-popover",
    doneBtnText: "Завершить обучение",
    closeBtnText: "Закрыть",
    nextBtnText: "Далее →",
    prevBtnText: "← Назад",

    onPopoverRender: (popover, { config }) => {
      const popoverElement = popover.popover;
      if (popoverElement) {
        // Фиксируем модалку внизу страницы по центру
        popoverElement.style.position = "fixed";
        popoverElement.style.bottom = "20px";
        popoverElement.style.left = "50%";
        popoverElement.style.transform = "translateX(-50%)";
        popoverElement.style.width = "90%";
        popoverElement.style.maxWidth = "500px";
        popoverElement.style.zIndex = "10002";
        popoverElement.style.margin = "0";

        // Явно отключаем любые попытки driver.js изменить позицию
        popoverElement.style.top = "auto";
        popoverElement.style.right = "auto";
      }
    },

    onHighlightStarted: (element) => {
      if (element?.node) {
        element.node.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.8)";
        element.node.style.borderRadius = "4px";
        element.node.style.transition = "box-shadow 0.2s ease";
        element.node.style.zIndex = "10001";
        element.node.style.position = "relative";
      }
    },

    onDeselected: (element) => {
      if (element?.node) {
        element.node.style.boxShadow = "";
        element.node.style.borderRadius = "";
        element.node.style.zIndex = "";
        element.node.style.position = "";
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
#mailing-tour {
  position: relative;
}
</style>

<style>
/* Глобальные стили для driver.js */
.custom-mailing-popover {
  z-index: 10002 !important;
  position: fixed !important;
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 90% !important;
  max-width: 500px !important;
  margin: 0 !important;
}

.driver-popover {
  z-index: 10002 !important;
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

/* Важно: переопределяем любые стили, которые driver.js может добавить */
.driver-popover[style] {
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 90% !important;
  max-width: 500px !important;
  top: auto !important;
  right: auto !important;
}

.driver-overlay {
  z-index: 10000 !important;
  opacity: 0.7 !important;
  background: #000 !important;
}

.driver-active-element {
  position: relative !important;
  z-index: 10001 !important;
}

/* Убираем стрелки */
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

.driver-highlighted-element {
  border-radius: 4px !important;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.8) !important;
}
</style>
