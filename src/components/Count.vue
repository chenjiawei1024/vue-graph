<template>
  <div class="count-node">
    <div class="node-header">
      <h3>Count Component</h3>
      <button class="delete-btn" @click="deleteNode">×</button>
    </div>
    <div class="node-info">
      <div class="info-item">x: {{ node.x }}</div>
      <div class="info-item">y: {{ node.y }}</div>
      <div class="info-item">w: {{ node.width }}</div>
      <div class="info-item">h: {{ node.height }}</div>
    </div>
    <div class="count-display">{{ num }}</div>
    <div class="count-controls">
      <button @click="decrement">-</button>
      <button @click="increment">+</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  node: {
    type: Object,
    default: () => ({})
  },
  graph: {
    type: Object,
    default: null
  }
});

// 初始化计数器值
const num = ref(props.data.num || 0);

// 监听数据变化，更新计数器
watch(() => props.data.num, (newVal) => {
  if (newVal !== undefined) {
    num.value = newVal;
  }
});

// 增加计数
const increment = () => {
  num.value++;
};

// 减少计数
const decrement = () => {
  num.value--;
};

// 删除当前节点
const deleteNode = () => {
  if (props.graph && props.node.id) {
    props.graph.removeNodeById(props.node.id);
  }
};

// 元素x值等于490时，将x值设置成500
// watch(() => props.node.x, (newVal) => {
//   if (newVal > 490 && newVal < 510) {
//     console.log('x值等于490时，将x值设置成500');
//     // 调用graph方法
//     props.graph.updateNodeById(props.node.id, {
//       x: 500
//     });
//     // props.node.x = 500;
//   }
// });
</script>

<style scoped>
.count-node {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
}

.node-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

h3 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.delete-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background-color: #ff4d4f;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.delete-btn:hover {
  background-color: #ff7875;
}

.node-info {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #666;
}

.info-item {
  text-align: center;
  background-color: #f5f5f5;
  padding: 2px;
  border-radius: 2px;
}

.count-display {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
  color: #42b983;
}

.count-controls {
  display: flex;
  gap: 10px;
}

button {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  background-color: #42b983;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

button:hover {
  background-color: #35956a;
}
</style>