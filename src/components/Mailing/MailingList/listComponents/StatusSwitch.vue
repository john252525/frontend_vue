<template>
  <div class="row-section section-toggle">
    <label class="switch" :class="{ 'switch-loading': item.loading }">
      <input
        type="checkbox"
        @change="updateStatus(item.state === 1 ? 0 : 1)"
        :checked="item.state === 1"
        :disabled="item.loading"
      />
      <span class="slider round">
        <span class="switch-handle"></span>
      </span>
      <span v-if="item.loading" class="switch-loader"></span>
    </label>
  </div>
</template>

<script setup>
import axios from "axios";
import { toRefs, computed } from "vue";

const props = defineProps({
  item: {
    type: Object,
  },
  changeStatusMailing: {
    type: Function,
  },
});

const { item } = toRefs(props);

const apiUrl = import.meta.env.VITE_WHATSAPI_URL;

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

import { useMailingVersion } from "@/stores/mailingVersion";
const mailingVersion = useMailingVersion();
const getVersion = computed(() => mailingVersion.getVersion);

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

const updateStatus = async (state) => {
  item.value.loading = true;

  const apiUrlMethod = `${apiUrl}/state/${item.value.id}/${state}/`;

  try {
    const response = await axios.post(
      apiUrlMethod,
      {
        version: getVersion.value,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (response.data.ok === true) {
      setLoadingStatus(true, "success");
      props.changeStatusMailing(item.value, state);
    } else {
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.error(
      "error",
      error.response ? error.response.data : error.message,
    );
  } finally {
    item.value.loading = false;
  }
};

// const changeSwitch = (account) => {
//   if (props.enableCheckbox(account)) {
//     forceStop();
//   } else {
//     // item.value.loading = true;
//     props.changeEnableStartModal(account, "accountList");
//   }
// };

// const forceStop = async () => {
//   const { source, login, storage } = item.value;
//   let params = {
//     source: source,
//     login: login,
//     storage: storage,
//   };

//   item.value.loading = true;

//   try {
//     const response = await axios.post(`${FRONTEND_URL}forceStop`, params, {
//       headers: {
//         "Content-Type": "application/json; charset=utf-8",
//         Authorization: `Bearer ${token.value}`,
//       },
//     });

//     if (response.data.status === "ok") {
//       setLoadingStatus(true, "success");
//       props.changeForceStopItemData(item.value);
//     } else {
//       setLoadingStatus(true, "error");
//     }
//   } catch (error) {
//     console.error(`error`, error);
//     if (error.response) {
//       console.error("error", error.response.data);
//     }
//   } finally {
//     item.value.loading = false;
//   }
// };
</script>

<style scoped>
.row-section {
  display: flex;
  align-items: center;
}

.section-toggle {
  flex: 0 0 auto;
}

.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #cbd5e1;
  transition: all 0.3s ease;
  border-radius: 20px;
}

.switch-handle {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: white;
  transition: all 0.3s ease;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background: #3b82f6;
}

input:checked + .slider .switch-handle {
  transform: translateX(16px);
}

.switch-loading .slider {
  background: rgba(59, 130, 246, 0.5);
}

.switch-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border: 2px solid transparent;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
