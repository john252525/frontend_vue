<template>
  <Teleport to="body">
    <!-- На шаге "создадим аккаунт вместе" не затемняем и не блокируем экран
         кликами вообще — пользователю нужно по-настоящему нажать кнопку и
         пройти форму добавления аккаунта, а не смотреть на подсказку поверх
         недоступного интерфейса. Вместо тёмной подложки — лёгкое подсвечивающее
         кольцо вокруг кнопки и плавающая табличка с инструкцией. -->
    <div v-if="isActive && !currentStep.guidedAction" class="ob-dim">
      <div class="ob-spot" :style="spotStyle"></div>
    </div>

    <div
      v-if="isActive && currentStep.guidedAction && targetRect.visible"
      class="ob-highlight-ring"
      :style="ringStyle"
    ></div>

    <div v-if="isActive" class="ob-layer">
      <button class="ob-skip" @click="close">Пропустить ✕</button>

      <template v-if="currentStep.guidedAction">
        <div class="ob-guide-pill">
          <div class="ob-guide-text" v-html="currentStep.text"></div>
        </div>
      </template>

      <template v-else>
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
            <svg v-if="stepIndex < activeSteps.length - 1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          </button>
        </div>
      </template>
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

// Диспатчим настоящее MouseEvent, а не вызываем el.click() — у SVGElement
// этого метода может не быть вовсе, и вызов молча роняет исключение,
// обрывая всю цепочку afterHide/finish (см. аналогичный баг в
// MailingOnboardingTour.vue, где так закрывался мастер рассылки).
const dispatchClick = (el) => {
  if (el) {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  }
  return el;
};

const clickIfExists = (selector) => dispatchClick(document.querySelector(selector));

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

  const btn = getTargetAccountRow()?.querySelector(".action-menu-button");
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

// Закрывает само меню управления аккаунтом, только если следующий шаг НЕ
// относится к той же группе — иначе оно остаётся открытым при переходах
// между её шагами (в т.ч. между шагами, которые поверх него открывают
// модалку тарифов/смены имени — само меню под ней никуда не девается).
const leaveControlMenuGroupIfNeeded = async (nextStep) => {
  if (nextStep?.group === "control-menu") return;
  clearRowHighlight();
  clickIfExists(".black-fon");
  await waitFrame(80);
};

const closeControlMenu = async (nextStep) => {
  await leaveControlMenuGroupIfNeeded(nextStep);
};

// Общий afterHide для шагов, которые поверх меню открывают отдельную
// модалку (тарифы, смена имени) — сначала закрывает именно её, затем, если
// пользователь уходит из всей группы целиком, закрывает и само меню.
const closeDetailModal = (closeSelector) => async (nextStep) => {
  clickIfExists(closeSelector);
  await waitFrame(80);
  await leaveControlMenuGroupIfNeeded(nextStep);
};

// Аккаунт, на который нужно указывать шаги после "create-account" — либо
// не задан при обычном запуске (первый существующий аккаунт), либо после
// реального создания нового (см. continueAfterAccountCreated).
const targetAccountKey = ref(null);

const getTargetAccountRow = () => {
  if (targetAccountKey.value) {
    const rows = Array.from(document.querySelectorAll(".account-row"));
    const match = rows.find(
      (el) => el.dataset.accountKey === targetAccountKey.value,
    );
    if (match) return match;
  }
  return document.querySelector(".account-row");
};

