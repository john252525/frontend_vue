<template>
  <Teleport to="body">
    <div v-if="isActive" class="ob-dim">
      <div class="ob-spot" :style="spotStyle"></div>
    </div>

    <div v-if="isActive" class="ob-layer">
      <button class="ob-skip" @click="close">Пропустить ✕</button>

      <div class="ob-callout" :style="dynamicCalloutStyle">
        <div class="ob-text" v-html="currentStep.text"></div>
      </div>

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

const PADDING = 10;

const isActive = ref(false);
const stepIndex = ref(0);
const targetRect = reactive({ top: 0, left: 0, width: 0, height: 0, visible: false });

let rafId = null;

// Хук может обратиться к реальным элементам страницы — если он бросит
// исключение, оно не должно заблокировать навигацию по туру и оставить
// оверлей висящим поверх страницы намертво.
const safeCall = async (fn, ...args) => {
  try {
    await fn?.(...args);
  } catch (e) {
    console.error("ProfileOnboardingTour hook failed:", e);
  }
};

const steps = [
  {
    key: "info",
    getElement: () => document.querySelector(".info-section"),
    text:
      'Здесь вы можете <span class="hl">просмотреть</span> текущие данные своего профиля или <span class="hl">отредактировать</span> основную информацию о вашем аккаунте.',
    textLines: 4,
    arrow: true,
  },
  {
    key: "security",
    getElement: () => document.querySelector(".security-section"),
    text:
      'Используйте эту форму, чтобы <span class="hl">обновить</span> доступы к личному кабинету. Для смены <span class="hl">пароля</span> введите ваш текущий пароль, укажите новый и нажмите кнопку «<span class="hl">Обновить пароль</span>».',
    textLines: 5,
    arrow: true,
  },
  {
    key: "integration",
    getElement: () => document.querySelector(".integration-settings"),
    text:
      'В этой вкладке вы можете <span class="hl">настраивать</span> интеграции для вашей работы.',
    textLines: 2,
    arrow: true,
  },
  {
    key: "inn",
    getElement: () => document.querySelector(".inn-settings"),
    text:
      'Этот блок необходим для автоматического формирования закрывающих документов. Введите ваш <span class="hl">ИНН</span> (10 или 12 цифр) в поле ввода и нажмите «<span class="hl">Сохранить</span>», чтобы данные автоматически подставлялись при будущих генерациях <span class="hl">счетов</span> для оплаты сервиса.',
    textLines: 7,
    arrow: true,
  },
];

// Карточки лежат в адаптивной сетке (число строк/колонок зависит от того,
// сколько блоков рендерится выше — баланс, быстрые ссылки и т.п.), поэтому
// фиксированные пиксельные координаты текста/стрелки были бы хрупкими.
// Вместо этого позиционируем подсказку и стрелку от реальных координат
// подсвеченной карточки — под ней всегда достаточно тёмного пространства,
// независимо от того, в какой колонке/строке она оказалась.
const CALLOUT_WIDTH = 360;
const ARROW_W = 110;
const ARROW_H = ARROW_W * (91 / 173); // натуральная (неповёрнутая) высота SVG
const EDGE_GAP = 14; // зазор между стрелкой и целью/текстом, чтобы не наслаивались
const ROTATE_BELOW = 280;
const ROTATE_ABOVE = 100;

// transform: rotate() поворачивает элемент вокруг его центра, но CSS
// top/left по-прежнему задают НЕповёрнутый бокс — при повороте, близком
// к 90°, видимый силуэт стрелки становится намного выше и уже, чем сам
// бокс (ширина и высота фактически меняются местами). Без этого пересчёта
// стрелка визуально вылезает за пределы отведённого под неё зазора и
// перекрывает то текст, то саму карточку.
const rotatedSize = (deg) => {
  const rad = (deg * Math.PI) / 180;
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  return { w: ARROW_W * c + ARROW_H * s, h: ARROW_W * s + ARROW_H * c };
};

const EFF_BELOW = rotatedSize(ROTATE_BELOW);
const EFF_ABOVE = rotatedSize(ROTATE_ABOVE);

// CSS-координата top для НЕповёрнутого бокса, при которой видимый после
// поворота силуэт стрелки начинается ровно в visualTop.
const arrowCssTop = (visualTop, effH) => visualTop - ARROW_H / 2 + effH / 2;

const currentStep = computed(() => steps[stepIndex.value] || {});

const LINE_HEIGHT = 24; // font-size 16px * line-height 1.5
const TEXT_PADDING = 8;

// Сколько места нужно под стрелку + текст ЭТОГО шага (у текста разная
// длина — короткая подпись у "Интеграции" и длинная у "Реквизитов" требуют
// разного запаса, единая константа для всех шагов регулярно оказывалась то
// избыточной, то недостаточной).
const requiredSpace = computed(() => {
  const lines = currentStep.value.textLines || 4;
  return EDGE_GAP + EFF_BELOW.h + EDGE_GAP + lines * LINE_HEIGHT + TEXT_PADDING;
});

