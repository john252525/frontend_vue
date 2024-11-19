<template>
  <div class="modal" :style="`top: ${position.top}; left: ${position.left};`">
    <div class="modal-content">
      <p>Item ID: {{ item.id }}</p>
      <p>Column 1: {{ item.col1 }}</p>
      <p>Column 2: {{ item.col2 }}</p>
      <button @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    position: {
      type: Object,
      required: true,
    },
  },
};
</script>
