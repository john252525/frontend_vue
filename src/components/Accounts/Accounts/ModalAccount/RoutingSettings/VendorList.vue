<template>
  <div class="vendors-section">
    <label class="form-label">
      <span class="step-badge">1</span>
      Выберите канал:
    </label>
    <div class="vendors-list">
      <button
        v-for="item in availableAccounts"
        :key="item.uuid"
        @click="model = item.uuid"
        :class="['vendor-card', { active: model === item.uuid }]"
      >
        <div class="vendor-icon">
          <svg
            v-if="item.source === 'telegram'"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295-.404 0-.330-.144-.465-.511l-1.044-3.41-2.896-.9c-.628-.2-.63-.64.136-.953l11.303-4.164c.515-.207.966.118.798.91z"
            />
          </svg>
          <svg
            v-else-if="item.source === 'max'"
            width="20"
            height="20"
            viewBox="0 0 765 761"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M390.364 758.828C315.357 758.828 280.5 747.879 219.911 704.079C181.586 753.353 60.2245 791.861 54.932 725.979C54.932 676.522 43.9821 634.73 31.5722 589.105C16.7898 532.895 0 470.298 0 379.597C0 162.971 177.753 0 388.357 0C599.142 0 764.303 171.001 764.303 381.604C765.011 588.951 597.709 757.722 390.364 758.828ZM393.467 187.243C290.902 181.951 210.968 252.943 193.266 364.267C178.666 456.429 204.581 568.665 226.663 574.505C237.248 577.06 263.893 555.525 280.5 538.918C307.961 557.889 339.939 569.282 373.209 571.95C479.482 577.062 570.289 496.156 577.425 389.999C581.579 283.618 499.755 193.514 393.466 187.426L393.467 187.243Z"
              fill="currentColor"
            />
          </svg>
          <svg
            v-else
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.25302 16.494L5.97702 16.917C7.1979 17.6292 8.58659 18.003 10 18C11.5823 18 13.129 17.5308 14.4446 16.6518C15.7602 15.7727 16.7856 14.5233 17.3911 13.0615C17.9966 11.5997 18.155 9.99113 17.8463 8.43928C17.5376 6.88743 16.7757 5.46197 15.6569 4.34315C14.538 3.22433 13.1126 2.4624 11.5607 2.15372C10.0089 1.84504 8.40036 2.00346 6.93855 2.60896C5.47674 3.21447 4.22731 4.23984 3.34826 5.55544C2.46921 6.87103 2.00002 8.41775 2.00002 10C1.9971 11.4139 2.37129 12.8029 3.08402 14.024L3.50602 14.748L2.85302 17.149L5.25302 16.494ZM0.00401546 20L1.35602 15.032C0.464974 13.5049 -0.00308163 11.768 1.52687e-05 10C1.52687e-05 4.477 4.47702 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C8.23277 20.003 6.4966 19.5353 4.97002 18.645L0.00401546 20ZM6.39102 5.308C6.52568 5.29867 6.66002 5.29733 6.79402 5.304C6.84802 5.308 6.90202 5.31333 6.95602 5.32C7.11502 5.338 7.29002 5.435 7.34902 5.569C7.64702 6.24567 7.93635 6.92567 8.21702 7.609C8.27902 7.761 8.24202 7.956 8.12402 8.146C8.06402 8.243 7.97002 8.379 7.86102 8.518C7.74802 8.663 7.50501 8.929 7.50501 8.929C7.50501 8.929 7.40602 9.047 7.44402 9.194C7.45802 9.25 7.50402 9.331 7.54602 9.399L7.60502 9.494C7.86102 9.921 8.20502 10.354 8.62502 10.762C8.74502 10.878 8.86202 10.997 8.98802 11.108C9.45602 11.521 9.98602 11.858 10.558 12.108L10.563 12.11C10.648 12.147 10.691 12.167 10.815 12.22C10.877 12.246 10.9407 12.268 11.006 12.286C11.03 12.2927 11.0543 12.2963 11.079 12.297C11.136 12.2992 11.1927 12.2874 11.2441 12.2626C11.2956 12.2379 11.3401 12.2009 11.374 12.155C12.097 11.279 12.164 11.222 12.169 11.222V11.224C12.2192 11.177 12.279 11.1413 12.3442 11.1194C12.4094 11.0975 12.4786 11.0898 12.547 11.097C12.6083 11.0997 12.6673 11.113 12.724 11.137C13.255 11.38 14.124 11.759 14.124 11.759L14.706 12.02C14.804 12.067 14.893 12.178 14.896 12.285C14.9 12.352 14.906 12.46 14.883 12.658C14.851 12.917 14.773 13.228 14.695 13.391C14.641 13.5019 14.5701 13.6037 14.485 13.693C14.384 13.7989 14.2736 13.8953 14.155 13.981C14.0723 14.0423 14.03 14.071 14.03 14.071C13.9057 14.1499 13.7779 14.2233 13.647 14.291C13.3894 14.4275 13.1051 14.506 12.814 14.521C12.629 14.531 12.444 14.545 12.258 14.535C12.25 14.535 11.69 14.448 11.69 14.448C10.2683 14.074 8.95345 13.3734 7.85002 12.402C7.62402 12.203 7.41402 11.989 7.20002 11.776C6.31202 10.891 5.63902 9.936 5.23002 9.034C5.02252 8.59122 4.9101 8.10988 4.90002 7.621C4.89626 7.01375 5.09507 6.42257 5.46502 5.941C5.53802 5.847 5.60702 5.749 5.72602 5.636C5.85202 5.516 5.93302 5.452 6.02002 5.408C6.13605 5.351 6.26205 5.31704 6.39102 5.308Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div class="vendor-content">
          <div class="vendor-name">
            {{ item.name ? item.name : item.source }}
          </div>
          <div class="vendor-label">
            {{ getSource(item.source) }}
          </div>
        </div>
        <div v-if="model === item.uuid" class="checkmark">✓</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { toRefs, ref, onMounted } from "vue";

