<template>
  <Teleport to="body">
    <div v-if="isActive" class="ob-dim" :style="{ top: dimTop + 'px' }">
      <div class="ob-spot" :style="spotStyle"></div>
    </div>

    <div v-if="isActive" class="ob-layer" :style="{ top: dimTop + 'px' }">
      <button class="ob-skip" @click="close">Пропустить ✕</button>

      <div v-if="currentStep.title" class="ob-title" :style="currentStep.titleStyle">
        {{ currentStep.title }}
      </div>

      <div
        class="ob-text"
        :style="currentStep.textStyle"
        v-html="currentStep.text"
      ></div>

      <svg
        v-if="currentStep.arrow"
        class="ob-arrow"
        :style="arrowStyle"
        width="173"
        height="91"
        viewBox="0 0 173 91"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.0895 2.49977C-4.05967 60.5189 55.3373 104.402 94.6454 81.3623C116.391 68.6167 100.049 39.9005 89.4225 44.9912C78.7957 50.0818 86.3641 69.6847 104.785 66.7333C123.206 63.782 147.745 49.7812 170.02 22.7661M155.694 25.4637L170.02 22.7661L170.458 37.63"
          stroke="#22D92A"
          stroke-width="5"
          stroke-miterlimit="16"
          stroke-linecap="round"
        />
      </svg>

      <div class="ob-nav">
        <button class="ob-nav-btn" :disabled="stepIndex === 0" @click="prev">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button class="ob-nav-btn" @click="next">
          <svg v-if="stepIndex < steps.length - 1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount, nextTick } from "vue";

const emit = defineEmits(["tour-complete", "tour-close"]);

// Отступ сверху — под шапкой сайта (лого/уведомления/баланс), её не затемняем.
// Меряем реальную высоту хедера сайта, т.к. в разных темах/доменах она отличается.
const dimTop = ref(57);
const PADDING = 10;

const measureDimTop = () => {
  const headerEl = document.querySelector(".header-content")?.closest("header");
  if (headerEl) {
    const rect = headerEl.getBoundingClientRect();
    if (rect.bottom > 0) dimTop.value = Math.round(rect.bottom);
  }
};

const isActive = ref(false);
const stepIndex = ref(0);
const targetRect = reactive({ top: 0, left: 0, width: 0, height: 0, visible: false });

let rafId = null;

const waitFrame = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

const clickIfExists = (selector) => {
  const el = document.querySelector(selector);
  if (el) el.click();
  return el;
};

const steps = [
  {
    key: "list-overview",
    getElement: () => document.querySelector(".account-list-section"),
    text:
      'Здесь отображается вся информация о ваших <span class="hl">Аккаунтах</span> — список, их состояние и основные данные.',
    textStyle: { top: "16%", left: "4%", maxWidth: "360px" },
    arrow: true,
    arrowStyle: { top: "24%", left: "34%", width: "130px", transform: "rotate(90deg)" },
  },
  {
    key: "intro",
    getElement: () => document.querySelector(".accounts-onboarding-header"),
    text:
      'Отсюда вы управляете <span class="hl">Аккаунтами</span>: создаёте новые, фильтруете существующие и переключаетесь между аккаунтами и группами.',
    textStyle: { top: "220px", left: "5%", maxWidth: "420px" },
    arrow: true,
    arrowStyle: { top: "0px", left: "60%", width: "150px", transform: "rotate(0deg)" },
  },
  {
    key: "account-card",
    getElement: () => document.querySelector(".account-row"),
    text:
      'На <span class="hl">карточке</span> отображаются название аккаунта, его статус и подписка. По клику на карточку открывается <span class="hl">меню управления аккаунтом</span>.',
    textStyle: { top: "38%", left: "4%", maxWidth: "380px" },
    arrow: true,
    arrowStyle: { top: "22%", left: "44%", width: "140px", transform: "rotate(10deg)" },
  },
  {
    key: "account-modal",
    beforeShow: async () => {
      clickIfExists(".account-row");
      await waitFrame(120);
    },
    afterHide: async () => {
      clickIfExists(".modal-overlay .close-btn");
      await waitFrame(80);
    },
    getElement: () => document.querySelector(".modal-overlay .modal-content"),
    text:
      "Здесь отображается подробная информация и настройки вашего <span class=\"hl\">аккаунта</span>.",
    textStyle: { top: "40%", left: "4%", maxWidth: "340px" },
    arrow: true,
    arrowStyle: { top: "48%", left: "18%", width: "120px", transform: "rotate(-25deg)" },
  },
  {
    key: "control-menu",
    beforeShow: async () => {
      const btn = document.querySelector(".account-row .action-menu-button");
      if (btn) btn.click();
      await waitFrame(150);

      // Позиционируем меню сами: внутреннее авто-позиционирование (floating-ui)
      // завязано на event.currentTarget, который к моменту рендера уже теряется —
      // из-за этого меню улетало в левый верхний угол при программном клике.
      const list = document.querySelector(".action-list");
      if (list && btn) {
        const btnRect = btn.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();
        list.style.top = `${Math.round(btnRect.bottom + 8)}px`;
        list.style.left = `${Math.round(Math.max(8, btnRect.right - listRect.width))}px`;
      }
    },
    afterHide: async () => {
      clickIfExists(".black-fon");
      await waitFrame(80);
    },
    getElement: () => document.querySelector(".action-list"),
    title: "УПРАВЛЕНИЕ АККАУНТОМ",
    titleStyle: { top: "60px", left: "3%", maxWidth: "480px" },
    text: 'Это меню управления вашего <span class="hl">Аккаунта</span>',
    textStyle: { top: "220px", left: "56%", maxWidth: "260px" },
    arrow: true,
    arrowStyle: { top: "260px", left: "68%", width: "150px", transform: "rotate(15deg)" },
  },
];

