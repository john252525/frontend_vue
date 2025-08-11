<template>
  <div v-if="!stationLoading.loading" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">
          <svg
            @click="changeAddMailing"
            class="modal-close"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Создание рассылки
        </h2>
      </div>

      <div class="modal-progress">
        <div class="progress-steps">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="step"
            :class="{
              'step-active': currentStep === index,
              'step-completed': isStepCompleted(index),
              'step-available': isStepAvailable(index),
            }"
            @click="goToStep(index)"
          >
            <div
              class="step-number"
              :class="{
                'current-step': currentStep === index,
                'completed-step': isStepCompleted(index),
              }"
            >
              {{ index + 1 }}
            </div>
            <div class="step-title">{{ step.title }}</div>
            <div class="step-connector" v-if="index < steps.length - 1"></div>
          </div>
        </div>
      </div>

      <div class="modal-content">
        <component
          :is="steps[currentStep].component"
          :key="currentStep"
          :current-step="currentStep"
          @next="nextStep"
          @prev="prevStep"
          @submit="submitMailing"
          @step-completed="updateStepCompletion"
        />
      </div>
    </div>
  </div>
  <LoadMoadal
    :changeStationLoading="changeStationLoading"
    :textLoadin="'Создание рассылки'"
    :stationLoading="stationLoading"
  />
</template>

<script setup>
import { ref, reactive, provide, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAccountStore } from "@/stores/accountStore";
import { useStationLoading } from "@/composables/useStationLoading";
import useFrontendLogger from "@/composables/useFrontendLogger";
import ContactsStep from "./Steps/ContactsStep.vue";
import MessageStep from "./Steps/MessageStep.vue";
import SettingsStep from "./Steps/SettingsStep.vue";
import LoadMoadal from "@/components/Accounts/Accounts/LoadingMoadal/LoadModal.vue";

const { t } = useI18n();
const router = useRouter();
const { sendLog } = useFrontendLogger();
const { setLoadingStatus } = useStationLoading();
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const props = defineProps({
  changeAddMailing: {
    type: Function,
    required: true,
  },
});

const stationLoading = reactive({
  loading: false,
});

const steps = [
  { title: "Контакты", component: ContactsStep },
  { title: "Сообщение", component: MessageStep },
  { title: "Настройки", component: SettingsStep },
];

const changeStationLoading = () => {
  stationLoading.loading = false;
};

const currentStep = ref(0);
const completedSteps = ref([]);
const formData = reactive({
  inputText: "",
  selectedLetter: "A",
  otherFile: null,
  messageText: "",
  imageFile: null,
  imagePreview: null,
  nameMailing: "",
  selectedDays: [1, 2, 3, 4, 5],
  startTime: "10:00",
  endTime: "17:00",
  startNum: 10,
  endNum: 30,
  removeDuplicates: true,
  sendOnlyExistingDialogs: true,
  sendMessagesRandomOrder: false,
});

const isStepAvailable = computed(() => (index) => {
  if (index === currentStep.value) return true;
  if (index === 0) return true;
  return completedSteps.value.includes(index - 1);
});

const isStepCompleted = computed(() => (index) => {
  return completedSteps.value.includes(index);
});

const updateFormData = (newData) => {
  Object.assign(formData, newData);
};

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    if (!completedSteps.value.includes(currentStep.value)) {
      completedSteps.value.push(currentStep.value);
    }
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const goToStep = (index) => {
  if (isStepAvailable.value(index)) {
    currentStep.value = index;
  }
};

const updateStepCompletion = (index, isCompleted) => {
  if (isCompleted && !completedSteps.value.includes(index)) {
    completedSteps.value.push(index);
  } else if (!isCompleted) {
    completedSteps.value = completedSteps.value.filter((i) => i !== index);
  }
};

const apiUrl = import.meta.env.VITE_WHATSAPI_URL;

