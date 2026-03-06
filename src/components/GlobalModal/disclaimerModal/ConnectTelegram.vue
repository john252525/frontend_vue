<template>
  <ModalFrame :text="modalText" :close="close" :action="getLink">
    <div class="modal-body">
      <p>Вы собираетесь активировать системные уведомления в Telegram-бот.</p>

      <div class="warning-box">
        <span class="warning-icon-inline">⚠️</span>
        Если у вас уже подключены <strong>другие интеграции</strong> для
        Telegram, это может привести к появлению
        <strong>ложных уведомлений об ошибках</strong> из-за конфликта вебхуков.
      </div>
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref } from "vue";
import ModalFrame from "../ModalFrame.vue";

const props = defineProps({
  close: { type: Function },
  getLink: { type: Function },
});

const modalText = {
  title: "Внимание",
  close: "Отмена",
  action: "Подключить",
};
</script>

<style scoped>
/* Обновленный стиль для предупреждения */
.warning-box {
  background: #fffaf0; /* Более теплый оттенок для внимания */
  border-left: 4px solid #f6ad55; /* Оранжевый акцент */
  padding: 14px;
  margin-top: 15px;
  font-size: 14px;
  line-height: 1.5;
  color: #744210;
  border-radius: 4px;
}

.warning-icon-inline {
  margin-right: 4px;
}

/* Остальные стили оставляем без изменений для сохранения дизайна */
.modal-body p {
  color: #1e293b;
  margin-bottom: 10px;
}
</style>
