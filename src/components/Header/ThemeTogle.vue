<script setup>
import { useThemeStore } from "@/stores/theme";
const theme = useThemeStore();
</script>

<template>
  <img
    v-if="theme.isDark"
    @click="theme.toggle"
    class="svg-icon"
    src="/theme/sun.svg"
    alt=""
  />
  <img
    v-else
    @click="theme.toggle"
    class="svg-icon"
    src="/theme/moon.svg"
    alt=""
  />
</template>

<style scoped>
.svg-icon {
  width: 24px;
  height: 24px;
  fill: black;
  cursor: pointer;
}
</style>
