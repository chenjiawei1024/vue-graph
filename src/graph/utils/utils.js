/**
 * 深度合并对象
 * @param {Object} target - 目标对象
 * @param {...Object} sources - 源对象，可以多个
 * @returns {Object} 合并后的对象
 */
export function deepAssign(target, ...sources) {
  if (typeof target !== 'object' || target === null) {
    target = {};
  }

  for (const source of sources) {
    if (typeof source !== 'object' || source === null) {
      continue;
    }

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const targetValue = target[key];
        const sourceValue = source[key];

        if (
          typeof sourceValue === 'object' &&
          sourceValue !== null &&
          !Array.isArray(sourceValue) &&
          typeof targetValue === 'object' &&
          targetValue !== null &&
          !Array.isArray(targetValue)
        ) {
          // 递归深度合并
          target[key] = deepAssign(targetValue, sourceValue);
        } else {
          // 直接覆盖
          target[key] = sourceValue;
        }
      }
    }
  }

  return target;
}

/**
 * 深度克隆对象
 * @param {*} obj - 要克隆的对象
 * @returns {*} 克隆后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}
