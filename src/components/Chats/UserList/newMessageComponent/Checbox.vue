<template>
  <div class="dropdown">
    <div @click="toggleDropdown" class="dropdown-select">
      <h2 v-if="!selectedAccount" class="selected" :class="{ active: isOpen }">
        Выберите аккаунт
      </h2>
      <h2 v-else class="item-selected">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          v-if="selectedAccount.source === 'whatsapp'"
        >
          <g fill="none">
            <g clip-path="url(#akarIconsWhatsappFill0)">
              <path
                fill="#4CBB17"
                fill-rule="evenodd"
                d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967c-.272-.099-.47-.148-.669.15c-.198.297-.767.966-.94 1.164c-.174.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.019-.458.13-.606c.134-.133.297-.347.446-.52c.149-.174.198-.298.297-.497c.1-.198.05-.371-.025-.52c-.074-.149-.668-1.612-.916-2.207c-.241-.579-.486-.5-.668-.51c-.174-.008-.372-.01-.57-.01c-.198 0-.52.074-.792.372c-.273.297-1.04 1.016-1.04 2.479c0 1.462 1.064 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487c.71.306 1.263.489 1.694.625c.712.227 1.36.195 1.872.118c.57-.085 1.758-.719 2.006-1.413c.247-.694.247-1.289.173-1.413c-.074-.124-.272-.198-.57-.347m-5.422 7.403h-.004a9.87 9.87 0 0 1-5.032-1.378l-.36-.214l-3.742.982l.999-3.648l-.235-.374a9.861 9.861 0 0 1-1.511-5.26c.002-5.45 4.436-9.884 9.889-9.884a9.81 9.81 0 0 1 6.988 2.899a9.825 9.825 0 0 1 2.892 6.992c-.002 5.45-4.436 9.885-9.884 9.885m8.412-18.297A11.815 11.815 0 0 0 11.992 0C5.438 0 .102 5.335.1 11.892a11.864 11.864 0 0 0 1.587 5.945L0 24l6.304-1.654a11.881 11.881 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893a11.821 11.821 0 0 0-3.48-8.413"
                clip-rule="evenodd"
              />
            </g>
            <defs>
              <clipPath id="akarIconsWhatsappFill0">
                <path fill="#fff" d="M0 0h24v24H0z" />
              </clipPath>
            </defs>
          </g>
        </svg>
        <!-- <img
          v-if="selectedAccount.source === 'whatsapp'"
          src="/chats/whatsapp.svg"
          alt=""
        /> -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          v-else
        >
          <path
            fill="#1E90FF"
            fill-rule="evenodd"
            d="M18.483 19.79v-.002l.018-.043L21.5 4.625v-.048c0-.377-.14-.706-.442-.903c-.265-.173-.57-.185-.784-.169a2.681 2.681 0 0 0-.586.12a3.23 3.23 0 0 0-.24.088l-.013.005l-16.72 6.559l-.005.002a1.353 1.353 0 0 0-.149.061a2.27 2.27 0 0 0-.341.19c-.215.148-.624.496-.555 1.048c.057.458.372.748.585.899a2.062 2.062 0 0 0 .403.22l.032.014l.01.003l.007.003l2.926.985c-.01.183.008.37.057.555l1.465 5.559a1.5 1.5 0 0 0 2.834.196l2.288-2.446l3.929 3.012l.056.024c.357.156.69.205.995.164c.305-.042.547-.17.729-.315a1.742 1.742 0 0 0 .49-.635l.008-.017l.003-.006zM7.135 13.875a.3.3 0 0 1 .13-.33l9.921-6.3s.584-.355.563 0c0 0 .104.062-.209.353c-.296.277-7.071 6.818-7.757 7.48a.278.278 0 0 0-.077.136L8.6 19.434z"
            clip-rule="evenodd"
          />
        </svg>
        {{ selectedAccount.login }}
      </h2>
      <h2
        v-if="selectedAccount && !isOpen"
        class="selected"
        :class="{ active: isOpen }"
      >
        Выберите аккаунт
      </h2>
      <img
        class="arrow"
        :class="{ up: isOpen }"
        src="/account/arrow.svg"
        alt=""
      />
    </div>

    <ul v-if="isOpen" class="dropdown-list">
      <li
        v-for="account in accounts"
        :key="account.login"
        @click="selectAccount(account)"
        class="dropdown-item"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          v-if="account.source === 'whatsapp'"
        >
          <g fill="none">
            <g clip-path="url(#akarIconsWhatsappFill0)">
              <path
                fill="#4CBB17"
                fill-rule="evenodd"
                d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967c-.272-.099-.47-.148-.669.15c-.198.297-.767.966-.94 1.164c-.174.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.019-.458.13-.606c.134-.133.297-.347.446-.52c.149-.174.198-.298.297-.497c.1-.198.05-.371-.025-.52c-.074-.149-.668-1.612-.916-2.207c-.241-.579-.486-.5-.668-.51c-.174-.008-.372-.01-.57-.01c-.198 0-.52.074-.792.372c-.273.297-1.04 1.016-1.04 2.479c0 1.462 1.064 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487c.71.306 1.263.489 1.694.625c.712.227 1.36.195 1.872.118c.57-.085 1.758-.719 2.006-1.413c.247-.694.247-1.289.173-1.413c-.074-.124-.272-.198-.57-.347m-5.422 7.403h-.004a9.87 9.87 0 0 1-5.032-1.378l-.36-.214l-3.742.982l.999-3.648l-.235-.374a9.861 9.861 0 0 1-1.511-5.26c.002-5.45 4.436-9.884 9.889-9.884a9.81 9.81 0 0 1 6.988 2.899a9.825 9.825 0 0 1 2.892 6.992c-.002 5.45-4.436 9.885-9.884 9.885m8.412-18.297A11.815 11.815 0 0 0 11.992 0C5.438 0 .102 5.335.1 11.892a11.864 11.864 0 0 0 1.587 5.945L0 24l6.304-1.654a11.881 11.881 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893a11.821 11.821 0 0 0-3.48-8.413"
                clip-rule="evenodd"
              />
            </g>
            <defs>
              <clipPath id="akarIconsWhatsappFill0">
                <path fill="#fff" d="M0 0h24v24H0z" />
              </clipPath>
            </defs>
          </g>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          v-else
        >
          <path
            fill="#1E90FF "
            fill-rule="evenodd"
            d="M18.483 19.79v-.002l.018-.043L21.5 4.625v-.048c0-.377-.14-.706-.442-.903c-.265-.173-.57-.185-.784-.169a2.681 2.681 0 0 0-.586.12a3.23 3.23 0 0 0-.24.088l-.013.005l-16.72 6.559l-.005.002a1.353 1.353 0 0 0-.149.061a2.27 2.27 0 0 0-.341.19c-.215.148-.624.496-.555 1.048c.057.458.372.748.585.899a2.062 2.062 0 0 0 .403.22l.032.014l.01.003l.007.003l2.926.985c-.01.183.008.37.057.555l1.465 5.559a1.5 1.5 0 0 0 2.834.196l2.288-2.446l3.929 3.012l.056.024c.357.156.69.205.995.164c.305-.042.547-.17.729-.315a1.742 1.742 0 0 0 .49-.635l.008-.017l.003-.006zM7.135 13.875a.3.3 0 0 1 .13-.33l9.921-6.3s.584-.355.563 0c0 0 .104.062-.209.353c-.296.277-7.071 6.818-7.757 7.48a.278.278 0 0 0-.077.136L8.6 19.434z"
            clip-rule="evenodd"
          />
        </svg>
        {{ account.login }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps({
  accounts: {
    type: Array,
    required: true,
  },
  selectedAccount: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:selectedAccount"]);

const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectAccount = (account) => {
  emit("update:selectedAccount", account);
  isOpen.value = false;
};
</script>

<style scoped>
.dropdown {
  position: relative;
  width: 298px;
  margin-bottom: 24px;
  font-family: sans-serif;
}

.dropdown-select {
  position: relative;
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  width: 100%;
  height: 36px;
  background: #fcfcfc;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  color: #343434;
  cursor: pointer; /* Добавляем курсор */
}

.selected {
  position: absolute;
  font-size: 12px;
  font-weight: 500;
  margin-left: 12px;
  background-color: white;
  padding: 0px 6px;
  top: -7px;
  transition: all 0.15s;
}

.selected.active {
  top: -20px;
}

.item-selected {
  font-size: 14px;
  font-weight: 500;
  margin-left: 12px;
}

.arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px; /* Примерная ширина стрелки */
  height: auto;

  transition: transform 0.2s; /* Плавный поворот */
}

.arrow.up {
  transform: translateY(-50%) rotate(180deg); /* Поворачиваем стрелку */
}

.dropdown-list {
  position: absolute;
  top: 100%; /* Позиционируем под dropdown-select */
  left: 0;
  width: 100%;
  background-color: #fcfcfc;
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Тень */
  z-index: 10; /* Чтобы список был над другими элементами */
  list-style: none; /* Убираем точки у списка */
  padding: 0;
  margin: 0;
}

.dropdown-item {
  padding: 10px 12px;
  font-size: 14px;
  color: #343434;
  cursor: pointer;
  transition: background-color 0.2s; /* Плавное изменение фона */
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}
</style>
