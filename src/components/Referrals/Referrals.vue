<template>
  <header>
    <section class="account-section">
      <h2 class="title">{{ t("referrals.title") }}</h2>
    </section>
    <section class="account-section">
      <span class="link-title">Ваша ссылка для привлечения клиентов</span>
      <button @click="copyReferralLink" class="add-account-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <g
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path
              d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2"
            />
            <path
              d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"
            />
          </g>
        </svg>

        {{ textButton }}
      </button>
    </section>
  </header>
  <ReferralsList />
</template>

<script setup>
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
import ReferralsList from "./ReferralsList.vue";
import { ref, onMounted } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const textButton = ref(`https://${window.location.hostname}/Registration...`);

function decodeJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT token format");
    }

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    console.log(payload);
    return payload.vendor_id;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

const refId = ref("");

const getRefId = async () => {
  try {
    const response = await axios.get(
      `https://bapi88.developtech.ru/api/v1/users/getRefId`,

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accountStore.accountToken}`,
        },
      }
    );

    if (response.data.ok) {
      refId.value = response.data.data.ref_id;
    }
  } catch (error) {
    console.error("Error", error);
  }
};

const copyReferralLink = async () => {
  const referralLink = `https://${window.location.hostname}/Registration?ref=${refId.value}`;

  try {
    await navigator.clipboard.writeText(referralLink);

    console.log("Ссылка скопирована в буфер обмена:", referralLink);
    textButton.value = t("referrals.link");
    setTimeout(() => {
      textButton.value = `https://${window.location.hostname}/Registration...`;
    }, 3000);
  } catch (err) {
    console.error("Не удалось скопировать ссылку:", err);
    // Альтернативный способ для старых браузеров
    const textArea = document.createElement("textarea");
    textArea.value = referralLink;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      console.log("Ссылка скопирована (старый метод)");
    } catch (err) {
      console.error("Не удалось скопировать ссылку (старый метод):", err);
    }
    document.body.removeChild(textArea);
  }
};

import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();

onMounted(getRefId);
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 12px 18px 18px;
  box-sizing: border-box;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.account-section {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 6px;
}

.title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  flex: 1;
  margin-right: 8px;
}

.link-title {
  font-size: 16px;
  color: #585858;
}

.account {
  font-weight: 700;
  font-size: 18px;
  color: var(--headerAccountText);
  background: var(--headerAccount);
  border-radius: 5px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.account-list-button,
.add-account-button {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
}

.bi-view-list {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.account-list-button {
  background: oklch(0.65 0.22 267 / 0.16);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  color: var(--headerAccountButtonColor);
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
}

.account-list-button:hover {
  background: rgba(0, 13, 255, 0.2);
  transition: all 0.25s;
}

.account-list-button:active {
  background: rgba(17, 21, 93, 0.2);
  transition: all 0.25s;
}

.svg-icon {
  width: 1.25rem; /* 20px */
  height: 1.25rem; /* 20px */
  margin-right: 0.25rem; /* 4px */
  margin-left: -0.25rem; /* -4px */
  fill: currentColor; /* Заполнение текущим цветом */
}

.add-account-button {
  background: var(--textNavHover);
  font-weight: 400;
  font-size: 14px;
  color: #585858;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
}

.add-account-button:hover {
  background: #dfdfdf;
  transition: all 0.25s;
}

.add-account-button:active {
  background: rgb(201, 201, 201);
  transition: all 0.25s;
}

.black-fon {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.platform-list-telegram {
  position: absolute;
  z-index: 10;
  right: 122px;
  top: 120px;
  border-radius: 10px;
  width: 100px;
  height: 70px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}

.platform-list-whatsapp {
  position: absolute;
  z-index: 10;
  right: 122px;
  top: 120px;
  border-radius: 10px;
  width: 108px;
  height: 70px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}

.platform-list-telegram .fade-enter-active,
.platform-list-telegram .fade-leave-active {
  transition: opacity 0.5s ease;
}
.platform-list-telegram .fade-enter,
.platform-list-telegram .fade-leave-to {
  opacity: 0;
}

.platform-list-telegram {
  animation: fadeIn 0.5s forwards;
}

.platform-list-whatsapp.fade-enter-active,
.platform-list-whatsapp.fade-leave-active {
  transition: opacity 0.5s ease;
}
.platform-list-whatsapp.fade-enter,
.platform-list-whatsapp.fade-leave-to {
  opacity: 0;
}

.platform-list-whatsapp {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    /* transform: translateY(5px); */
  }
  to {
    opacity: 1;
    /* transform: translateY(0); */
  }
}

.platform {
  padding: 4px;
  transition: all 0.1s;
  cursor: pointer;
  font-size: 14px;
}

.platform:hover {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

.platform.active {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

@media (max-width: 768px) {
  .account {
    display: none;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .platform-list {
    left: 20px;
    top: 180px;
  }

  .platform-list-telegram {
    left: 17px;
    top: 160px;
  }

  .platform-list-whatsapp {
    left: 16px;
    top: 160px;
  }
}
</style>
