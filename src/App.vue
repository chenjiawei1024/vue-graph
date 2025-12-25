<template>
  <div class="app-container">
    <h1>Vue 3 Graph Demo</h1>
    <div class="demo-section">
      <div class="canvas-container" ref="canvasContainer"></div>
    </div>
    <div class="info-section">
      <h2>操作说明</h2>
      <ul>
        <li>拖拽节点可以移动位置</li>
        <li>拖动节点边缘的控制点可以缩放节点</li>
        <li>点击节点内的 +/- 按钮可以调整计数器数值</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Graph from './graph.js';
import Count from './components/Count.vue';

const canvasContainer = ref(null);
let graph = null;

onMounted(() => {
  // 初始化画布
  graph = new Graph({
    container: canvasContainer.value,
    width: 800,
    height: 600,
    snapline: {
      enable: true,
      center: true,
      className: 'custom-snapline',
      tolerance: 5,
      resizing: true
    }
  });
  
  // 注册自定义节点
  graph.registerNode("my-count", {
    component: Count,
    x: 100,
    y: 100,
    width: 150,
    height: 100
  });
  
  // 添加示例节点
  graph.addNode({
    id: "node-1",
    component: 'my-count',
    x: 200,
    y: 150,
    width: 150,
    height: 100,
    data: {
      num: 0,
    },
  });
  
  graph.addNode({
    id: "node-2",
    component: 'my-count',
    x: 400,
    y: 250,
    width: 150,
    height: 100,
    data: {
      num: 5,
    },
  });
  
  graph.addNode({
    id: "node-3",
    component: 'my-count',
    x: 100,
    y: 350,
    width: 150,
    height: 100,
    data: {
      num: 10,
    },
  });
});
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}
</style>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.demo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.canvas-container {
  /* 容器样式将由Graph类动态设置 */
}

.info-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-section h2 {
  margin-bottom: 15px;
  color: #42b983;
}

.info-section ul {
  list-style-type: disc;
  padding-left: 20px;
}

.info-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}
</style>

<style>
/* 自定义对齐线样式 */
.custom-snapline {
  background-color: #ff6b6b;
}
</style>