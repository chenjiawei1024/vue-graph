import { createApp, defineComponent, h, ref, reactive, watch } from 'vue';
import MyDraggableResizable from '../components/MyDraggableResizable.vue';
import Node from './core/Node.js';
import EventSystem from './core/EventSystem.js';
import Config from './core/Config.js';
import { deepAssign, deepClone } from './utils/utils.js';

class Graph {
  constructor(config) {
    // 初始化配置管理
    this.configManager = new Config(config);
    this.config = this.configManager.get();
    
    // 初始化事件系统
    this.eventSystem = new EventSystem();
    this.eventSystem.setContext({
      graph: this,
      container: null
    });
    
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
    
    // 监听配置变更
    this.configManager.onChange(({ oldConfig, newConfig, changedConfig }) => {
      this.config = newConfig;
      this.eventSystem.trigger('config:change', {
        oldConfig,
        newConfig,
        changedConfig
      });
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
    this.eventSystem.setContext({ ...this.eventSystem._context, container: this.container });
    
    // 如果用户没有传入自定义 className，则注入默认样式
    if (!this.config.snapline || !this.config.snapline.className) {
      this.addDefaultSnaplineStyles();
    }
    
    // 触发初始化完成事件
    this.eventSystem.trigger('initialized', {
      container: this.container,
      width: this.config.width,
      height: this.config.height
    });
    
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
    
    // 初始化背景
    if (this.config.background) {
      this.drawBackground(this.config.background);
    }
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
  
  drawBackground(options) {
    // 更新背景配置
    this.configManager.set('background', {
      ...this.config.background,
      ...options
    });

    // 应用背景样式到容器
    if (this.container) {
      const { background } = this.config;
      const styles = {
        backgroundColor: background.color || 'transparent',
        backgroundImage: background.image ? `url(${background.image})` : 'none',
        opacity: background.opacity
      };

      // 设置背景位置
      if (background.position) {
        if (typeof background.position === 'object') {
          styles.backgroundPosition = `${background.position.x}px ${background.position.y}px`;
        } else {
          styles.backgroundPosition = background.position;
        }
      }

      // 设置背景大小
      if (background.size) {
        if (typeof background.size === 'object') {
          styles.backgroundSize = `${background.size.width}px ${background.size.height}px`;
        } else {
          styles.backgroundSize = background.size;
        }
      }

      // 设置背景重复
      if (background.repeat) {
        styles.backgroundRepeat = background.repeat;
      }

      Object.assign(this.container.style, styles);
    }
  }

  clearBackground() {
    // 重置背景配置
    this.configManager.set('background', {
      color: undefined,
      image: undefined,
      position: undefined,
      size: undefined,
      repeat: undefined,
      opacity: 1,
      quality: 1,
      angle: 0
    });

    // 清除容器背景样式
    if (this.container) {
      const styles = {
        backgroundColor: 'transparent',
        backgroundImage: 'none',
        backgroundPosition: '0 0',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        opacity: 1
      };

      Object.assign(this.container.style, styles);
    }
  }

  /**
   * 监听事件
   * @param {string} eventName - 事件名称，可以包含命名空间，如 'node:click.graph'
   * @param {Function} callback - 事件回调函数
   * @param {Object} options - 事件选项
   * @returns {number} 事件ID
   */
  on(eventName, callback, options = {}) {
    return this.eventSystem.on(eventName, callback, options);
  }

  /**
   * 监听一次事件
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 事件回调函数
   * @returns {number} 事件ID
   */
  once(eventName, callback) {
    return this.eventSystem.once(eventName, callback);
  }

  /**
   * 移除事件监听
   * @param {string|number} eventNameOrId - 事件名称或事件ID
   * @param {Function} [callback] - 事件回调函数
   */
  off(eventNameOrId, callback) {
    this.eventSystem.off(eventNameOrId, callback);
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {Object} [eventData={}] - 事件数据
   * @returns {boolean} 是否阻止冒泡
   */
  trigger(eventName, eventData = {}) {
    return this.eventSystem.trigger(eventName, eventData);
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
    
    const nodeId = id || `node-${++this.nodeIdCounter}`;
    
    const defaultConfig = this.registeredNodes[`${component}-config`] || {};
    
    const nodeInstance = new Node({
      id: nodeId,
      component,
      x,
      y,
      width,
      height,
      data
    }, defaultConfig);
    
    const reactiveNode = reactive(nodeInstance);
    
    // 触发节点添加前事件
    const beforeEvent = {
      node: reactiveNode,
      options: options
    };
    
    if (this.eventSystem.trigger('node:beforeadd', beforeEvent)) {
      return null; // 如果事件被阻止，返回null
    }
    
    this.nodes.push(reactiveNode);
    
    // 触发节点添加事件
    this.eventSystem.trigger('node:add', {
      node: reactiveNode,
      index: this.nodes.length - 1
    });
    
    // 触发通用节点事件
    this.eventSystem.trigger('cell:add', {
      cell: reactiveNode,
      index: this.nodes.length - 1
    });
    
    return reactiveNode;
  }
  
  // 获取节点
  getNodeById(id) {
    return this.nodes.find(node => node.id === id);
  }
  
  // 更新节点（差量更新：仅更新传入的属性，深度遍历）
  updateNodeById(id, updates) {
    const node = this.getNodeById(id);
    if (!node) return;

    // 保存更新前的节点状态
    const oldNode = deepClone(node);

    // 触发节点更新前事件
    const beforeEvent = {
      node: node,
      oldNode: oldNode,
      updates: updates
    };
    
    if (this.eventSystem.trigger('node:beforeupdate', beforeEvent)) {
      return; // 如果事件被阻止，返回
    }

    deepAssign(node, updates);
    
    // 触发节点更新事件
    this.eventSystem.trigger('node:update', {
      node: node,
      oldNode: oldNode,
      updates: updates
    });
  }
  
  // 删除节点
  removeNodeById(id) {
    const node = this.getNodeById(id);
    if (!node) return;
    
    // 触发节点删除前事件
    const beforeEvent = {
      node: node
    };
    
    if (this.eventSystem.trigger('node:beforeremove', beforeEvent)) {
      return; // 如果事件被阻止，返回
    }
    
    const index = this.nodes.findIndex(n => n.id === id);
    if (index !== -1) {
      // 从响应式数组中删除节点
      this.nodes.splice(index, 1);
      
      // 触发节点删除事件
      this.eventSystem.trigger('node:remove', {
        node: node,
        index: index
      });
      
      // 触发通用节点事件
      this.eventSystem.trigger('cell:remove', {
        cell: node,
        index: index
      });
    }
  }
  
  // 销毁画布
  destroy() {
    // 触发销毁前事件
    if (this.eventSystem.trigger('beforedestroy')) {
      return; // 如果事件被阻止，返回
    }
    
    // 触发画布销毁事件
    this.eventSystem.trigger('destroy', {
      nodes: this.nodes,
      registeredNodes: this.registeredNodes
    });
    
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
    
    this.nodes = [];
    this.registeredNodes = {};
    
    // 清除事件监听
    this.eventSystem.off();
  }
}

export default Graph;
