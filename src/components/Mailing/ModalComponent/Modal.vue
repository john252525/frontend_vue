<template>
  <div @click="closeModal" v-if="isModalOpen" class="black-fon">
    <transition name="fade">
      <div
        class="action-list"
        :style="{
          top: modalPosition.top + 'px',
          left: modalPosition.left + 'px',
        }"
      >
        <span
          @click="updateStatus(1)"
          v-if="selectedItem.state === 0"
          class="action"
          >Включить</span
        >
        <span
          @click="updateStatus(0)"
          v-if="selectedItem.state === 1"
          class="action"
          >Выключить</span
        >
        <span @click="changeInfoMailing" class="action">Информация</span>
        <span @click="changeisEditMailing" class="action">Редактировать</span>
        <span class="action" @click="changeDeleteMailing">Удалить</span>
        <span @click="trst"> ntrc</span>
      </div>
    </transition>
  </div>
  <LoadingMoadal
    :stationLoading="stationLoading"
    :changeStationLoadingModal="offModalSuc"
  />
</template>

<script setup>
import { toRefs, ref, defineProps, reactive, watch } from "vue";
import LoadingMoadal from "@/components/Accounts/Accounts/LoadingMoadal/LoadingMoadal.vue";
import axios from "axios";

const props = defineProps({
  modalPosition: {
    type: Object,
  },
  closeModal: {
    type: Function,
  },
  changeInfoMailing: {
    type: Function,
  },
  selectedItem: {
    type: Object,
  },
  isModalOpen: {
    type: Boolean,
  },
  changeDeleteMailing: {
    type: Function,
  },
  refreshMailingLists: {
    type: Function,
  },
  changeisEditMailing: {
    type: Function,
  },
});

const stationLoading = reactive({
  modalStation: false,
  account: {
    station: false,
    result: undefined,
    error: false,
  },
});

const { selectedItem } = toRefs(props);

const updateStatus = async (state) => {
  const apiUrl = `https://whatsapi.ru/ru/api/autosend/whatsapp/state/${selectedItem.value.id}/${state}/`;
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
      stationLoading.modalStation = true;
      console.log("Статус изменен", response.data);
      props.refreshMailingLists();
      setTimeout(() => {
        offModalSuc();
      }, 5000);
    } else {
      console.log("Ошибка", response.data);
    }
  } catch (error) {
    console.error(
      "Ошибка при отправке запроса:",
      error.response ? error.response.data : error.message
    );
  }
};

const trst = () => {
  console.log(localStorage.getItem("accountToken"));
};

const offModalSuc = () => {
  stationLoading.modalStation = false;
};

const getMessages = async () => {
  const apiUrl = `https://whatsapi.ru/ru/api/autosend/whatsapp/view/${1}/`;

  try {
    const response = await axios.get(apiUrl, {
      params: {
        token: "d7039fe337873da68d28945cd6e5c61d",
        limit: 10,
        offset: 0,
        sort: "asc",
      },
    });

    if (response.data.ok) {
      console.log(response.data);
    } else {
      console.error("Ошибка при получении данных:", response.data);
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
.black-fon {
  position: fixed;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}

.action-list {
  border-radius: 10px;
  width: 150px;
  height: auto;
  background: #ffffff;
  position: sticky;
  z-index: 20;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 12px;
  padding: 10px 0px 10px 10px;
}
.action-list.fade-enter-active,
.action-list.fade-leave-active {
  transition: opacity 0.5s ease;
}
.action-list.fade-enter,
.action-list.fade-leave-to {
  opacity: 0;
}

.action-list {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action {
  font-weight: 400;
  font-size: 14px;
  color: #000;
  cursor: pointer;
  padding: 4px;
}

.action:hover {
  background-color: #eeeeee;
  border-radius: 5px 0px 0px 5px;
}

.action-on:hover {
  color: green;
}

.action-throw:hover,
.action-delete:hover {
  color: rgb(255, 0, 0);
}
</style>
