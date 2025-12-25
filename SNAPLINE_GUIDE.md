# 节点吸附和对齐辅助线功能说明

## 功能概述

节点吸附和对齐辅助线功能可以帮助用户在拖动和缩放节点时更精确地对齐节点，提升排版体验。

## 配置项

在创建画布时，可以通过 `snapline` 配置项来控制吸附和对齐线功能：

```javascript
const graph = new Graph({
  container: containerElement,
  width: 800,
  height: 600,
  snapline: {
    enable: false,        // 是否启用对齐线和吸附功能，默认为 false
    className: 'snapline', // 对齐线的CSS类名，默认为 'snapline'
    tolerance: 5,         // 吸附容差距离（像素），默认为 5
    resizing: true,        // 是否在缩放时启用吸附，默认为 true
    center: true,          // 是否开启画布居中对齐
    filter: null          // 过滤器，用于指定哪些节点启用吸附
  }
});
```

## 配置项详细说明

### enable
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否启用对齐线和吸附功能

### className
- **类型**: `string`
- **默认值**: `'snapline'`
- **说明**: 对齐线的CSS类名，可以通过CSS自定义对齐线的样式

### tolerance
- **类型**: `number`
- **默认值**: `5`
- **说明**: 吸附容差距离（像素）。当节点与目标位置的距离小于此值时，会自动吸附

### resizing
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否在缩放节点时启用吸附功能

### filter
- **类型**: `(string | { id: string })[] | ((this: Graph, node: Node) => boolean)`
- **默认值**: `null`
- **说明**: 过滤器，用于指定哪些节点启用吸附功能
  - 如果是数组：指定节点ID列表
  - 如果是函数：返回 `true` 表示启用吸附，`false` 表示禁用

## API 方法

### enableSnapline()
启用对齐线和吸附功能。

```javascript
graph.enableSnapline();
```

### disableSnapline()
禁用对齐线和吸附功能，并清除当前的吸附状态。

```javascript
graph.disableSnapline();
```

## 吸附规则

### 拖动节点时的吸附
节点在拖动时会自动吸附到以下位置：

1. **画布边缘**：
   - 左边缘 (x = 0)
   - 右边缘 (x = 画布宽度 - 节点宽度)
   - 上边缘 (y = 0)
   - 下边缘 (y = 画布高度 - 节点高度)

2. **画布中心**：
   - 水平中心 (节点中心 x + width / 2 = 画布宽度 / 2)
   - 垂直中心 (节点中心 y + height / 2 = 画布高度 / 2)

3. **其他节点的边缘和中心**：
   - 左边缘对齐
   - 右边缘对齐
   - 上边缘对齐
   - 下边缘对齐

### 缩放节点时的吸附(支持四个角的缩放)
节点在缩放时会自动吸附到以下位置：

1. **画布边缘**：
   - 左边缘 (x = 0)
   - 右边缘 (x + width = 画布宽度)
   - 上边缘 (y = 0)
   - 下边缘 (y + height = 画布高度)

2. **其他节点的边缘**：
   - 左边缘对齐
   - 右边缘对齐
   - 上边缘对齐
   - 下边缘对齐

3. **画布中心**：
   - 水平中心 (节点中心 x + width / 2 = 画布宽度 / 2)
   - 垂直中心 (节点中心 y + height / 2 = 画布高度 / 2)

## 吸附脱离机制

当节点处于吸附状态时，需要拖动超过容差距离（`tolerance`）才能脱离吸附，继续移动或缩放。

## 对齐线样式

默认情况下，对齐线是红色的 1px 线条。你可以通过自定义 CSS 类来修改样式：

```css
.snapline {
  background-color: #ff0000;
  z-index: 1000;
  pointer-events: none;
}
```

## 使用示例

### 示例 1：基本使用

```javascript
// 创建画布并启用吸附功能
const graph = new Graph({
  container: containerElement,
  width: 800,
  height: 600,
  snapline: {
    enable: true,
    tolerance: 10
  }
});
```

### 示例 2：动态启用/禁用

```javascript
// 创建画布（默认禁用）
const graph = new Graph({
  container: containerElement,
  width: 800,
  height: 600,
  snapline: {
    enable: false
  }
});

// 启用吸附功能
graph.enableSnapline();

// 禁用吸附功能
graph.disableSnapline();
```

### 示例 3：使用过滤器

```javascript
// 只对特定节点启用吸附
const graph = new Graph({
  container: containerElement,
  width: 800,
  height: 600,
  snapline: {
    enable: true,
    filter: ['node-1', 'node-2'] // 只对 node-1 和 node-2 启用吸附
  }
});

// 或者使用函数过滤器
const graph = new Graph({
  container: containerElement,
  width: 800,
  height: 600,
  snapline: {
    enable: true,
    filter: function(node) {
      // 只对宽度大于 100 的节点启用吸附
      return node.width > 100;
    }
  }
});
```

### 示例 4：禁用缩放时的吸附

```javascript
const graph = new Graph({
  container: containerElement,
  width: 800,
  height: 600,
  snapline: {
    enable: true,
    resizing: false // 禁用缩放时的吸附
  }
});
```

## 注意事项

1. 吸附功能默认是禁用的，需要显式启用
2. 吸附容差值越小，吸附越精确，但需要更精确的操作
3. 对齐线只在吸附时显示，脱离吸附后会自动消失
4. 拖动或缩放结束时，吸附状态会被清除
5. 对齐线使用 `pointer-events: none`，不会影响鼠标事件

## 实现原理

该功能通过以下方式实现：

1. **吸附检测**：在拖动/缩放过程中，检测节点与目标位置的距离是否小于容差值
2. **位置修正**：当检测到吸附时，自动修正节点位置到目标位置
3. **对齐线渲染**：使用 Vue 的 `h` 函数动态渲染对齐线元素
4. **脱离检测**：当节点处于吸附状态时，检测鼠标偏移量是否超过容差值