const currentStep = computed(() => steps[stepIndex.value] || {});

const spotStyle = computed(() => {
  if (!targetRect.visible) {
    // Цель ещё не найдена/сейчас меняется — держим экран полностью тёмным,
    // без выреза (вырез за экраном), чтобы не было белой вспышки исходной страницы.
    return { top: "-9999px", left: "-9999px", width: "0px", height: "0px" };
  }
  return {
    top: `${targetRect.top - dimTop.value - PADDING}px`,
    left: `${targetRect.left - PADDING}px`,
    width: `${targetRect.width + PADDING * 2}px`,
    height: `${targetRect.height + PADDING * 2}px`,
  };
});

const arrowStyle = computed(() => {
  const step = currentStep.value;
  if (!step.arrow) return { opacity: 0 };
  return { ...step.arrowStyle, opacity: 1 };
});

const stopTracking = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

const trackTarget = () => {
  const step = currentStep.value;
  const el = step.getElement ? step.getElement() : null;

  if (el) {
    const rect = el.getBoundingClientRect();
    targetRect.top = rect.top;
    targetRect.left = rect.left;
    targetRect.width = rect.width;
    targetRect.height = rect.height;
    targetRect.visible = true;
  } else {
    targetRect.visible = false;
  }

  rafId = requestAnimationFrame(trackTarget);
};

const goToStep = async (index) => {
  const prevStep = steps[stepIndex.value];
  if (prevStep?.afterHide) {
    await prevStep.afterHide();
  }

  stepIndex.value = index;
  targetRect.visible = false;

  const nextStep = steps[stepIndex.value];
  if (nextStep?.beforeShow) {
    await nextStep.beforeShow();
  }

  await nextTick();
};

const start = async () => {
  measureDimTop();
  isActive.value = true;
  stopTracking();
  await goToStep(0);
  trackTarget();
};

const next = async () => {
  if (stepIndex.value >= steps.length - 1) {
    await finish();
    return;
  }
  stopTracking();
  await goToStep(stepIndex.value + 1);
  trackTarget();
};

const prev = async () => {
  if (stepIndex.value === 0) return;
  stopTracking();
  await goToStep(stepIndex.value - 1);
  trackTarget();
};

const finish = async () => {
  stopTracking();
  const step = steps[stepIndex.value];
  if (step?.afterHide) await step.afterHide();
  isActive.value = false;
  emit("tour-complete");
};

const close = async () => {
  stopTracking();
  const step = steps[stepIndex.value];
  if (step?.afterHide) await step.afterHide();
  isActive.value = false;
  emit("tour-close");
};

onBeforeUnmount(() => {
  stopTracking();
});

defineExpose({ start });
</script>

<style scoped>
.ob-dim {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 999998;
  pointer-events: auto;
}

.ob-spot {
  position: absolute;
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.78);
  transition:
    top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.ob-layer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999999;
  pointer-events: none;
}

.ob-skip {
  position: absolute;
  top: 16px;
  right: 24px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  cursor: pointer;
  pointer-events: auto;
  transition: color 0.2s ease;
}

.ob-skip:hover {
  color: #fff;
}

.ob-title {
  position: absolute;
  color: #fff;
  font-weight: 800;
  font-size: 48px;
  line-height: 1.08;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}

.ob-text {
  position: absolute;
  color: #fff;
  font-weight: 700;
  font-size: 21px;
  line-height: 1.5;
}

.ob-text :deep(.hl) {
  color: #22d92a;
}

.ob-arrow {
  position: absolute;
  height: auto;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.ob-nav {
  position: absolute;
  bottom: 32px;
  right: 28px;
  display: flex;
  gap: 12px;
  pointer-events: auto;
}

.ob-nav-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.ob-nav-btn:hover:not(:disabled) {
  transform: scale(1.06);
}

.ob-nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .ob-title {
    font-size: 30px;
  }

  .ob-text {
    font-size: 17px;
    max-width: 80% !important;
  }
}
</style>