// Сравниваем реально доступное место И сверху, И снизу от цели — карточки
// стоят в адаптивной сетке, соседний ряд может быть как сверху, так и
// снизу, поэтому нельзя заранее считать одну сторону "безопасной".
const placement = computed(() => {
  if (!targetRect.visible) return "below";
  const needed = requiredSpace.value;
  const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height);
  const spaceAbove = targetRect.top;
  if (spaceBelow >= needed) return "below";
  if (spaceAbove >= needed) return "above";
  return spaceAbove > spaceBelow ? "above" : "below";
});

// Минимальный отступ от края экрана и приблизительная высота карточки
// (используется, чтобы прижать её к экрану, если оценка textLines чуть
// разошлась с реальным рендером — лучше слегка наложиться на соседний
// элемент, чем незаметно обрезать часть текста за пределами viewport).
const VIEWPORT_EDGE = 12;
const estimatedCardHeight = computed(
  () => (currentStep.value.textLines || 4) * LINE_HEIGHT + TEXT_PADDING + 36,
);

// targetRect хранит последнее реальное измерение даже когда сам он
// "невидим" (trackTarget не сбрасывает top/left/width/height, только флаг
// visible) — поэтому ниже координаты считаем всегда, а не только пока
// видимо, и просто гасим прозрачность в 0. Так карточка и стрелка плавно
// исчезают/появляются на месте, а не дёргаются в position:auto и обратно.
const dynamicCalloutStyle = computed(() => {
  const opacity = targetRect.visible ? 1 : 0;
  const base = {
    left: `${targetRect.left}px`,
    maxWidth: `${Math.min(CALLOUT_WIDTH, targetRect.width)}px`,
    maxHeight: `calc(100vh - ${VIEWPORT_EDGE * 2}px)`,
    overflowY: "auto",
    opacity,
  };
  if (placement.value === "above") {
    // Текст — над стрелкой, стрелка — над целью. Работаем через top (а не
    // bottom), чтобы всегда можно было прижать карточку к VIEWPORT_EDGE и
    // не дать ей уйти за верхний край экрана невидимой.
    const arrowVisualBottom = targetRect.top - EDGE_GAP;
    const arrowVisualTop = arrowVisualBottom - EFF_ABOVE.h;
    const textBottom = arrowVisualTop - EDGE_GAP;
    const desiredTop = textBottom - estimatedCardHeight.value;
    return { ...base, top: `${Math.max(VIEWPORT_EDGE, desiredTop)}px` };
  }
  const arrowVisualTop = targetRect.top + targetRect.height + EDGE_GAP;
  const textTop = arrowVisualTop + EFF_BELOW.h + EDGE_GAP;
  return { ...base, top: `${textTop}px` };
});

const dynamicArrowStyle = computed(() => {
  const opacity = targetRect.visible ? 1 : 0;
  const left = `${targetRect.left + targetRect.width / 2 - ARROW_W / 2}px`;
  if (placement.value === "above") {
    const arrowVisualBottom = targetRect.top - EDGE_GAP;
    const arrowVisualTop = arrowVisualBottom - EFF_ABOVE.h;
    return {
      top: `${arrowCssTop(arrowVisualTop, EFF_ABOVE.h)}px`,
      left,
      width: `${ARROW_W}px`,
      transform: `rotate(${ROTATE_ABOVE}deg)`,
      opacity,
    };
  }
  const arrowVisualTop = targetRect.top + targetRect.height + EDGE_GAP;
  return {
    top: `${arrowCssTop(arrowVisualTop, EFF_BELOW.h)}px`,
    left,
    width: `${ARROW_W}px`,
    transform: `rotate(${ROTATE_BELOW}deg)`,
    opacity,
  };
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

const arrowStyle = computed(() => {
  const step = currentStep.value;
  if (!step.arrow) return { opacity: 0 };
  return dynamicArrowStyle.value;
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
  await safeCall(prevStep?.afterHide, steps[index]);

  stepIndex.value = index;
  targetRect.visible = false;

  const nextStep = steps[stepIndex.value];
  await safeCall(nextStep?.beforeShow);

  // Сетка блоков профиля обычно выше окна — без прокрутки подсветка могла
  // бы указывать на часть страницы, скрытую за нижним краем экрана.
  const el = nextStep?.getElement ? nextStep.getElement() : null;
  el?.scrollIntoView({ block: "center", behavior: "smooth" });

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
  await safeCall(steps[stepIndex.value]?.afterHide);
  isActive.value = false;
  emit("tour-complete");
};

const close = async () => {
  stopTracking();
  await safeCall(steps[stepIndex.value]?.afterHide);
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

/* Сплошная тёмная карточка под текстом — карточки профиля стоят в сетке с
   align-items:stretch, поэтому "пустое" место под короткой карточкой на
   самом деле остаётся её собственным светлым фоном, а не затемнением
   страницы; без непрозрачной подложки текст на нём терялся бы. */
.ob-callout {
  position: absolute;
  background: rgba(15, 23, 42, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 18px 22px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  transition:
    top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease;
}

.ob-text {
  color: #fff;
  font-weight: 700;
  font-size: 16px;
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
  .ob-callout {
    max-width: 75vw !important;
    padding: 14px 16px;
  }

  .ob-text {
    font-size: 14px;
  }
}
</style>