const props = defineProps({
  vendors: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const { vendors } = toRefs(props);

const loadingAccounts = ref(false);
const availableAccounts = ref([]);

const model = defineModel({
  type: String,
  default: "",
});

function getSource(source) {
  switch (source) {
    case "telegram":
      return "Telegram";
    case "whatsapp":
      return "WhatsApp";
    case "max":
      return "Max";
    default:
      return "Неизвестно";
  }
}

onMounted(async () => {
  loadingAccounts.value = true;

  try {
    const filtered = vendors.value.filter(
      (acc) =>
        acc.source === "whatsapp" ||
        acc.source === "telegram" ||
        acc.source === "max"
    );
    console.log("✅ Отфильтровано аккаунтов:", filtered.length, filtered);
    availableAccounts.value = filtered;
  } catch (err) {
    console.error("❌ Ошибка в onMounted:", err);
  } finally {
    loadingAccounts.value = false;
  }
});
</script>

<style scoped>
.vendors-section {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  background-color: #2563eb;
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.vendors-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vendor-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #d5d5d5;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  position: relative;
}

.vendor-card:hover {
  border-color: #2563eb;
  background-color: #f9f9f9;
}

.vendor-card.active {
  border-color: #2563eb;
  background-color: #f0f7ff;
}

.vendor-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #f0f0f0;
  border-radius: 5px;
  color: #2563eb;
  font-size: 18px;
  flex-shrink: 0;
}

.vendor-card.active .vendor-icon {
  background-color: #2563eb;
  color: white;
}

.vendor-icon svg {
  width: 20px;
  height: 20px;
}

.vendor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.vendor-name {
  font-weight: 600;
  color: #333;
  font-size: 13px;
}

.vendor-label {
  color: #777;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.checkmark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #10b981;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .vendors-section {
    padding: 10px;
    margin-bottom: 14px;
  }

  .form-label {
    font-size: 12px;
    margin-bottom: 10px;
  }

  .vendor-card {
    padding: 8px;
    gap: 8px;
  }

  .vendor-icon {
    width: 32px;
    height: 32px;
  }

  .vendor-name {
    font-size: 12px;
  }

  .vendor-label {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .vendors-section {
    padding: 8px;
    margin-bottom: 12px;
  }

  .form-label {
    font-size: 11px;
    gap: 6px;
  }

  .vendor-card {
    padding: 6px;
    gap: 6px;
  }

  .vendor-icon {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }

  .vendor-name {
    font-size: 11px;
  }

  .vendor-label {
    font-size: 9px;
  }
}
</style>
