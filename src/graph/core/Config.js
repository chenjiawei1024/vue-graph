/**
 * 配置管理 - 用于处理画布的配置合并、验证和管理
 */
import { deepAssign } from '../utils/utils.js';

// 默认配置
const DEFAULT_CONFIG = {
  // 画布基本配置
  width: 800,
  height: 600,
  parent: true, // 是否开启父容器限制
  
  // 对齐线配置
  snapline: {
    enable: true, // 是否开启对齐线
    className: 'snapline', // 对齐线 className
    tolerance: 5, // 对齐线吸附距离
    resizing: true, // 是否开启组件缩放时的对齐
    center: true // 是否开启画布居中对齐
  },
  
  // 背景配置
  background: {
    color: undefined,
    image: undefined,
    position: undefined,
    size: undefined,
    repeat: undefined,
    opacity: 1,
    quality: 1,
    angle: 0
  }
};

class Config {
  constructor(userConfig = {}) {
    // 合并默认配置和用户配置
    this.config = deepAssign({}, DEFAULT_CONFIG, userConfig);
    // 配置变更事件回调
    this._onChangeCallbacks = [];
  }

  /**
   * 获取配置值
   * @param {string} [key] - 配置键，支持点路径，如 'snapline.enable'
   * @param {*} [defaultValue] - 默认值
   * @returns {*} 配置值
   */
  get(key, defaultValue = undefined) {
    if (!key) {
      return this.config;
    }

    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value === undefined || value[k] === undefined) {
        return defaultValue;
      }
      value = value[k];
    }

    return value;
  }

  /**
   * 设置配置值
   * @param {string|Object} key - 配置键或配置对象
   * @param {*} [value] - 配置值，当key为对象时忽略
   * @returns {Config} 当前实例
   */
  set(key, value) {
    if (typeof key === 'object') {
      // 批量设置配置
      const oldConfig = { ...this.config };
      this.config = deepAssign({}, this.config, key);
      this._triggerChange(oldConfig, this.config, key);
    } else {
      // 单个设置配置
      const keys = key.split('.');
      const oldConfig = { ...this.config };
      let target = this.config;

      // 遍历到倒数第二个键
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!target[k] || typeof target[k] !== 'object') {
          target[k] = {};
        }
        target = target[k];
      }

      // 设置最后一个键的值
      const lastKey = keys[keys.length - 1];
      target[lastKey] = value;

      this._triggerChange(oldConfig, this.config, { [key]: value });
    }

    return this;
  }

  /**
   * 合并配置
   * @param {Object} config - 要合并的配置对象
   * @returns {Config} 当前实例
   */
  merge(config) {
    return this.set(config);
  }

  /**
   * 重置配置为默认值
   * @param {Object} [preserveConfig] - 要保留的配置
   * @returns {Config} 当前实例
   */
  reset(preserveConfig = {}) {
    const oldConfig = { ...this.config };
    this.config = deepAssign({}, DEFAULT_CONFIG, preserveConfig);
    this._triggerChange(oldConfig, this.config, preserveConfig);
    return this;
  }

  /**
   * 注册配置变更事件
   * @param {Function} callback - 变更回调函数
   * @returns {Function} 取消订阅函数
   */
  onChange(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    this._onChangeCallbacks.push(callback);

    // 返回取消订阅函数
    return () => {
      const index = this._onChangeCallbacks.indexOf(callback);
      if (index !== -1) {
        this._onChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 触发配置变更事件
   * @param {Object} oldConfig - 变更前的配置
   * @param {Object} newConfig - 变更后的配置
   * @param {Object} changedConfig - 变更的配置部分
   * @private
   */
  _triggerChange(oldConfig, newConfig, changedConfig) {
    for (const callback of this._onChangeCallbacks) {
      try {
        callback({
          oldConfig,
          newConfig,
          changedConfig
        });
      } catch (error) {
        console.error('Error in config change callback:', error);
      }
    }
  }

  /**
   * 验证配置
   * @returns {Object} 验证结果，包含valid和errors属性
   */
  validate() {
    const errors = [];

    // 验证基本配置
    if (this.config.width <= 0 || this.config.height <= 0) {
      errors.push('Width and height must be positive numbers');
    }

    // 验证对齐线配置
    if (typeof this.config.snapline.tolerance !== 'number' || this.config.snapline.tolerance < 0) {
      errors.push('Snapline tolerance must be a non-negative number');
    }

    // 验证背景配置
    if (this.config.background.opacity < 0 || this.config.background.opacity > 1) {
      errors.push('Background opacity must be between 0 and 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 转换为JSON格式
   * @returns {Object} JSON格式的配置
   */
  toJSON() {
    return JSON.parse(JSON.stringify(this.config));
  }
}

export default Config;
export { DEFAULT_CONFIG };
