<template>
  <div @click="closeModal" v-if="isModalOpen" class="black-fon">
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
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
          >{{ t("modalMailing.on") }}</span
        >
        <span
          @click="updateStatus(0)"
          v-if="selectedItem.state === 1"
          class="action"
          >{{ t("modalMailing.off") }}</span
        >
        <span @click="changeInfoMailing" class="action">{{
          t("modalMailing.info")
        }}</span>
        <span @click="changeisEditMailing" class="action">{{
          t("modalMailing.edit")
        }}</span>
        <span class="action" @click="changeDeleteMailing">{{
          t("modalMailing.delete")
        }}</span>
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
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";
const router = useRouter();
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

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
    // Optionally, update the error message ref
  }
};

const stationLoading = reactive({
  modalStation: false,
  account: {
    station: false,
    result: undefined,
    error: false,
  },
});

const { selectedItem } = toRefs(props);

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const apiUrl = import.meta.env.VITE_WHATSAPI_URL;

const updateStatus = async (state) => {
  const apiUrlMethod = `${apiUrl}/state/${selectedItem.value.id}/${state}/`;
  const params = {
    token: localStorage.getItem("accountToken"),
  };
  try {
    const response = await axios.post(
      apiUrlMethod,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "mailing",
        "state",
        apiUrlMethod,
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok === true) {
      stationLoading.modalStation = true;

      props.refreshMailingLists();
      setTimeout(() => {
        offModalSuc();
      }, 5000);
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
    }
  } catch (error) {
    console.error(
      "error",
      error.response ? error.response.data : error.message
    );
  }
};

const offModalSuc = () => {
  stationLoading.modalStation = false;
};

const getMessages = async () => {
  const apiUrlMethod = `${apiUrl}/view/${1}/`;

  try {
    const response = await axios.get(apiUrlMethod, {
      params: {
        limit: 10,
        offset: 0,
        sort: "asc",
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        // Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "mailing",
        "view",
        { limit: 10, offset: 0, sort: "asc" },
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok) {
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.error("error", response.data);
    }
  } catch (error) {
    console.error(
      "error",
      error.response ? error.response.data : error.message
    );
  }
};
</script>

<style scoped>
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
