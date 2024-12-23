<template>
  <div @click="ChangeconfirmStationReset" class="black-fon"></div>
  <transition name="fade">
    <section class="confirm-modal">
      <article class="circle">
        <span>!</span>
      </article>
      <h2 class="title">Вы подтверждаете cброс аккаунта?</h2>
      <article class="button-cont">
        <button class="confirm-button" @click="confirm">Продолжить</button>
        <button class="cansel-button" @click="ChangeconfirmStationReset">
          Отмена
        </button>
      </article>
    </section>
  </transition>
</template>

<script setup>
import { toRefs } from "vue";
import axios from "axios";
const props = defineProps({
  loadingStart: {
    type: Function,
  },
  changeStationLoadingModal: {
    type: Function,
  },
  ChangeconfirmStationReset: {
    type: Function,
  },
  selectedItem: {
    type: Object,
  },
  errorStationOn: {
    type: Function,
  },
  errorStationOff: {
    type: Function,
  },
  loadingStop: {
    type: Function,
  },
});

const { selectedItem } = toRefs(props);

const createRequest = async (request) => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/${request}`,
      {
        source: source,
        login: login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.ok === true) {
      if (request === "getNewProxy") {
        props.changeStationLoadingModal(true);
        props.loadingStop();
        setTimeout(() => {
          props.changeStationLoadingModal(false);
        }, 5000);
      } else {
        console.log(`${request} - Успешно`);
      }
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(`${request} - Ошибка`, error);
    props.errorStationOn();
    props.changeStationLoadingModal(true);
    setTimeout(() => {
      props.changeStationLoadingModal(false);
      props.errorStationOff();
    }, 5000);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const confirm = async () => {
  await props.ChangeconfirmStationReset();
  await props.loadingStart("Сброс аккаунта...");
  await createRequest("forceStop");
  await createRequest("clearSession");
  await createRequest("getNewProxy");
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
    /* transform: translate(0); */
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
