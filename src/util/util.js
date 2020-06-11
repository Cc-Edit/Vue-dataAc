/**
 * 判断是否为空
 * */
export function ac_util_isNullOrEmpty(obj) {
  return (obj !== 0 || obj !== "0") && (obj === undefined || typeof obj === "undefined" || obj === null || obj === "null" || obj === "");
}

/**
 * 判断是否为空对象
 * */
export function ac_util_isEmptyObject(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

/**
 * 获取元素所有属性
 * */
export function ac_util_getAllAttr(elem) {
  let len = (elem.attributes ? elem.attributes.length : 0);
  let obj = {};
  if (len > 0) {
    for (let i = 0; i < len; i++) {
      let attr = elem.attributes[i];
      obj[attr.nodeName] = attr.nodeValue.replace(/"/igm, "'");
    }
  }
  return obj;
}

/**
 * 判断是否定义
 * @param v 变量
 * */
export function ac_util_isDef(v) {
  return v !== undefined;
}

/**
 * 数据存储，可通过 useStorage 配置修改存储位置
 * @param name * 存储key
 * @param value * 存储内容
 * @param Day 存储时长，maxDays
 * @param options 配置信息
 * */
export function ac_util_setStorage(options, name, value, Day) {
  if (options.useStorage) {
    window.localStorage.setItem(name, value);
  } else {
    if (!Day) Day = options.maxDays;
    let exp = new Date();
    exp.setTime(exp.getTime() + Day * 24 * 60 * 60000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${exp.toUTCString()};path=/`;
  }
}

/**
 * 存储读取
 * @param name * 存储key
 * @param options 配置信息
 * */
export function ac_util_getStorage(options, name) {
  if (!name) return null;
  if (options.useStorage) {
    return window.localStorage.getItem(name);
  } else {
    let arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr && arr.length > 1) {
      return (decodeURIComponent(arr[2]));
    } else {
      return null;
    }
  }
}

/**
 * 存储删除
 * @param name * 存储key
 * @param options 配置信息
 * */
export function ac_util_delStorage(options, name) {
  if (options.useStorage) {
    window.localStorage.removeItem(name);
  } else {
    ac_util_setStorage(options, name, '', -1);
  }
}

/**
 * 生成UUID
 * @param len * UUID长度,默认16
 * @param radix 进制，默认16
 * */
export function ac_util_getUuid(len = 16, radix = 16) {//uuid长度以及进制
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [], i;
  for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  return uuid.join('');
}

/**
 * 获取时间戳
 * @return timeStamp: Number
 * */
export function ac_util_getTime() {
  let date = new Date();
  return {
    timeStr: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
    timeStamp: date.getTime()
  }
}

/**
 * 配置项合并
 * */
export function ac_util_mergeOption(userOpt, baseOpt) {
  let newOpt = {};
  let key;
  const keys = Object.keys(baseOpt);

  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    newOpt[key] = ac_util_isDef(userOpt[key]) ? userOpt[key] : baseOpt[key];
  }

  return newOpt;
}

/**
 * 配置项检查
 * */
export function ac_util_checkOptions(options) {
  if (ac_util_isEmptyObject(options)) {
    ac_util_warn(`--------配置项异常：不能为空------`);
    return;
  }
  const notEmpty = ['storeInput', 'storePage', 'storeClick', 'storeReqErr', 'storeTiming', 'storeCodeErr',
    'userSha', 'useImgSend', 'useStorage', 'maxDays', 'openInput', 'openCodeErr', 'openClick', 'openXhrData',
    'openXhrHock', 'openPerformance', 'openPage']
  notEmpty.map(key => {
    if (ac_util_isNullOrEmpty(options[key])) {
      ac_util_warn(`--------配置项【${key}】不能为空------`)
    }
  });

  // 上报方式检查
  if (options['useImgSend']) {
    if (ac_util_isNullOrEmpty(options['imageUrl'])) {
      ac_util_warn(`--------使用图片上报数据，需要配置 【imageUrl】------`)
    }
  } else {
    if (ac_util_isNullOrEmpty(options['postUrl'])) {
      ac_util_warn(`--------使用接口上报数据，需要配置 【postUrl】------`)
    }
  }

  //输入框采集配置
  if (options['openInput']) {
    if (ac_util_isNullOrEmpty(options['selector'])) {
      ac_util_warn(`--------请指定输入框选择器：selector------`)
    }
    if (ac_util_isNullOrEmpty(options['acRange'])) {
      ac_util_warn(`--------请指定输入框选择器类型：acRange------`)
    }
  }
  //存储配置
  if (options['useStorage']) {
    if (typeof window.localStorage == 'undefined') {
      ac_util_warn(`--------当前容器不支持Storage存储：useStorage------`)
    }
  }
}

/**
 *  警告
 * */
export function ac_util_warn(message) {
  if (process.env.NODE_ENV !== 'production') {
    typeof console !== 'undefined' && console.warn(`[vue-dataAc] ${message}`)
  }
}

/**
 *  内嵌AJAX
 * */
export function ac_util_ajax(options = {}) {
  let xhr, params;
  options.type = (options.type || "GET").toUpperCase();
  options.dataType = (options.dataType || "json");
  options.async = (options.async || true);
  if (options.data) {
    params = options.data;
  }
  if (window.XMLHttpRequest) {
    // 非IE6
    xhr = new XMLHttpRequest();
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType('text/xml');
    }
  } else {
    //IE6及其以下版本浏览器
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }

  if (options.type === "GET") {
    xhr.open("GET", options.url + "?" + params, options.async);
    xhr.send(null);
  } else if (options.type === "POST") {
    xhr.open("POST", options.url, options.async);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    if (params) {
      xhr.send(params);
    } else {
      xhr.send();
    }
  }
}

/**
 *  格式化Vue异常
 *
 * */
export function ac_util_formatVueErrStack(error) {
  const msg = error.toString();
  let stack = error.stack
    .replace(/\n/gi, "") // 去掉换行
    .replace(/\bat\b/gi, "@")
    .replace(/\?[^:]+/gi, "")
    .replace(/^\s*|\s*$/g, "")
    .split("@") // 以@分割信息
    .slice(0, 5) //只取5条
    .join("&&");
  if (stack.indexOf(msg) < 0) stack = msg + "@" + stack;
  return stack;
}