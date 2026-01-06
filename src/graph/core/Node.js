class Node {
  constructor(options, defaultConfig = {}) {
    const {
      id,
      component,
      x,
      y,
      width,
      height,
      data = {}
    } = options;

    this.id = id;
    this.component = component;
    this.x = x !== undefined ? x : defaultConfig.x || 0;
    this.y = y !== undefined ? y : defaultConfig.y || 0;
    this.width = width !== undefined ? width : defaultConfig.width || 100;
    this.height = height !== undefined ? height : defaultConfig.height || 100;
    this.data = data;
  }

  position(x, y) {
    if (x !== undefined && y !== undefined) {
      this.x = x;
      this.y = y;
      return this;
    }
    return { x: this.x, y: this.y };
  }

  size(width, height) {
    if (width !== undefined && height !== undefined) {
      this.width = width;
      this.height = height;
      return this;
    }
    return { width: this.width, height: this.height };
  }

  setData(key, value) {
    if (typeof key === 'object') {
      Object.assign(this.data, key);
    } else {
      this.data[key] = value;
    }
    return this;
  }

  getData(key) {
    if (key) {
      return this.data[key];
    }
    return this.data;
  }

  toJSON() {
    return {
      id: this.id,
      component: this.component,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      data: this.data
    };
  }
}

export default Node;