const allSteps = [
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
    // Показывается только пользователю без единого аккаунта (см. start()) —
    // не автоматизируем создание сами, а даём реально нажать кнопку и пройти
    // форму: это единственный шаг тура, требующий настоящего действия
    // пользователя, а не programmatic-клика.
    key: "create-account",
    guidedAction: true,
    getElement: () => document.querySelector(".add-account-button"),
    text:
      'Теперь давайте создадим ваш первый аккаунт вместе! Нажмите кнопку «Добавить аккаунт», выберите категорию <span class="hl">Messenger</span> и любой мессенджер — например WhatsApp или Telegram, заполните данные и сохраните. Мы подождём и продолжим показ уже на созданном аккаунте.',
  },
  {
    key: "account-card",
    getElement: getTargetAccountRow,
    text:
      'На <span class="hl">карточке</span> отображаются название аккаунта, его статус и подписка. По клику на карточку открывается <span class="hl">меню управления аккаунтом</span>.',
    calloutStyle: { top: "300px", left: "24px", maxWidth: "320px" },
    arrow: true,
    arrowStyle: { top: "120px", left: "430px", width: "110px", transform: "rotate(75deg)" },
  },
  {
    key: "account-modal",
    beforeShow: async () => {
      dispatchClick(getTargetAccountRow());
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
    key: "control-menu-subscription-detail",
    group: "control-menu",
    beforeShow: async () => {
      await openControlMenu();
      findActionByText("Подписка")?.click();
      await waitFrame(220);
    },
    afterHide: closeDetailModal(".modal-overlay .close-button"),
    getElement: () => document.querySelector(".modal-overlay .modal-container"),
    bare: true,
    text: 'Здесь вы можете выбрать и приобрести подходящий <span class="hl">тариф</span> для вашего аккаунта.',
    calloutStyle: { top: "280px", left: "24px", maxWidth: "260px" },
    arrow: true,
    arrowStyle: { top: "220px", left: "260px", width: "220px", transform: "rotate(40deg)" },
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
    key: "control-menu-rename-detail",
    group: "control-menu",
    beforeShow: async () => {
      await openControlMenu();
      findActionByText("Сменить имя")?.click();
      await waitFrame(180);
    },
    afterHide: closeDetailModal(".modal-overlay .close-btn"),
    getElement: () => document.querySelector(".modal-overlay .modal-content"),
    title: "ИЗМЕНЕНИЕ ИМЕНИ",
    titleStyle: { top: "60px", left: "3%", maxWidth: "480px" },
    bare: true,
    text: 'Здесь вы можете изменить <span class="hl">отображаемое имя</span> вашего аккаунта.',
    calloutStyle: { top: "260px", left: "24px", maxWidth: "280px" },
    arrow: true,
    arrowStyle: { top: "180px", left: "290px", width: "180px", transform: "rotate(35deg)" },
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

// Список шагов зависит от того, есть ли у пользователя уже хотя бы один
// аккаунт: если нет — включаем шаг "создадим вместе" и после него указываем
// на реально созданный аккаунт; если аккаунты уже есть — ведём себя как
// раньше, показывая шаги на первом существующем (см. start()).
const activeSteps = ref(allSteps);

const currentStep = computed(() => activeSteps.value[stepIndex.value] || {});

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
// Координаты ниже берём из pointRect даже когда он "невидим" — сам pointRect
// хранит последнее реальное измерение (trackTarget не сбрасывает top/left,
// только флаг visible), поэтому при исчезновении цели подсказка просто
// плавно гаснет на месте (opacity), а не прыгает в position:auto и обратно.
const dynamicCalloutStyle = computed(() => {
  if (isMobileViewport()) {
    return {
      top: `${Math.max(120, pointRect.top - 96)}px`,
      left: "16px",
      right: "16px",
      maxWidth: "none",
      opacity: pointRect.visible ? 1 : 0,
    };
  }
  return {
    top: `${pointRect.top - 6}px`,
    left: `${pointRect.left - CALLOUT_WIDTH - ARROW_WIDTH - ARROW_GAP * 2}px`,
    maxWidth: `${CALLOUT_WIDTH}px`,
    opacity: pointRect.visible ? 1 : 0,
  };
});

const dynamicArrowStyle = computed(() => {
  if (isMobileViewport()) return { opacity: 0 };
  return {
    top: `${pointRect.top - 22}px`,
    left: `${pointRect.left - ARROW_WIDTH - ARROW_GAP}px`,
    width: `${ARROW_WIDTH}px`,
    transform: "rotate(5deg)",
    opacity: pointRect.visible ? 1 : 0,
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
    // Цель ещё не найдена/сейчас меняется — схлопываем вырез в точку ПРЯМО
    // НА МЕСТЕ (в центре последней известной цели), а не телепортируем его
    // за экран: box-shadow всё так же держит весь экран тёмным (вырез
    // нулевого размера), но CSS-переход при этом не гоняет подсветку через
    // весь экран туда-обратно на каждом шаге — только плавно "схлопывается"
    // и "раскрывается" на месте.
    const cx = targetRect.left + targetRect.width / 2;
    const cy = targetRect.top + targetRect.height / 2;
    return {
      top: `${cy}px`,
      left: `${cx}px`,
      width: "0px",
      height: "0px",
    };
  }
  return {
    top: `${targetRect.top - PADDING}px`,
    left: `${targetRect.left - PADDING}px`,
    width: `${targetRect.width + PADDING * 2}px`,
    height: `${targetRect.height + PADDING * 2}px`,
  };
});

// Подсвечивающее кольцо вокруг кнопки на шаге "создадим аккаунт вместе" —
// в отличие от spotStyle не гасит остальной экран, только обводит цель.
const ringStyle = computed(() => ({
  top: `${targetRect.top - PADDING}px`,
  left: `${targetRect.left - PADDING}px`,
  width: `${targetRect.width + PADDING * 2}px`,
  height: `${targetRect.height + PADDING * 2}px`,
}));

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

// Хук может кликать по реальным элементам страницы (селекторы могут
// перестать совпадать после правок вёрстки) — если он бросит исключение,
// оно не должно заблокировать навигацию по туру и оставить оверлей
// висящим поверх страницы намертво.
const safeCall = async (fn, ...args) => {
  try {
    await fn?.(...args);
  } catch (e) {
    console.error("AccountsOnboardingTour hook failed:", e);
  }
};

// Прыжок на шаг БЕЗ afterHide предыдущего — нужен обычному первому шагу,
// у которого попросту нет предыдущего.
const jumpToStep = async (index) => {
  stepIndex.value = index;
  targetRect.visible = false;
  pointRect.visible = false;

  const step = activeSteps.value[index];
  await safeCall(step?.beforeShow);

  await nextTick();
};

const goToStep = async (index) => {
  const prevStep = activeSteps.value[stepIndex.value];
  await safeCall(prevStep?.afterHide, activeSteps.value[index]);
  await jumpToStep(index);
};

const start = async () => {
  isActive.value = true;
  stopTracking();

  // Шаг "создадим аккаунт вместе" показываем только тому, у кого ещё нет ни
  // одного аккаунта — иначе тур каждый раз заставлял бы уже опытного
  // пользователя создавать лишний аккаунт просто чтобы посмотреть подсказки.
  const hasExistingAccount = !!document.querySelector(".account-row");
  activeSteps.value = hasExistingAccount
    ? allSteps.filter((s) => s.key !== "create-account")
    : allSteps;
  targetAccountKey.value = null;

  await jumpToStep(0);
  trackTarget();
};

// Вызывается из Account.vue сразу после того, как форма добавления
// аккаунта реально отработала успешно (и список аккаунтов уже обновлён) —
// страница больше не перезагружается, поэтому продолжаем показ в рамках
// того же инстанса компонента, просто определив, какая строка новая.
const continueAfterAccountCreated = async (accountKey) => {
  if (currentStep.value.key !== "create-account" || !accountKey) return;

  targetAccountKey.value = accountKey;
  activeSteps.value = allSteps.filter((s) => s.key !== "create-account");

  const idx = activeSteps.value.findIndex((s) => s.key === "account-card");
  stopTracking();
  await jumpToStep(idx >= 0 ? idx : 0);
  trackTarget();
};

const next = async () => {
  if (stepIndex.value >= activeSteps.value.length - 1) {
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
  await safeCall(activeSteps.value[stepIndex.value]?.afterHide);
  isActive.value = false;
  emit("tour-complete");
};

const close = async () => {
  stopTracking();
  await safeCall(activeSteps.value[stepIndex.value]?.afterHide);
  isActive.value = false;
  emit("tour-close");
};

onBeforeUnmount(() => {
  stopTracking();
});

defineExpose({ start, continueAfterAccountCreated });
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
  transition:
    top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease;
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

/* Кольцо вокруг кнопки "Добавить аккаунт" на шаге "создадим вместе" — сама
   страница остаётся полностью интерактивной (см. .ob-dim, который на этом
   шаге не рендерится вовсе), кольцо только помогает найти нужную кнопку. */
.ob-highlight-ring {
  position: fixed;
  z-index: 999997;
  border-radius: 10px;
  pointer-events: none;
  box-shadow: 0 0 0 3px rgba(34, 217, 42, 0.85);
  animation: ob-ring-pulse 1.6s ease-in-out infinite;
  transition:
    top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes ob-ring-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 3px rgba(34, 217, 42, 0.85);
  }
  50% {
    box-shadow: 0 0 0 7px rgba(34, 217, 42, 0.35);
  }
}

/* Плавающая табличка-инструкция на шаге "создадим вместе" — не перекрывает
   реальную форму добавления аккаунта (та открывается по центру экрана),
   поэтому размещена вверху и не затемняет ничего вокруг. */
.ob-guide-pill {
  position: absolute;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 480px;
  width: calc(100% - 32px);
  background: rgba(15, 23, 42, 0.94);
  border: 1px solid rgba(34, 217, 42, 0.4);
  border-radius: 16px;
  padding: 18px 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  pointer-events: auto;
}

.ob-guide-text {
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
}

.ob-guide-text :deep(.hl) {
  color: #22d92a;
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
