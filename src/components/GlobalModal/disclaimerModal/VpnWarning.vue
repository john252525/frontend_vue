<template>
  <ModalFrame :text="modalText" :close="close" :action="continueAction">
    <div class="modal-body">
      <p>Перед авторизацией отключите VPN на этом устройстве.</p>

      <div class="warning-box">
        <span class="warning-icon-inline">⚠️</span>
        Если VPN останется включённым, авторизация
        <strong>не сработает</strong>.
      </div>
    </div>
  </ModalFrame>
</template>

<script setup>
import ModalFrame from "../ModalFrame.vue";

defineProps({
  close: { type: Function },
  continueAction: { type: Function },
});

const modalText = {
  title: "Внимание",
  close: "Отмена",
  action: "ВПН выключен, продолжить",
};
</script>

<style scoped>
.warning-box {
  background: #fffaf0;
  border-left: 4px solid #f6ad55;
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

.modal-body p {
  color: #1e293b;
  margin-bottom: 10px;
}
</style>
