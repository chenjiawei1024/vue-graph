/**
 * 事件系统 - 用于处理画布和节点的事件监听与触发
 */
class EventSystem {
  constructor() {
    // 事件监听列表，格式: { eventName: [{ callback, ns, once }] }
    this._events = {};
    // 事件上下文，用于传递给事件回调
    this._context = {};
    // 事件ID计数器
    this._eventId = 0;
  }

  /**
   * 设置事件上下文
   * @param {Object} context - 事件上下文对象
   */
  setContext(context) {
    this._context = context;
    return this;
  }

  /**
   * 监听事件
   * @param {string} eventName - 事件名称，可以包含命名空间，如 'node:click.graph'
   * @param {Function} callback - 事件回调函数
   * @param {Object} options - 事件选项
   * @param {boolean} [options.once=false] - 是否只触发一次
   * @returns {number} 事件ID，用于移除事件监听
   */
  on(eventName, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    const { once = false } = options;
    const { name, ns } = this._parseEventName(eventName);
    
    this._events[name] = this._events[name] || [];
    
    const eventId = ++this._eventId;
    this._events[name].push({
      id: eventId,
      callback,
      ns,
      once
    });

    return eventId;
  }

  /**
   * 监听一次事件
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 事件回调函数
   * @returns {number} 事件ID
   */
  once(eventName, callback) {
    return this.on(eventName, callback, { once: true });
  }

  /**
   * 移除事件监听
   * @param {string|number} eventNameOrId - 事件名称或事件ID
   * @param {Function} [callback] - 事件回调函数，不传则移除指定事件的所有监听
   */
  off(eventNameOrId, callback) {
    // 如果是事件ID，移除对应的事件
    if (typeof eventNameOrId === 'number') {
      for (const eventName in this._events) {
        const listeners = this._events[eventName];
        const index = listeners.findIndex(listener => listener.id === eventNameOrId);
        if (index !== -1) {
          listeners.splice(index, 1);
          if (listeners.length === 0) {
            delete this._events[eventName];
          }
          return;
        }
      }
      return;
    }

    // 移除所有事件
    if (!eventNameOrId) {
      this._events = {};
      return;
    }

    const { name, ns } = this._parseEventName(eventNameOrId);
    const listeners = this._events[name];

    if (!listeners) {
      return;
    }

    // 移除指定事件的所有监听
    if (!callback && !ns) {
      delete this._events[name];
      return;
    }

    // 过滤保留不需要移除的监听器
    this._events[name] = listeners.filter(listener => {
      // 如果指定了回调，则只保留不同的回调
      if (callback && listener.callback !== callback) {
        return true;
      }
      // 如果指定了命名空间，则只保留不同命名空间的监听器
      if (ns && listener.ns !== ns) {
        return true;
      }
      // 否则移除
      return false;
    });

    // 如果该事件没有监听器了，删除该事件
    if (this._events[name].length === 0) {
      delete this._events[name];
    }
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {Object} [eventData={}] - 事件数据
   * @returns {boolean} 返回事件是否被阻止冒泡
   */
  trigger(eventName, eventData = {}) {
    const { name } = this._parseEventName(eventName);
    const listeners = this._events[name] || [];

    // 构造完整的事件对象
    const event = {
      ...eventData,
      ...this._context,
      name: eventName,
      stopPropagation: () => {
        event.propagationStopped = true;
      },
      preventDefault: () => {
        event.defaultPrevented = true;
      },
      propagationStopped: false,
      defaultPrevented: false
    };

    // 复制一份监听器列表，防止在触发过程中监听器被修改
    const listenersCopy = [...listeners];

    for (let i = 0; i < listenersCopy.length; i++) {
      const listener = listenersCopy[i];
      try {
        listener.callback.call(this._context, event);
      } catch (error) {
        console.error(`Error in event listener for '${eventName}':`, error);
      }

      // 如果是一次性事件，触发后移除
      if (listener.once) {
        this.off(eventName, listener.callback);
      }
    }

    return event.propagationStopped;
  }

  /**
   * 解析事件名称，提取事件名和命名空间
   * @param {string} eventName - 事件名称，如 'node:click.graph'
   * @returns {Object} 包含name和ns属性的对象
   * @private
   */
  _parseEventName(eventName) {
    const parts = eventName.split('.');
    return {
      name: parts[0],
      ns: parts[1] || null
    };
  }

  /**
   * 获取所有事件监听器
   * @returns {Object} 事件监听器列表
   */
  getAllListeners() {
    return { ...this._events };
  }

  /**
   * 检查是否有指定事件的监听器
   * @param {string} eventName - 事件名称
   * @returns {boolean} 是否有监听器
   */
  hasListeners(eventName) {
    const { name } = this._parseEventName(eventName);
    return !!(this._events[name] && this._events[name].length > 0);
  }
}

export default EventSystem;
