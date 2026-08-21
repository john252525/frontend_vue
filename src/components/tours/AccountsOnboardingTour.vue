<template>
  <Teleport to="body">
    <div v-if="isActive" class="ob-dim">
      <div class="ob-spot" :style="spotStyle"></div>
    </div>

    <div v-if="isActive" class="ob-layer">
      <button class="ob-skip" @click="close">Пропустить ✕</button>

      <div v-if="currentStep.title" class="ob-title" :style="currentStep.titleStyle">
        {{ currentStep.title }}
      </div>

      <div
        v-if="currentStep.bare"
        class="ob-text ob-text-bare"
        :style="effectiveCalloutStyle"
        v-html="currentStep.text"
      ></div>
      <div v-else class="ob-callout" :style="currentStep.calloutStyle">
        <div class="ob-text" v-html="currentStep.text"></div>
      </div>

      <svg
        v-if="currentStep.arrow"
        class="ob-arrow"
        :style="effectiveArrowStyle"
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

// Затемняем экран целиком, включая шапку сайта — ни один шаг тура её не
// подсвечивает, поэтому у неё нет причин оставаться единственным не
// затемнённым местом на экране на протяжении всего тура.
const PADDING = 10;

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

// Пункты меню управления аккаунтом не имеют уникальных классов/id — находим
// их по видимому тексту (тот же текст, что показывается пользователю).
const findActionByText = (text) => {
  const items = document.querySelectorAll(".action-list .action");
  return Array.from(items).find((el) => el.textContent.trim() === text) || null;
};

// Открывает меню управления аккаунтом (если оно ещё не открыто) и
// позиционирует его под кнопкой строки. Общий beforeShow для всех шагов
// группы "control-menu" — идемпотентен, поэтому безопасно вызывать заново
// при переходе между соседними шагами одной группы (меню просто остаётся
// открытым, без лишнего перещёлкивания и повторных запросов).
const openControlMenu = async () => {
  if (document.querySelector(".action-list")) return;

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
};

// Закрывает меню, только если следующий шаг НЕ относится к той же группе —
// иначе оно остаётся открытым при переходах между её шагами.
const closeControlMenu = async (nextStep) => {
  if (nextStep?.group === "control-menu") return;
  clearRowHighlight();
  clickIfExists(".black-fon");
  await waitFrame(80);
};

