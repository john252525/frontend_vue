// Режимы распределения обращений внутри очереди (enum QueueMode на бэке).
export const QUEUE_MODES = [
  {
    id: "round_robin",
    label: "По кругу",
    hint: "Обращения раздаются сотрудникам по очереди, по одному.",
  },
  {
    id: "random",
    label: "Случайно",
    hint: "Обращение уходит случайному сотруднику из очереди.",
  },
  {
    id: "priority",
    label: "По приоритету",
    hint: "Сначала обращения получают сотрудники с большим приоритетом.",
  },
];

export const queueModeLabel = (modeId) =>
  QUEUE_MODES.find((mode) => mode.id === modeId)?.label || modeId || "—";
