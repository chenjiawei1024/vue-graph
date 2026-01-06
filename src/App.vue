<template>
  <div class="app-container">
    <h1>画布demo</h1>
    
    <!-- 背景控制按钮 -->
    <div class="control-section">
      <h2>背景控制</h2>
      <div class="button-group">
        <button @click="setBackgroundColor">设置颜色背景</button>
        <button @click="setImageBackground">设置图片背景</button>
        <button @click="setPatternBackground">设置图案背景</button>
        <button @click="clearBackground">清除背景</button>
      </div>
    </div>
    
    <div class="demo-section">
      <div class="canvas-container" ref="canvasContainer"></div>
    </div>
    <div class="info-section">
      <h2>操作说明</h2>
      <ul>
        <li>拖拽节点可以移动位置</li>
        <li>拖动节点边缘的控制点可以缩放节点</li>
        <li>点击节点内的 +/- 按钮可以调整计数器数值</li>
        <li>使用上方按钮可以控制画布背景</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Graph from './graph';
import Count from './components/Count.vue';

const canvasContainer = ref(null);
let graph = null;

// 背景控制方法
const setBackgroundColor = () => {
  graph.drawBackground({
    color: '#e6f7ff',
    opacity: 0.8
  });
};

const setImageBackground = () => {
  // 使用在线图片作为示例
  graph.drawBackground({
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=entropy&cs=tinysrgb',
    repeat: 'no-repeat',
    position: { x: 50, y: 50 },
    size: { width: 300, height: 200 },
    opacity: 0.9
  });
};

const setPatternBackground = () => {
  graph.drawBackground({
    color: '#fff8dc',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBoNiB2NiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIvPjxwYXRoIGQ9Ik0wIDBoMyB2MyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvc3ZnPg==',
    repeat: 'repeat',
    opacity: 0.9
  });
};

const clearBackground = () => {
  graph.clearBackground();
};

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
    },
    background: {
      color: '#f0f8ff',
      opacity: 0.9
    }
  });
  
  // 测试Graph事件系统
  console.log('=== 测试Graph事件系统 ===');
  
  // 监听初始化完成事件
  graph.on('initialized', (event) => {
    console.log('Graph initialized:', event);
  });
  
  // 监听节点添加事件
  graph.on('node:add', (event) => {
    console.log('Node added:', event.node.id, 'at index', event.index);
  });
  
  // 监听节点添加前事件
  graph.on('node:beforeadd', (event) => {
    console.log('Node before add:', event.node.id, event.options);
  });
  
  // 监听节点更新事件
  graph.on('node:update', (event) => {
    console.log('node:update触发')
  });
  
  // 监听节点更新前事件
  graph.on('node:beforeupdate', (event) => {
    console.log('Node before update:', event.node.id, event.updates);
  });
  
  // 监听节点删除事件
  graph.on('node:remove', (event) => {
    console.log('Node removed:', event.node.id, 'from index', event.index);
  });
  
  // 监听节点删除前事件
  graph.on('node:beforeremove', (event) => {
    console.log('Node before remove:', event.node.id);
  });
  
  // 监听通用cell事件
  graph.on('cell:add', (event) => {
    console.log('Cell added:', event.cell.id);
  });
  
  // 监听命名空间事件
  graph.on('node:add.test', (event) => {
    console.log('Node added (test namespace):', event.node.id);
  });
  
  // 监听一次事件
  graph.once('node:add.once', (event) => {
    console.log('Node added (once):', event.node.id);
  });
  
  // 监听画布销毁事件
  graph.on('destroy', (event) => {
    console.log('Graph destroyed:', event);
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

.control-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.control-section h2 {
  margin-bottom: 15px;
  color: #42b983;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.button-group button {
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.button-group button:hover {
  background-color: #3aa373;
}

.button-group button:active {
  transform: translateY(1px);
}
</style>

<style>
/* 自定义对齐线样式 */
.custom-snapline {
  background-color: #ff6b6b;
}
</style>