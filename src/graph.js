import { createApp, defineComponent, h, ref, reactive, watch } from 'vue';
import MyDraggableResizable from './components/MyDraggableResizable.vue';

class Graph {
  constructor(config) {
    this.config = {
      container: null,
      width: 800,
      height: 600,
      parent: true, // 是否开启父容器限制
      snapline: {
        enable: true, // 是否开启对齐线
        className: 'snapline', // 对齐线 className
        tolerance: 5, // 对齐线吸附距离
        resizing: true, // 是否开启组件缩放时的对齐
        center: true // 是否开启画布居中对齐
      },
      ...config
    };
    
    this.registeredNodes = {};
    this.nodes = reactive([]);
    this.nodeIdCounter = 0;
    this.snaplineData = reactive({
      vLine: [
        { display: false, position: '', origin: '', lineLength: '' },
        { display: false, position: '', origin: '', lineLength: '' },
        { display: false, position: '', origin: '', lineLength: '' }
      ],
      hLine: [
        { display: false, position: '', origin: '', lineLength: '' },
        { display: false, position: '', origin: '', lineLength: '' },
        { display: false, position: '', origin: '', lineLength: '' }
      ]
    });
    
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
    
    // 如果用户没有传入自定义 className，则注入默认样式
    if (!this.config.snapline || !this.config.snapline.className) {
      this.addDefaultSnaplineStyles();
    }
    
    // 创建Vue应用实例
    const graphInstance = this;
    this.app = createApp({
      setup() {
        return {
          nodes: graphInstance.nodes,
          graphInstance
        };
      },
      render() {
        const snaplineConfig = this.graphInstance.config.snapline;
        const snaplineData = this.graphInstance.snaplineData;
        
        const children = [];
        
        if (snaplineConfig.enable) {
          const className = snaplineConfig.className || 'snapline';
          const containerWidth = this.graphInstance.config.width;
          const containerHeight = this.graphInstance.config.height;
          
          snaplineData.vLine.forEach((line, index) => {
            if (line.display) {
              children.push(h('div', {
                class: className,
                style: {
                  position: 'absolute',
                  left: line.position,
                  top: '0',
                  width: '1px',
                  height: `${containerHeight}px`,
                  zIndex: 1000,
                  pointerEvents: 'none'
                },
                key: `vline-${index}`
              }));
            }
          });
          
          snaplineData.hLine.forEach((line, index) => {
            if (line.display) {
              children.push(h('div', {
                class: className,
                style: {
                  position: 'absolute',
                  left: '0',
                  top: line.position,
                  width: `${containerWidth}px`,
                  height: '1px',
                  zIndex: 1000,
                  pointerEvents: 'none'
                },
                key: `hline-${index}`
              }));
            }
          });
        }
        
        this.nodes.forEach(node => {
          const NodeComponent = this.graphInstance.registeredNodes[node.component];
          if (!NodeComponent) return;

          children.push(h(MyDraggableResizable, {
            x: node.x,
            y: node.y,
            w: node.width,
            h: node.height,
            parent: this.graphInstance.config.parent,
            snapline: snaplineConfig,
            onDragging: (e, position) => {
              this.graphInstance.updateNodeById(node.id, { x: position.x, y: position.y });
            },
            onDragStop: (e, position) => {
              this.graphInstance.updateNodeById(node.id, { x: position.x, y: position.y });
              this.graphInstance.clearSnaplines();
            },
            onResizing: (e, bounds) => {
              this.graphInstance.updateNodeById(node.id, {
                x: bounds.x,
                y: bounds.y,
                width: bounds.w,
                height: bounds.h
              });
            },
            onResizeStop: (e, bounds) => {
              this.graphInstance.updateNodeById(node.id, {
                x: bounds.x,
                y: bounds.y,
                width: bounds.w,
                height: bounds.h
              });
              this.graphInstance.clearSnaplines();
            },
            onRefLineParams: (data) => {
              if (snaplineConfig.enable) {
                this.graphInstance.processSnaplineData(data);
              }
            }
          }, {
            default: () => h(NodeComponent, {
              data: node.data,
              node: node,
              graph: this.graphInstance
            })
          }));
        });
        
        return h('div', {
          style: {
            position: 'relative',
            width: '100%',
            height: '100%'
          }
        }, children);
      }
    });
    
    // 挂载应用到容器
    this.app.mount(container);
  }
  
  clearSnaplines() {
    this.snaplineData.vLine.forEach(line => {
      line.display = false;
      line.position = '';
      line.origin = '';
      line.lineLength = '';
    });
    this.snaplineData.hLine.forEach(line => {
      line.display = false;
      line.position = '';
      line.origin = '';
      line.lineLength = '';
    });
  }
  
  addDefaultSnaplineStyles() {
    if (this.defaultSnaplineStylesAdded) return;
    
    const style = document.createElement('style');
    const defaultClassName = 'snapline';
    
    style.textContent = `
      .${defaultClassName} {
        background-color: #5cb85c;
      }
    `;
    
    document.head.appendChild(style);
    this.defaultSnaplineStylesAdded = true;
  }
  
  processSnaplineData(data) {
    const vLine = data.vLine || [];
    const hLine = data.hLine || [];
    
    if (vLine[2] && vLine[2].display) {
      vLine[0].display = false;
      vLine[1].display = false;
    }
    
    if (hLine[2] && hLine[2].display) {
      hLine[0].display = false;
      hLine[1].display = false;
    }
    
    this.snaplineData.vLine = vLine;
    this.snaplineData.hLine = hLine;
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
  getNodeById(id) {
    return this.nodes.find(node => node.id === id);
  }
  
  // 更新节点（差量更新：仅更新传入的属性，深度遍历）
  updateNodeById(id, updates) {
    const node = this.getNodeById(id);
    if (!node) return;

    function deepAssign(target, source) {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (
            typeof source[key] === 'object' &&
            source[key] !== null &&
            !Array.isArray(source[key]) &&
            typeof target[key] === 'object' &&
            target[key] !== null &&
            !Array.isArray(target[key])
          ) {
            // 递归深度合并
            deepAssign(target[key], source[key]);
          } else {
            // 直接覆盖
            target[key] = source[key];
          }
        }
      }
    }

    deepAssign(node, updates);
  }
  
  // 删除节点
  removeNodeById(id) {
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