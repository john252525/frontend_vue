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
        :style="currentStep.calloutStyle"
        v-html="currentStep.text"
      ></div>
      <div v-else class="ob-callout" :style="currentStep.calloutStyle">
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

// Затемняем экран целиком, включая шапку сайта — ни один шаг тура её не
// подсвечивает.
const PADDING = 10;

const isActive = ref(false);
const stepIndex = ref(0);
const targetRect = reactive({ top: 0, left: 0, width: 0, height: 0, visible: false });

let rafId = null;

const waitFrame = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

// Диспатчим настоящее MouseEvent-событие, а не вызываем el.click() —
// у SVGElement (напр. крестик закрытия мастера рассылки) этого метода
// может не быть вовсе, и вызов молча роняет исключение, обрывая всю
// цепочку afterHide/finish.
const clickIfExists = (selector) => {
  const el = document.querySelector(selector);
  if (el) {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  }
  return el;
};

// Открывает мастер создания рассылки (если он ещё не открыт) — идемпотентно,
// поэтому безопасно вызывать заново при переходе между соседними шагами
// одной группы.
const openWizard = async () => {
  if (document.querySelector(".modal-overlay .modal-progress")) return;
  clickIfExists(".add-account-button");
  // Ждём проверку подписки (реальный запрос) и монтирование формы.
  await waitFrame(350);
};

const WIZARD_STEP_TITLES = ["Контакты", "Сообщение", "Настройки"];
const WIZARD_DUMMY_VALUES = [
  "79111111111;Иван",
  "Пример текста рассылки для демонстрации.",
];

// Реальные текстовые поля мастера защищены валидацией — просто кликнуть
// "Далее" программно нельзя, поэтому подставляем значение через нативный
// сеттер (чтобы Vue выхватил его как настоящий ввод) и только потом кликаем.
const fillActiveTextareaAndAdvance = async (value) => {
  const textarea = document.querySelector(
    ".modal-overlay .step-content textarea.form-control",
  );
  if (textarea) {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    ).set;
    nativeSetter.call(textarea, value);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }
  clickIfExists(".modal-overlay .btn-primary");
  await waitFrame(150);
};

// Переводит уже открытый мастер ровно на нужный шаг: вперёд — заполняя поле
// текущего шага и нажимая "Далее" (иначе валидация не пропустит), назад —
// кликом по заголовку шага в прогресс-баре (уже пройденные шаги доступны).
const goToWizardStep = (targetIndex) => async () => {
  await openWizard();

  for (let guard = 0; guard < WIZARD_STEP_TITLES.length + 1; guard += 1) {
    const activeTitle = document
      .querySelector(".modal-overlay .step.step-active .step-title")
      ?.textContent?.trim();
    const currentIndex = WIZARD_STEP_TITLES.indexOf(activeTitle);

    if (currentIndex === targetIndex || currentIndex === -1) break;

    if (currentIndex < targetIndex) {
      await fillActiveTextareaAndAdvance(WIZARD_DUMMY_VALUES[currentIndex]);
    } else {
      const stepEls = Array.from(document.querySelectorAll(".modal-overlay .step"));
      const target = stepEls.find(
        (el) =>
          el.querySelector(".step-title")?.textContent?.trim() ===
          WIZARD_STEP_TITLES[targetIndex],
      );
      target?.click();
      await waitFrame(150);
    }
  }
};

// Закрывает мастер, только если следующий шаг НЕ относится к той же группе.
const closeWizardIfLeavingGroup = async (nextStep) => {
  if (nextStep?.group === "add-mailing") return;
  clickIfExists(".modal-overlay .modal-close");
  await waitFrame(80);
};

