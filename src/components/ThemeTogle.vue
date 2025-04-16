<script setup>
import { useThemeStore } from "@/stores/theme";
const theme = useThemeStore();
</script>

<template>
  <button @click="theme.toggle">
    {{ theme.isDark ? "☀️ Светлая" : "🌙 Тёмная" }}
  </button>
</template>
