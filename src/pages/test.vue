<template>
  <div>
    <input
      class="input-data"
      v-model="searchQuery"
      @focus="showOptions = true"
      placeholder="Введите текст..."
    />
    <ul class="dropdown-options" v-if="showOptions && filteredOptions.length">
      <li
        v-for="option in filteredOptions"
        :key="option"
        @click="selectOption(option)"
      >
        {{ option }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const searchQuery = ref("");
const options = ref([
  "Apple",
  "Banana",
  "Orange",
  "Grape",
  "Mango",
  "Pineapple",
]);
const filteredOptions = ref([]);
const showOptions = ref(false);

const filterOptions = () => {
  filteredOptions.value = options.value.filter((option) => {
    return option.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
};

const selectOption = (option) => {
  searchQuery.value = option;
  showOptions.value = false; // Скрыть список
};

watch(searchQuery, filterOptions);
</script>

<style>
.input-data {
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  width: 478px;
  height: 45px;
  background: #fcfcfc;
  font-weight: 500;
  font-size: 14px;
  color: #343434;
  margin-top: 30px;
  padding-left: 10px;
}

.dropdown-options {
  position: absolute;
  border: 0.5px solid #c1c1c1;
  border-top: 0px;
  border-radius: 5px;
  padding: 10px;
  width: 470px;
  height: auto;
  background: #fcfcfc;
  display: flex;
  flex-direction: column;
  gap: 1px;
  z-index: 100;
}
</style>