const steps = [
  {
    key: "intro",
    getElement: () => document.querySelector(".list-container"),
    text:
      'Здесь отображаются все ваши <span class="hl">рассылки</span>. Вы можете отслеживать их текущий статус и оперативно управлять ими.',
    bare: true,
    calloutStyle: { top: "180px", left: "24px", maxWidth: "320px" },
    arrow: true,
    arrowStyle: { top: "95px", left: "230px", width: "130px", transform: "rotate(0deg)" },
  },
  {
    key: "row-overview",
    getElement: () => document.querySelector(".account-row"),
    text:
      'Это краткий виджет вашей <span class="hl">рассылки</span> в общем списке. На нём видны:' +
      '<ul class="ob-bullet-list">' +
      "<li>Название рассылки</li>" +
      "<li>Кнопки быстрых действий</li>" +
      "<li>Её текущий статус</li>" +
      "</ul>",
    bare: true,
    calloutStyle: { top: "300px", left: "24px", maxWidth: "300px" },
    arrow: true,
    arrowStyle: { top: "170px", left: "300px", width: "120px", transform: "rotate(80deg)" },
  },
  {
    key: "info-detail",
    beforeShow: async () => {
      clickIfExists('.account-row .action-btn[title="Информация"]');
      await waitFrame(150);
    },
    afterHide: async () => {
      clickIfExists(".modal-overlay .close-btn");
      await waitFrame(80);
    },
    getElement: () => document.querySelector(".modal-overlay .modal-content"),
    bare: true,
    text:
      '<span class="hl" style="display:block; font-size:20px; margin-bottom:8px;">Информация</span>' +
      "Здесь собраны все параметры и настройки, которые вы указали при создании.",
    calloutStyle: { top: "280px", left: "24px", maxWidth: "280px" },
    arrow: true,
    arrowStyle: { top: "180px", left: "290px", width: "200px", transform: "rotate(35deg)" },
  },
  {
    key: "edit-detail",
    beforeShow: async () => {
      clickIfExists(".account-row .action-btn.edit-btn");
      await waitFrame(150);
    },
    afterHide: async () => {
      clickIfExists(".modal-overlay .close-btn");
      await waitFrame(80);
    },
    getElement: () => document.querySelector(".modal-overlay .modal-content"),
    bare: true,
    text:
      '<span class="hl" style="display:block; font-size:20px; margin-bottom:8px;">Редактирование</span>' +
      "Здесь можно в любой момент изменить дни недели, интервалы, порядок отправки или скорректировать дополнительные параметры.",
    calloutStyle: { top: "260px", left: "24px", maxWidth: "280px" },
    arrow: true,
    arrowStyle: { top: "180px", left: "290px", width: "200px", transform: "rotate(35deg)" },
  },
  {
    key: "messages-detail",
    beforeShow: async () => {
      clickIfExists('.account-row .action-btn[title="Сообщения"]');
      await waitFrame(150);
    },
    afterHide: async () => {
      clickIfExists(".modal-overlay .close-button");
      await waitFrame(80);
    },
    getElement: () => document.querySelector(".modal-overlay .modal-container"),
    bare: true,
    text:
      '<span class="hl" style="display:block; font-size:20px; margin-bottom:8px;">Сообщения</span>' +
      "Детальный отчёт по каждому сообщению — вы всегда будете знать, какие сообщения успешно доставлены, а какие нет.",
    calloutStyle: { top: "260px", left: "24px", maxWidth: "280px" },
    arrow: true,
    arrowStyle: { top: "160px", left: "270px", width: "200px", transform: "rotate(45deg)" },
  },
  {
    key: "create-step1",
    group: "add-mailing",
    beforeShow: goToWizardStep(0),
    afterHide: closeWizardIfLeavingGroup,
    getElement: () => document.querySelector(".modal-overlay .modal-container"),
    bare: true,
    text:
      "Процесс создания рассылки состоит из трёх простых шагов:" +
      '<span class="hl" style="display:block; margin:8px 0;">Шаг 1</span>' +
      "Введите номера и имена абонентов вручную или загрузите их готовым списком из файла.",
    calloutStyle: { top: "260px", left: "24px", maxWidth: "300px" },
    arrow: true,
    arrowStyle: { top: "160px", left: "290px", width: "210px", transform: "rotate(40deg)" },
  },
  {
    key: "create-step2",
    group: "add-mailing",
    beforeShow: goToWizardStep(1),
    afterHide: closeWizardIfLeavingGroup,
    getElement: () => document.querySelector(".modal-overlay .modal-container"),
    bare: true,
    text:
      '<span class="hl" style="display:block; margin-bottom:8px;">Шаг 2</span>' +
      "Напишите текст, который увидят получатели. Также можете добавить изображение.",
    calloutStyle: { top: "260px", left: "24px", maxWidth: "280px" },
    arrow: true,
    arrowStyle: { top: "180px", left: "290px", width: "200px", transform: "rotate(35deg)" },
  },
  {
    key: "create-step3",
    group: "add-mailing",
    beforeShow: goToWizardStep(2),
    afterHide: closeWizardIfLeavingGroup,
    getElement: () => document.querySelector(".modal-overlay .modal-container"),
    bare: true,
    text:
      '<span class="hl" style="display:block; margin-bottom:8px;">Шаг 3</span>' +
      "Настройте рассылку под свои задачи — выберите дни недели, задайте интервал и порядок отправки сообщений, а также используйте дополнительные опции.",
    calloutStyle: { top: "260px", left: "24px", maxWidth: "280px" },
    arrow: true,
    arrowStyle: { top: "180px", left: "290px", width: "200px", transform: "rotate(35deg)" },
  },
];

const currentStep = computed(() => steps[stepIndex.value] || {});

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

// Хук может кликать по реальным элементам страницы (селекторы могут
// перестать совпадать после правок вёрстки) — если он бросит исключение,
// оно не должно заблокировать навигацию по туру и оставить оверлей
// висящим поверх страницы намертво.
const safeCall = async (fn, ...args) => {
  try {
    await fn?.(...args);
  } catch (e) {
    console.error("MailingOnboardingTour hook failed:", e);
  }
};

const goToStep = async (index) => {
  const prevStep = steps[stepIndex.value];
  await safeCall(prevStep?.afterHide, steps[index]);

  stepIndex.value = index;
  targetRect.visible = false;

  const nextStep = steps[stepIndex.value];
  await safeCall(nextStep?.beforeShow);

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

/* Сплошная тёмная карточка под текстом шага — гарантирует читаемость
   независимо от того, что находится под ней. */
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

.ob-text :deep(.ob-bullet-list) {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.ob-text :deep(.ob-bullet-list li) {
  position: relative;
  padding-left: 16px;
  margin-bottom: 2px;
}

.ob-text :deep(.ob-bullet-list li::before) {
  content: "";
  position: absolute;
  left: 2px;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22d92a;
}

.ob-text-bare {
  position: absolute;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  line-height: 1.5;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
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
    max-width: 70vw !important;
    font-size: 14px;
  }
}
</style>
