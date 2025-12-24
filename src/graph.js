import { createApp, defineComponent, h, ref, reactive, watch } from 'vue';
import MyDraggableResizable from './components/MyDraggableResizable.vue';

class Graph {
  constructor(config) {
    this.config = {
      container: null,
      width: 800,
      height: 600,
      parent: true, // 新增配置项，默认限制节点在父容器内
      ...config
    };
    
    this.registeredNodes = {};
    this.nodes = reactive([]);
    this.nodeIdCounter = 0;
    
    this.init();
  }
  
  init() {
    const container = this.config.container;
    if (!container) {
      throw new Error('Container is required');
    }
    
    // 设置容器样式
    container.style.position = 'relative';
    container.style.width = `${this.config.width}px`;
    container.style.height = `${this.config.height}px`;
    container.style.border = '1px solid #ccc';
    container.style.overflow = 'hidden';
    container.style.backgroundColor = '#fafafa';
    
    // 存储容器引用
    this.container = container;
    
    // 创建Vue应用实例
    const graphInstance = this;
    this.app = createApp({
      setup() {
        // 直接使用graphInstance的响应式nodes数组
        return {
          nodes: graphInstance.nodes,
          graphInstance
        };
      },
      render() {
        return h('div', {
          style: {
            position: 'relative',
            width: '100%',
            height: '100%'
          }
        }, this.nodes.map(node => {
          const NodeComponent = this.graphInstance.registeredNodes[node.component];
          if (!NodeComponent) return null;
          
          // 为节点组件包裹拖拽缩放能力
          return h(MyDraggableResizable, {
            x: node.x,
            y: node.y,
            w: node.width,
            h: node.height,
            parent: this.graphInstance.config.parent,
            onDragging: (e, position) => {
              // 拖动过程中实时更新节点位置
              this.graphInstance.updateNode(node.id, { x: position.x, y: position.y });
            },
            onDragStop: (e, position) => {
              // 拖动结束时更新节点位置
              this.graphInstance.updateNode(node.id, { x: position.x, y: position.y });
            },
            onResizing: (e, bounds) => {
              // 缩放过程中实时更新节点位置和尺寸
              this.graphInstance.updateNode(node.id, {
                x: bounds.x,
                y: bounds.y,
                width: bounds.w,
                height: bounds.h
              });
            },
            onResizeStop: (e, bounds) => {
              // 缩放结束时更新节点位置和尺寸
              this.graphInstance.updateNode(node.id, {
                x: bounds.x,
                y: bounds.y,
                width: bounds.w,
                height: bounds.h
              });
            }
          }, {
            default: () => h(NodeComponent, {
              data: node.data,
              node: node,
              graph: this.graphInstance
            })
          });
        }));
      }
    });
    
    // 挂载应用到容器
    this.app.mount(container);
  }
  
  // 注册节点类型
  registerNode(name, options) {
    const { component, x, y, width, height, ...rest } = options;
    
    if (!component) {
      throw new Error('Component is required when registering a node');
    }
    
    // 注册节点类型
    this.registeredNodes[name] = component;
    
    // 注册节点默认配置
    this.registeredNodes[`${name}-config`] = {
      x: x || 0,
      y: y || 0,
      width: width || 100,
      height: height || 100,
      ...rest
    };
  }
  
  // 添加节点到画布
  addNode(options) {
    const { id, component, x, y, width, height, data } = options;
    
    if (!component) {
      throw new Error('Component is required when adding a node');
    }
    
    if (!this.registeredNodes[component]) {
      throw new Error(`Node type '${component}' is not registered`);
    }
    
    // 获取节点默认配置
    const defaultConfig = this.registeredNodes[`${component}-config`] || {};
    
    // 创建响应式节点实例
    const node = reactive({
      id: id || `node-${++this.nodeIdCounter}`,
      component,
      x: x !== undefined ? x : defaultConfig.x,
      y: y !== undefined ? y : defaultConfig.y,
      width: width || defaultConfig.width,
      height: height || defaultConfig.height,
      data: data || {}
    });
    
    // 添加到响应式节点列表
    this.nodes.push(node);
    
    return node;
  }
  
  // 获取节点
  getNode(id) {
    return this.nodes.find(node => node.id === id);
  }
  
  // 更新节点
  updateNode(id, updates) {
    const node = this.getNode(id);
    if (node) {
      // 直接修改响应式节点对象的属性
      Object.assign(node, updates);
    }
  }
  
  // 删除节点
  removeNode(id) {
    const index = this.nodes.findIndex(node => node.id === id);
    if (index !== -1) {
      // 从响应式数组中删除节点
      this.nodes.splice(index, 1);
    }
  }
  
  // 销毁画布
  destroy() {
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
    
    this.nodes = [];
    this.registeredNodes = {};
  }
}

export default Graph;