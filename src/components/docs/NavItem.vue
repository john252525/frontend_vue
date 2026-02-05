<template>
  <div class="nav-node">
    <div
      class="item-row"
      :class="{
        'is-file': item.isFile,
        'is-active': isActive, // Только для файлов
        'folder-open': !item.isFile && isOpen,
      }"
      @click="handleClick"
    >
      <div class="icon-wrapper">
        <template v-if="!item.isFile">
          <svg
            class="chevron"
            :class="{ rotated: isOpen }"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </template>
        <template v-else>
          <svg
            class="file-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
            ></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        </template>
      </div>

      <span class="item-name">{{ item.name }}</span>
    </div>

    <transition name="expand">
      <div v-if="!item.isFile && isOpen" class="children-container">
        <NavItem
          v-for="child in item.children"
          :key="child.path"
          :item="child"
          :loadDoc="loadDoc"
          :selectedPath="selectedPath"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  item: Object,
  loadDoc: Function,
  selectedPath: String,
});

const isOpen = ref(true);

const isActive = computed(() => {
  return props.item.isFile && props.selectedPath === props.item.path;
});

const handleClick = () => {
  if (props.item.isFile) {
    props.loadDoc(props.item.path);
  } else {
    isOpen.value = !isOpen.value;
  }
};
</script>

<style scoped>
.nav-node {
  width: 100%;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  margin: 1px 0;
  cursor: pointer;
  border-radius: 6px;
  color: #64748b; /* Неактивный цвет (серый) */
  transition: all 0.15s ease;
  user-select: none;
}

.item-row:hover {
  background: #f1f5f9;
  color: #1e293b;
}

/* Стили для активного ФАЙЛА */
.item-row.is-active {
  background: rgba(204, 212, 245, 0.4) !important;
  color: #2a3f93 !important;
  font-weight: 600;
}

/* Стили для открытой ПАПКИ (текст чуть темнее, но без заливки) */
.item-row.folder-open {
  color: #1e293b;
  font-weight: 500;
}

.icon-wrapper {
  width: 20px;
  margin-right: 8px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.chevron {
  transition: transform 0.2s ease;
}

.chevron.rotated {
  transform: rotate(90deg);
}

.file-icon {
  opacity: 0.7;
}

.item-name {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Контейнер для дочерних элементов */
.children-container {
  margin-left: 18px; /* Сдвигаем вложенные элементы вправо */
  padding-left: 10px;
  border-left: 1px solid #e2e8f0; /* Линия иерархии */
  overflow: hidden;
}

/* Анимация */
.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  max-height: 1000px;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