async function createWhatsAppBroadcast() {
  const url = `${apiUrl}/new/`;
  // setLoadingStatus(true, "loading");

  const formDataToSend = new FormData();
  formDataToSend.append("name", formData.nameMailing);
  formDataToSend.append("base", formData.inputText);
  formDataToSend.append("text", formData.messageText);
  formDataToSend.append("days", JSON.stringify(formData.selectedDays));
  formDataToSend.append("time_from", formData.startTime);
  formDataToSend.append("time_to", formData.endTime);
  formDataToSend.append("delay_from", formData.startNum);
  formDataToSend.append("delay_to", formData.endNum);
  formDataToSend.append("uniq", formData.removeDuplicates);
  formDataToSend.append("exist", formData.sendOnlyExistingDialogs);
  formDataToSend.append("random", formData.sendMessagesRandomOrder);
  formDataToSend.append("cascade", "whatsapp");
  formDataToSend.append("ph_col", formData.selectedLetter);

  if (formData.otherFile) {
    formDataToSend.append("file_base", formData.otherFile);
  }
  if (formData.imageFile) {
    formDataToSend.append("file", formData.imageFile);
  }

  try {
    const response = await axios.post(url, formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await sendLog(
        "mailing",
        "new",
        formDataToSend,
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok === true) {
      setLoadingStatus(true, "success");
      location.reload();
      props.changeAddMailing();
    } else if (response.data === 401) {
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      props.changeAddMailing();
      changeStationLoading();
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.error(
      "error",
      error.response ? error.response.data : error.message
    );
    changeStationLoading();
    props.changeAddMailing();
    setLoadingStatus(true, "error");
  }
}

const submitMailing = async () => {
  try {
    updateStepCompletion(steps.length - 1, true);
    await createWhatsAppBroadcast();
  } catch (error) {
    console.error("Ошибка при создании рассылки:", error);
  }
};

provide("formData", formData);
provide("updateFormData", updateFormData);
provide("updateStepCompletion", updateStepCompletion);
provide("currentStep", currentStep);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 90vh;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e1e5eb;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.modal-close {
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
  color: #64748b;
}

.modal-close:hover {
  transform: translateX(-3px);
  color: #475569;
}

.modal-progress {
  padding: 16px 24px;
  border-bottom: 1px solid #e1e5eb;
  flex-shrink: 0;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.progress-steps::before {
  content: "";
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e1e5eb;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e1e5eb;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
  transition: all 0.2s;
  position: relative;
}

.check-icon {
  width: 14px;
  height: 14px;
  fill: white;
}

.step-title {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s;
  text-align: center;
}

.step-connector {
  position: absolute;
  top: 15px;
  left: calc(100% - 15px);
  width: calc(100% - 30px);
  height: 2px;
  background-color: #e1e5eb;
  z-index: -1;
}

.step-active .step-number {
  background-color: #4f46e5;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
}

.step-active .step-title {
  color: #4f46e5;
  font-weight: 600;
}

.step-completed .step-number {
  background-color: #4f46e5;
  color: white;
}

.step-completed .step-title {
  color: #4f46e5;
}

.step-available {
  cursor: pointer;
}

.step-available:hover .step-number {
  background-color: #d1d5f8;
}

.step-available:hover .step-title {
  color: #6366f1;
}

.step:not(.step-available) {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 24px;
}

@media (max-width: 768px) {
  .modal-container {
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-title {
    font-size: 18px;
  }

  .progress-steps {
    flex-wrap: wrap;
    gap: 10px;
  }

  .progress-steps::before {
    display: none;
  }

  .step {
    flex-direction: row;
    gap: 8px;
    align-items: center;
    position: relative;
    flex: none;
  }

  .step-number {
    margin-bottom: 0;
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .check-icon {
    width: 12px;
    height: 12px;
  }

  .step-title {
    font-size: 12px;
    white-space: nowrap;
  }

  .step-connector {
    display: none;
  }

  .modal-content {
    padding: 16px;
  }
}
</style>
