<template>
  <VueDraggableResizable
    v-bind="$attrs"
    class="my-draggable-resizable"
  >
    <slot></slot>
  </VueDraggableResizable>
</template>

<script setup>
import VueDraggableResizable from './vue-draggable-resizable/components/vdr.vue'
</script>

<style scoped>
.my-draggable-resizable {
  /* 在这里可以添加自定义样式，后续可以根据需要修改 */
  /* border: 2px solid #42b983;
  background-color: rgba(66, 185, 131, 0.1); */
}
</style>
