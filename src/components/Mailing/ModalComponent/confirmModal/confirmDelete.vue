<template>
  <div @click="changeDeleteMailing" class="black-fon"></div>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <transition name="fade">
    <section class="confirm-modal">
      <LoadMoadal
        v-if="loadStation"
        :text="t('mailingList.deleteMessageConfirm')"
      />
      <section class="cont" v-else>
        <article class="circle">
          <span>!</span>
        </article>
        <h2 class="title">{{ t("confirmDeleteMailing.title") }}</h2>
        <article class="button-cont">
          <button @click="deleteMailing" class="confirm-button">
            {{ t("confirmDeleteMailing.next") }}
          </button>
          <button @click="changeDeleteMailing" class="cansel-button">
            {{ t("confirmDeleteMailing.cansel") }}
          </button>
        </article>
      </section>
    </section>
  </transition>
</template>

<script setup>
import { toRefs, ref } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import axios from "axios";
import LoadMoadal from "../LoadModal/LoadModal.vue";
import { useRouter } from "vue-router";
const router = useRouter();
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
  changeResultModal: {
    type: Function,
  },
});

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};
const apiUrl = import.meta.env.VITE_WHATSAPI_URL;

const { selectedItem } = toRefs(props);
const loadStation = ref(false);

const deleteMailing = async () => {
  loadStation.value = true;
  const apiUrlMethod = `${apiUrl}/delete/${selectedItem.value.id}/`;

  try {
    const response = await axios.post(
      apiUrlMethod,
      {}, // пустое тело запроса, если нужно
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

    if (response.data.ok === true) {
      console.log("Рассылка успешно удалена:", response.data);
      props.refreshMailingLists();
      props.changeDeleteMailing();
      props.changeResultModal("false", "true");
      loadStation.value = false;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      errorBlock.value = true;
      console.log("Ошибка при удалении рассылки:", response.data);
    }
  } catch (error) {
    errorBlock.value = true;
    console.error(
      "Ошибка при отправке запроса:",
      error.response ? error.response.data : error.message
    );
    loadStation.value = false;
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