const steps = [
  {
    key: "list-overview",
    getElement: () => document.querySelector(".account-list-section"),
    text:
      'Здесь отображается вся информация о ваших <span class="hl">Аккаунтах</span> — список, их состояние и основные данные.',
    calloutStyle: { top: "140px", left: "24px", maxWidth: "300px" },
    arrow: true,
    arrowStyle: { top: "300px", left: "220px", width: "110px", transform: "rotate(100deg)" },
  },
  {
    key: "intro",
    getElement: () => document.querySelector(".accounts-onboarding-header"),
    text:
      'Отсюда вы управляете <span class="hl">Аккаунтами</span>: создаёте новые, фильтруете существующие и переключаетесь между аккаунтами и группами.',
    calloutStyle: { top: "180px", left: "24px", maxWidth: "320px" },
    arrow: true,
    arrowStyle: { top: "95px", left: "51%", width: "130px", transform: "rotate(0deg)" },
  },
  {
    key: "account-card",
    getElement: () => document.querySelector(".account-row"),
    text:
      'На <span class="hl">карточке</span> отображаются название аккаунта, его статус и подписка. По клику на карточку открывается <span class="hl">меню управления аккаунтом</span>.',
    calloutStyle: { top: "300px", left: "24px", maxWidth: "320px" },
    arrow: true,
    arrowStyle: { top: "120px", left: "430px", width: "110px", transform: "rotate(75deg)" },
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
    calloutStyle: { top: "420px", left: "24px", maxWidth: "300px" },
    arrow: true,
    arrowStyle: { top: "300px", left: "300px", width: "120px", transform: "rotate(75deg)" },
  },
  {
    key: "control-menu-subscription",
    group: "control-menu",
    beforeShow: openControlMenu,
    afterHide: closeControlMenu,
    getElement: () => document.querySelector(".action-list"),
    pointAt: () => findActionByText("Подписка"),
    title: "УПРАВЛЕНИЕ АККАУНТОМ",
    titleStyle: { top: "60px", left: "3%", maxWidth: "480px" },
    bare: true,
    text: '<span class="hl">Управление подпиской</span> — изменение тарифного плана и условий подписки',
    arrow: true,
  },
  {
    key: "control-menu-rename",
    group: "control-menu",
    beforeShow: openControlMenu,
    afterHide: closeControlMenu,
    getElement: () => document.querySelector(".action-list"),
    pointAt: () => findActionByText("Сменить имя"),
    title: "УПРАВЛЕНИЕ АККАУНТОМ",
    titleStyle: { top: "60px", left: "3%", maxWidth: "480px" },
    bare: true,
    text: '<span class="hl">Переименование аккаунта</span> — изменение отображаемого имени',
    arrow: true,
  },
  {
    key: "control-menu-enable",
    group: "control-menu",
    beforeShow: openControlMenu,
    afterHide: closeControlMenu,
    getElement: () => document.querySelector(".action-list"),
    pointAt: () => document.querySelector(".action-list .action-on"),
    title: "УПРАВЛЕНИЕ АККАУНТОМ",
    titleStyle: { top: "60px", left: "3%", maxWidth: "480px" },
    bare: true,
    text: 'Чтобы активировать аккаунт, его необходимо привязать к <span class="hl">мессенджеру</span>. Нажмите кнопку «Включить» — откроется окно с несколькими способами подключения.',
    arrow: true,
  },
  {
    key: "control-menu-disable",
    group: "control-menu",
    beforeShow: openControlMenu,
    afterHide: closeControlMenu,
    getElement: () => document.querySelector(".action-list"),
    pointAt: () => findActionByText("Выключить"),
    title: "УПРАВЛЕНИЕ АККАУНТОМ",
    titleStyle: { top: "60px", left: "3%", maxWidth: "480px" },
    bare: true,
    text: '<span class="hl">Отключить аккаунт</span> — временная деактивация без удаления данных',
    arrow: true,
  },
  {
    key: "control-menu-reset",
    group: "control-menu",
    beforeShow: openControlMenu,
    afterHide: closeControlMenu,
    getElement: () => document.querySelector(".action-list"),
    pointAt: () => document.querySelector(".action-list .action-throw"),
    title: "УПРАВЛЕНИЕ АККАУНТОМ",
    titleStyle: { top: "60px", left: "3%", maxWidth: "480px" },
    bare: true,
    text: '<span class="hl">Сброс данных</span> — удаление всех сохранённых данных с сохранением аккаунта',
    arrow: true,
  },
  {
    key: "control-menu-delete",
    group: "control-menu",
    beforeShow: openControlMenu,
    afterHide: closeControlMenu,
    getElement: () => document.querySelector(".action-list"),
    pointAt: () => document.querySelector(".action-list .action-delete"),
    title: "УПРАВЛЕНИЕ АККАУНТОМ",
    titleStyle: { top: "60px", left: "3%", maxWidth: "480px" },
    bare: true,
    text: '<span class="hl">Удаление аккаунта</span> — полное и безвозвратное удаление аккаунта',
    arrow: true,
  },
];

const currentStep = computed(() => steps[stepIndex.value] || {});

// Для шагов с `pointAt` (пункты меню управления аккаунтом) подсветка
// (spotStyle) остаётся на всём меню целиком — читаемы все пункты сразу, как
// в макете — а `pointRect` отслеживает конкретный пункт, к которому текст
// шага относится, и по нему же строятся положения текста и стрелки.
const pointRect = reactive({ top: 0, left: 0, width: 0, height: 0, visible: false });

let highlightedEl = null;

const clearRowHighlight = () => {
  if (highlightedEl) {
    highlightedEl.classList.remove("ob-row-highlight");
    highlightedEl = null;
  }
};

const CALLOUT_WIDTH = 340;
const ARROW_WIDTH = 110;
const ARROW_GAP = 20;
const MOBILE_BREAKPOINT = 768;

const isMobileViewport = () =>
  typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT;

// На узких экранах меню занимает почти всю ширину — слева не остаётся места
// для текста и стрелки сбоку, поэтому текст переносится над подсвеченным
// пунктом на всю ширину экрана, а декоративная стрелка на мобильном скрыта.
const dynamicCalloutStyle = computed(() => {
  if (!pointRect.visible) return { opacity: 0 };
  if (isMobileViewport()) {
    return {
      top: `${Math.max(120, pointRect.top - 96)}px`,
      left: "16px",
      right: "16px",
      maxWidth: "none",
    };
  }
  return {
    top: `${pointRect.top - 6}px`,
    left: `${pointRect.left - CALLOUT_WIDTH - ARROW_WIDTH - ARROW_GAP * 2}px`,
    maxWidth: `${CALLOUT_WIDTH}px`,
  };
});

