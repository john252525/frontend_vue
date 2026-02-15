<template>
  <ModalFrame :text="modalText" :close="close" :action="getLink">
    <div class="modal-body">
      <p>Вы собираетесь активировать Telegram-уведомления.</p>
      <div class="warning-box">
        Если у вас уже подключены другие каналы связи, это может привести к
        <strong>дублированию сообщений</strong>.
      </div>
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref } from "vue";
import ModalFrame from "../ModalFrame.vue";

const props = defineProps({
  close: {
    type: Function,
  },
  getLink: {
    type: Function,
  },
});

const modalText = {
  title: "Внимание",
  close: "Отмена",
  action: "Подключить",
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.warning-icon {
  background: #fff7ed;
  color: #ea580c;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 20px;
}

.warning-box {
  background: #f8fafc;
  border-left: 4px solid #cbd5e1;
  padding: 12px;
  margin-top: 15px;
  font-size: 14px;
  color: #64748b;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.btn-confirm {
  flex: 2;
  background: #0f172a;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  flex: 1;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
</style>
