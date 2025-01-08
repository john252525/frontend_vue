<template>
  <div @click="changeDeleteMailing" class="black-fon"></div>
  <transition name="fade">
    <section class="confirm-modal">
      <LoadMoadal v-if="loadStation" :text="'Удаление рассылки'" />
      <section class="cont" v-else>
        <article class="circle">
          <span>!</span>
        </article>
        <h2 class="title">Вы подтверждаете удаление рассылки?</h2>
        <article class="button-cont">
          <button @click="deleteMailing" class="confirm-button">
            Продолжить
          </button>
          <button @click="changeDeleteMailing" class="cansel-button">
            Отмена
          </button>
        </article>
      </section>
    </section>
  </transition>
</template>

<script setup>
import { toRefs, ref } from "vue";
import axios from "axios";
import LoadMoadal from "../LoadModal/LoadModal.vue";
const props = defineProps({
  selectedItem: {
    type: Object,
  },
  changeDeleteMailing: {
    type: Function,
  },
  refreshMailingLists: {
    type: Function,
  },
});

const { selectedItem } = toRefs(props);
const loadStation = ref(false);
const deleteMailing = async () => {
  loadStation.value = true;
  const apiUrl = `https://whatsapi.ru/ru/api/autosend/whatsapp/delete/${selectedItem.value.id}/`;
  const params = {
    token: "d7039fe337873da68d28945cd6e5c61d",
  };
  try {
    const response = await axios.post(apiUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.data.ok === true) {
      console.log("Рассылка успешно удалена:", response.data);
      props.refreshMailingLists();
      props.changeDeleteMailing();
      loadStation.value = false;
    } else {
      console.log("Ошибка при удалении рассылки:", response.data);
    }
  } catch (error) {
    console.error(
      "Ошибка при отправке запроса:",
      error.response ? error.response.data : error.message
    );
  }
};
</script>

<style scoped>
.confirm-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border-radius: 5px;
  width: 389px;
  height: 208px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.cont {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.circle {
  border: 2px solid #b73131;
  border-radius: 199px;
  width: 51px;
  height: 51px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
}

.circle span {
  font-weight: 500;
  font-size: 18px;
  color: #b73131;
}

.title {
  font-weight: 500;
  font-size: 16px;
  color: #8b8b8b;
  margin-bottom: 28px;
}

.button-cont {
  display: flex;
  align-self: center;
  gap: 16px;
}

.confirm-button {
  border-radius: 5px;
  width: 119px;
  height: 36px;
  background: #b73131;
  font-weight: 600;
  font-size: 12px;
  color: #fff;
}

.cansel-button {
  border: 0.5px solid #c3c3c3;
  border-radius: 5px;
  width: 119px;
  height: 36px;
  font-weight: 600;
  font-size: 12px;
  color: #000;
  background-color: transparent;
}

.confirm-modal.fade-enter-active,
.confirm-modal.fade-leave-active {
  transition: opacity 0.5s ease;
}
.confirm-modal.fade-enter,
.confirm-modal.fade-leave-to {
  opacity: 0;
}

.confirm-modal {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 420px) {
  .confirm-modal {
    width: 330px;
  }

  .title {
    font-size: 15px;
  }
}
</style>