const dynamicArrowStyle = computed(() => {
  if (!pointRect.visible || isMobileViewport()) return { opacity: 0 };
  return {
    top: `${pointRect.top - 22}px`,
    left: `${pointRect.left - ARROW_WIDTH - ARROW_GAP}px`,
    width: `${ARROW_WIDTH}px`,
    transform: "rotate(5deg)",
    opacity: 1,
  };
});

const effectiveCalloutStyle = computed(() => {
  const step = currentStep.value;
  return step.pointAt ? dynamicCalloutStyle.value : step.calloutStyle;
});

const effectiveArrowStyle = computed(() => {
  const step = currentStep.value;
  if (!step.arrow) return { opacity: 0 };
  if (step.pointAt) return dynamicArrowStyle.value;
  return { ...step.arrowStyle, opacity: 1 };
});

const spotStyle = computed(() => {
  if (!targetRect.visible) {
    // Цель ещё не найдена/сейчас меняется — держим экран полностью тёмным,
    // без выреза (вырез за экраном), чтобы не было белой вспышки исходной страницы.
    return { top: "-9999px", left: "-9999px", width: "0px", height: "0px" };
  }
  return {
    top: `${targetRect.top - PADDING}px`,
    left: `${targetRect.left - PADDING}px`,
    width: `${targetRect.width + PADDING * 2}px`,
    height: `${targetRect.height + PADDING * 2}px`,
  };
});

const stopTracking = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  clearRowHighlight();
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

  const pointEl = step.pointAt ? step.pointAt() : null;
  if (pointEl) {
    const prect = pointEl.getBoundingClientRect();
    pointRect.top = prect.top;
    pointRect.left = prect.left;
    pointRect.width = prect.width;
    pointRect.height = prect.height;
    pointRect.visible = true;

    if (highlightedEl !== pointEl) {
      clearRowHighlight();
      pointEl.classList.add("ob-row-highlight");
      highlightedEl = pointEl;
    }
  } else {
    pointRect.visible = false;
    clearRowHighlight();
  }

  rafId = requestAnimationFrame(trackTarget);
};

const goToStep = async (index) => {
  const prevStep = steps[stepIndex.value];
  if (prevStep?.afterHide) {
    await prevStep.afterHide(steps[index]);
  }

  stepIndex.value = index;
  targetRect.visible = false;
  pointRect.visible = false;

  const nextStep = steps[stepIndex.value];
  if (nextStep?.beforeShow) {
    await nextStep.beforeShow();
  }

  await nextTick();
};

const start = async () => {
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
  top: 0;
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
  top: 0;
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

/* Сплошная тёмная карточка под текстом шага — гарантирует читаемость
   независимо от того, что находится под ней (светлая модалка, подсвеченная
   строка таблицы, сайдбар и т.п.), вместо расчёта на удачное совпадение
   белого текста с тёмным фоном на конкретном экране. */
.ob-callout {
  position: absolute;
  background: rgba(15, 23, 42, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
}

.ob-title {
  position: absolute;
  color: #fff;
  font-weight: 800;
  font-size: 48px;
  line-height: 1.08;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.6);
}

.ob-text {
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.5;
}

.ob-text :deep(.hl) {
  color: #22d92a;
}

/* Текст без карточки-подложки — используется для шагов, которые указывают
   на конкретный пункт уже подсвеченного меню (оно само остаётся светлым,
   поэтому текст стоит просто в тёмной зоне рядом с ним, как в макете),
   text-shadow подстраховывает читаемость на случай смещения. */
.ob-text-bare {
  position: absolute;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
  transition:
    top 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
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
  .ob-callout {
    max-width: 80% !important;
    padding: 16px 18px;
  }

  .ob-title {
    font-size: 30px;
    max-width: 80%;
  }

  .ob-text {
    font-size: 15px;
  }

  .ob-text-bare {
    font-size: 14px;
  }
}
</style>

<style>
/* Подсветка конкретного пункта меню управления аккаунтом — не scoped,
   т.к. .action-list принадлежит другому компоненту (Modal.vue), а тур
   лишь временно навешивает класс на его DOM-элемент через JS. */
.ob-row-highlight {
  background: rgba(34, 217, 42, 0.12) !important;
  box-shadow: inset 0 0 0 1px rgba(34, 217, 42, 0.45) !important;
  border-radius: 6px !important;
}
</style>
