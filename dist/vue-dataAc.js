/*!
  * vue-dataAc v2.0.8
  * (c) 2020 adminV
  * @license MIT
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.VueDataAc = factory());
}(this, (function () { 'use strict';

  /**
   * 暴露插件接口
   * */
  function install(Vue, options, VueDataAc) {
    if (install.installed) { return }
    install.installed = true;

    Vue.mixin({
      watch: {
        $route: function $route(to, from) {
          /**
           *  路由变化进行页面访问的采集
           * */
          if(this.$vueDataAc && this.$vueDataAc.installed && this.$vueDataAc._options.openPage){
            this.$vueDataAc._mixinRouterWatch(to, from, true);
          }
        }
      },
      beforeCreate: function beforeMount(){
        /**
         * 组件性能监控，可能因为某些场景下的数据异常，导致组件不能正常渲染或者渲染慢
         * 我们希望对每个组件进行监控生命周期耗时
         * */
        if (this.$vueDataAc && this.$vueDataAc.installed && this.$vueDataAc._options.openComponent){
          this.$vueDataAc._mixinComponentsPerformanceStart(this);
        }
        /**
         *  上报当前页面url
         * */
        if(this._uid === this.$root._uid){
          if(this.$vueDataAc && this.$vueDataAc.installed && this.$vueDataAc._options.openPage){
            this.$vueDataAc._mixinRouterWatch(null, null, false);
          }
        }
      },
      beforeDestroy: function beforeDestroy() {
        /**
         * 根元素移除时手动上报，以免累计条数不满足 sizeLimit
         * */
        if (this.$vueDataAc && this.$vueDataAc.installed && this._uid === this.$root._uid) {
          this.$vueDataAc && this.$vueDataAc.postAcData();
        }
      },
      /**
       * 在组件渲染完成后，尝试进行事件劫持
       * mounted 不会保证所有的子组件也都一起被挂载
       * 所以使用 vm.$nextTick
       * */
      mounted: function mounted() {
        if(this.$vueDataAc && this.$vueDataAc.installed){
          //input 时间监听
          if(this.$vueDataAc._options.openInput){
            this.$vueDataAc._componentLoadCount++;
            this.$nextTick(function () {
              --this.$vueDataAc._componentLoadCount === 0 && this.$vueDataAc._mixinInputEvent(this);
            });
          }

          //组件性能监控
          if(this.$vueDataAc._options.openComponent){
            this.$nextTick(function(){
              this.$vueDataAc._mixinComponentsPerformanceEnd(this);
            });
          }
        }
      },
      beforeUpdate: function beforeUpdate() {
        /**
         * 组件性能监控，可能因为某些场景下的数据异常，导致组件不能正常渲染或者渲染慢
         * 我们希望对每个组件进行监控生命周期耗时
         * */
        if (this.$vueDataAc && this.$vueDataAc.installed && this.$vueDataAc._options.openComponent){
          this.$vueDataAc._mixinComponentsPerformanceStart(this);
        }
      },
      updated: function updated() {
        if(this.$vueDataAc && this.$vueDataAc.installed && this.$vueDataAc._options.openComponent){
          //组件性能监控
          this.$nextTick(function(){
            this.$vueDataAc._mixinComponentsPerformanceEnd(this);
          });
        }
      }
    });

    Vue.prototype.$vueDataAc = new VueDataAc(options, Vue);
  }

  /**
   * 全局配置
   * */
  var BASEOPTIONS = {
    storeVer     : '2.0.8',  //Vue 版本dataAc
    /**
     *  标识类作为数据上报的key，在后台数据分析时进行数据区分，不需要动态配置
     * */
    storeInput     : "ACINPUT",    //输入框行为采集标识
    storePage      : "ACPAGE",     //页面访问信息采集标识
    storeClick     : "ACCLIK",     //点击事件采集标识
    storeReqErr    : "ACRERR",     //请求异常采集标识
    storeTiming    : "ACTIME",     //页面性能采集标识
    storeCodeErr   : "ACCERR",     //代码异常采集标识
    storeCustom    : "ACCUSTOM",   //自定义事件采集标识 (2.0新增）
    storeSourceErr : "ACSCERR",    //资源加载异常采集标识 (2.0新增）
    storePrmseErr  : "ACPRERR",    //promise抛出异常 (2.0新增）
    storeCompErr   : "ACCOMP",     //Vue组件性能监控 (2.0新增）
    storeVueErr    : "ACVUERR",    //Vue异常监控 (2.0新增）

    /**
     *  全局开关，用来修改采集内容
     * */
    userSha      : 'vue_ac_userSha',   //用户标识存储key，有冲突可修改
    useImgSend      : true,     //默认使用图片上报数据, false为xhr请求接口上报
    useStorage      : true,     //是否使用storage作为存储载体, 设置为 false 时使用cookie,
    maxDays         : 365,      //如果使用cookie作为存储载体，此项生效，配置cookie存储时间，默认一年
    openInput       : true,     //是否开启输入数据采集
    openCodeErr     : true,     //是否开启代码异常采集
    openClick       : true,     //是否开启点击数据采集
    openXhrQuery    : true,     //是否采集接口异常时的参数params
    openXhrHock     : true,     //是否开启xhr异常采集
    openPerformance : true,     //是否开启页面性能采集
    openPage        : true,     //是否开启页面访问信息采集 (2.0新增）
    openVueErr      : true,     //是否开启Vue异常监控 (2.0新增）
    openSourceErr   : true,     //是否开启资源加载异常采集 (2.0新增）
    openPromiseErr  : true,     //是否开启promise异常采集 (2.0新增）

    /**
     * 因为某些场景下的数据异常，导致组件不能正常渲染或者渲染慢，有几率是因为客户硬件问题导致
     * 所以需要做数据采样统计后才能得出结论
     * */
    openComponent   : true,     //是否开启组件性能采集 (2.0新增）
    maxComponentLoadTime : 1000,//组件渲染时间阈值，大于此时间采集信息 (2.0新增）

    /**
     * 我们认为请求时间过长也是一种异常，有几率是因为客户网络问题导致
     * 所以请求超时的上报需要做采样统计后才能得出结论
     * 所以不算是异常或警告级别，应该算通知级别
     * */
    openXhrTimeOut  : true,     //是否开启请求超时上报 (2.0新增）
    maxRequestTime  : 10000,    //请求时间阈值，请求到响应大于此时间，会上报异常，openXhrTimeOut 为 false 时不生效 (2.0新增）
    customXhrErrCode: '',   //支持自定义响应code，当接口响应中的code为指定内容时上报异常

    /**
     * 输入行为采集相关配置，通过以下配置修改要监控的输入框,
     * 设置 input 采集全量输入框，也可以通过修改 selector 配置实现主动埋点
     * 设置 selector 为 `input.isjs-ac` 为主动埋点，只会采集class为isjs-ac的输入框
     * ignoreInputType 存在的目的是为了从安全角度排除 type 为 password 的输入框
     * 有更好方案请提给我  Thanks♪(･ω･)ﾉ
     * */
    selector        : 'input',     //通过控制输入框的选择器来限定监听范围,使用document.querySelector进行选择，值参考：https://www.runoob.com/cssref/css-selectors.html
    ignoreInputType : ['password', 'file'],   //忽略的输入框type，不建议采集密码输入框内容

    /**
     *  点击行为采集相关配置，通过 classTag 进行主动埋点和自动埋点的切换：
     *  classTag 配置为 'isjs-ac' 只会采集 class 包含 isjs-ac 的元素
     *  classTag 配置为 '' 会采集所有被点击的元素，当然也会导致数据量大。
     * */
    classTag     : '',          //主动埋点标识, 自动埋点时请配置空字符串
    maxHelpfulCount     : 5,    //为了使上报数据准确，我们会递归父元素，找到一个有样式的祖先元素，此项配置递归次数

    /**
     * 以下内容为可配置信息，影响插件逻辑功能
     * */
    imageUrl     : "http://data.isjs.cn/lib/image/ac.png",   //《建议》 图片上报地址（通过1*1px图片接收上报信息）
    postUrl      : "http://data.isjs.cn/logStash/push",       // 数据上报接口

    /**
     * 对上报频率的限制项 (2.0新增）
     * */
    openReducer: false,   //是否开启节流,用于限制上报频率
    sizeLimit: 20,        //操作数据超过指定条目时自动上报
    cacheEventStorage: 'ac_cache_data',        //开启节流后数据存储key
    manualReport: false   //手动上报，需要手动执行postAcData(),开启后 sizeLimit 配置失效
  };

  /**
   * 判断是否为空
   * */
  function ac_util_isNullOrEmpty(obj) {
    return (obj !== 0 || obj !== "0") && (obj === undefined || typeof obj === "undefined" || obj === null || obj === "null" || obj === "");
  }

  /**
   * 判断是否为空对象
   * */
  function ac_util_isEmptyObject(obj) {
    for (var key in obj) {
      return false;
    }
    return true;
  }

  /**
   * 获取有效点击元素，埋点采集只上报埋点元素
   * 全量采集找有ID或class的元素
   * */
  function ac_util_getHelpfulElement(target, options, length){
    if ( length === void 0 ) length = 0;

    //向上遍历到document，此次点击失效
    if (Object.prototype.toString.call(target) === Object.prototype.toString.call(document)){
      return null;
    }
    var parentNode = target && target.parentNode;
    var className = target.className; if ( className === void 0 ) className = '';
    var id = target.id;
    var classTag = options.classTag;
    var maxHelpfulCount = options.maxHelpfulCount;
    //主动埋点
    if (!ac_util_isNullOrEmpty(classTag)) {
      //未命中
      if(className.indexOf(classTag) < 0){
        if(ac_util_isNullOrEmpty(parentNode)){
          return null;
        }else {
          if(length > maxHelpfulCount){
            return null;
          }else {
            return ac_util_getHelpfulElement(parentNode, options, ++length)
          }
        }
      }else {
          return target
      }
    }else {
      //全量采集
      if(length > maxHelpfulCount){
        return null;
      }
      if (ac_util_isNullOrEmpty(className) && ac_util_isNullOrEmpty(id)) {
        if(ac_util_isNullOrEmpty(parentNode)){
          return null;
        }else {
          return ac_util_getHelpfulElement(parentNode, options, ++length)
        }
      }else {
        return target
      }
    }
  }

  /**
   * 获取元素所有属性
   * */
  function ac_util_getAllAttr(elem) {
    var len = (elem.attributes ? elem.attributes.length : 0);
    var obj = {};
    if (len > 0) {
      for (var i = 0; i < len; i++) {
        var attr = elem.attributes[i];
        obj[attr.nodeName] = attr.nodeValue.replace(/"/igm, "'");
      }
    }
    return obj;
  }

  /**
   * 判断是否定义
   * @param v 变量
   * */
  function ac_util_isDef(v) {
    return v !== undefined;
  }

  /**
   * 数据存储，可通过 useStorage 配置修改存储位置
   * @param name * 存储key
   * @param value * 存储内容
   * @param Day 存储时长，maxDays
   * @param options 配置信息
   * */
  function ac_util_setStorage(options, name, value, Day) {
    if (options.useStorage) {
      window.localStorage.setItem(name, value);
    } else {
      if (!Day) { Day = options.maxDays; }
      var exp = new Date();
      exp.setTime(exp.getTime() + Day * 24 * 60 * 60000);
      document.cookie = name + "=" + (encodeURIComponent(value)) + ";expires=" + (exp.toUTCString()) + ";path=/";
    }
  }

  /**
   * 存储读取
   * @param name * 存储key
   * @param options 配置信息
   * */
  function ac_util_getStorage(options, name) {
    if (!name) { return null; }
    if (options.useStorage) {
      return window.localStorage.getItem(name);
    } else {
      var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
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
  function ac_util_delStorage(options, name) {
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
  function ac_util_getUuid(len, radix) {
    if ( len === void 0 ) len = 16;
    if ( radix === void 0 ) radix = 16;
  //uuid长度以及进制
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [];
    for (var i = 0; i < len; i++) { uuid[i] = chars[0 | Math.random() * radix]; }
    return uuid.join('');
  }

  /**
   * 获取时间戳
   * @return timeStamp: Number
   * */
  function ac_util_getTime() {
    var date = new Date();
    return {
      timeStr: ((date.getFullYear()) + "/" + (date.getMonth() + 1) + "/" + (date.getDate()) + " " + (date.getHours()) + ":" + (date.getMinutes()) + ":" + (date.getSeconds())),
      timeStamp: date.getTime()
    }
  }

  /**
   * 配置项合并
   * */
  function ac_util_mergeOption(userOpt, baseOpt) {
    var newOpt = {};
    var keys = Object.keys(baseOpt);

    for (var i = 0; i < keys.length; i++) {
      newOpt[keys[i]] = ac_util_isDef(userOpt[keys[i]]) ? userOpt[keys[i]] : baseOpt[keys[i]];
    }

    return newOpt;
  }

  /**
   * 配置项检查
   * */
  function ac_util_checkOptions(options) {
    var flag = true;
    if (ac_util_isEmptyObject(options)) {
      ac_util_warn("--------配置项异常：不能为空------");
      return false;
    }
    var notEmpty = ['storeInput', 'storePage', 'storeClick', 'storeReqErr', 'storeTiming', 'storeCodeErr', 'storeCustom',
      'storeSourceErr', 'storePrmseErr', 'storeCompErr', 'storeVueErr',
      'userSha', 'useImgSend', 'useStorage', 'maxDays', 'openInput', 'openCodeErr', 'openClick', 'openXhrQuery',
      'openXhrHock', 'openPerformance', 'openPage', 'openVueErr', 'openSourceErr', 'openPromiseErr', 'openComponent', 'openXhrTimeOut'];
    notEmpty.map(function (key) {
      if (ac_util_isNullOrEmpty(options[key])) {
        ac_util_warn(("--------配置项【" + key + "】不能为空------"));
        flag = false;
      }
    });
    // 上报方式检查
    if (options['useImgSend']) {
      if (ac_util_isNullOrEmpty(options['imageUrl'])) {
        ac_util_warn("--------使用图片上报数据，需要配置 【imageUrl】------");
        return false;
      }
    } else {
      if (ac_util_isNullOrEmpty(options['postUrl'])) {
        ac_util_warn("--------使用接口上报数据，需要配置 【postUrl】------");
        return false;
      }
    }

    //输入框采集配置
    if (options['openInput']) {
      if (ac_util_isNullOrEmpty(options['selector'])) {
        ac_util_warn("--------请指定输入框选择器：selector------");
        return false;
      }
    }
    //存储配置
    if (options['useStorage']) {
      if (typeof window.localStorage === 'undefined') {
        ac_util_warn("--------当前容器不支持Storage存储：useStorage------");
        return false;
      }
    }
    return flag
  }

  /**
   *  警告
   * */
  function ac_util_warn(message) {
    {
      typeof console !== 'undefined' && console.warn(("[vue-dataAc] " + message));
    }
  }

  /**
   *  内嵌AJAX
   * */
  function ac_util_ajax(options) {
    if ( options === void 0 ) options = {};

    var xhr, params;
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
  function ac_util_formatVueErrStack(error) {
    var msg = error.toString();
    var stack = error.stack ? error.stack
      .replace(/\n/gi, "") // 去掉换行
      .replace(/\bat\b/gi, "@")
      .replace(/\?[^:]+/gi, "")
      .replace(/^\s*|\s*$/g, "")
      .split("@") // 以@分割信息
      .slice(0, 5) //只取5条
      .join("&&") : '';
    if (stack.indexOf(msg) < 0) { stack = msg + "@" + stack; }
    return stack;
  }

  /**
   * 原生事件涉及到移除与绑定，所以缓存VueDataAc
   * */
  var _VueDataAc;

  var VueDataAc = function VueDataAc(options, Vue) {
    if ( options === void 0 ) options = {};
    if ( Vue === void 0 ) Vue = {};

    var newOptions = ac_util_mergeOption(options, BASEOPTIONS);
    if(!ac_util_checkOptions(newOptions)){
      this.installed = false;
      return
    }
    this.installed = true;
    this._options = newOptions;
    this._vue_ = Vue;
    _VueDataAc = this;

    this._uuid = ac_util_getStorage(this._options, this._options.userSha);
    if (ac_util_isNullOrEmpty(this._uuid)) {
      this._uuid = ac_util_getUuid();
      ac_util_setStorage(this._options, this._options.userSha, this._uuid);
    }

    var cacheEventData = ac_util_getStorage(this._options, this._options.cacheEventStorage);
    this._acData = ac_util_isNullOrEmpty(cacheEventData) ? [] : JSON.parse(cacheEventData);
    this._proxyXhrObj = {};   //代理xhr
    this._inputCacheData = {};//缓存输入框输入信息
    this._componentsTime = {};//缓存组件加载时间
    this._lastRouterStr = ''; //防止路由重复采集
    this._userToken = '';     //关联后台token
    this._pageInTime = 0;     //防止路由重复采集
    this._componentLoadCount = 0; //保证所有组件渲染完成
    this._componentTimeCount = 0; //保证所有组件渲染完成
    this._init();
  };

  /**
   * 页面初始化
   * */
  VueDataAc.prototype._init = function _init () {
    /**
     * 异常监控初始化
     * */
    if (this._options.openVueErr) {
      this._initVueErrAc();
    }

    /**
     * 异常监控初始化
     * */
    if (this._options.openCodeErr) {
      this._initCodeErrAc();
    }

    /**
     * 资源监控初始化
     * */
    if (this._options.openSourceErr) {
      this._initSourceErrAc();
    }

    /**
     * Promise监控初始化
     * */
    if (this._options.openPromiseErr) {
      this._initPromiseErrAc();
    }

    /**
     * 点击事件代理初始化
     * */
    if (this._options.openClick) {
      this._initClickAc();
    }

    /**
     * xhr代理初始化
     * */
    if (this._options.openXhrQuery) {
      this._initXhrErrAc();
    }

    /**
     * 性能上报初始化
     * */
    if (this._options.openPerformance) {
      this._initPerformance();
    }
  };

  /**
   *混入vue生命周期 Mounted
   *用来绑定全局代理事件，当根元素渲染完成后绑定
   *@param VueRoot 根元素
   * */
  VueDataAc.prototype._mixinInputEvent = function _mixinInputEvent (VueRoot) {
    var ref = this._options;
      var ignoreInputType = ref.ignoreInputType;
      var selector = ref.selector;
    var _ACIDoms = document.querySelectorAll(selector);
    for (var i = 0, len = _ACIDoms.length; i < len; i++) {
      var selector$1 = _ACIDoms[i];
      if (selector$1.type && ignoreInputType.indexOf(selector$1.type.toLowerCase()) < 0) {
        /**
         * 因为有弹窗类的组件中途添加，所以先移除，再添加
         * 避免重复绑定
         */
        selector$1.removeEventListener("input", this._formatInputEvent);
        selector$1.removeEventListener("blur", this._formatBlurEvent);

        selector$1.addEventListener("input", this._formatInputEvent);
        selector$1.addEventListener("blur", this._formatBlurEvent);
      }
    }
  };

  /**
   *混入vue生命周期 beforeCreate
   *用来监控组件渲染性能
   *@param Component 组件
   * */
  VueDataAc.prototype._mixinComponentsPerformanceStart = function _mixinComponentsPerformanceStart (Component){
    var $vnode = Component.$vnode; if ( $vnode === void 0 ) $vnode = {};
    var tag = $vnode.tag;
    //没有tag的组件不做采集，找不到唯一标识
    if(ac_util_isNullOrEmpty(tag)){
      return;
    }

    Component.$_vueAc_bc_time = ac_util_getTime().timeStamp;
    Component.$vueDataAc._componentTimeCount++;
  };

  /**
   *混入vue生命周期 Mounted
   *用来监控组件渲染性能
   *@param Component 组件
   * */
  VueDataAc.prototype._mixinComponentsPerformanceEnd = function _mixinComponentsPerformanceEnd (Component){
    var createdTime = Component.$_vueAc_bc_time;
    var $vnode = Component.$vnode; if ( $vnode === void 0 ) $vnode = {};
    var tag = $vnode.tag;

    //没有tag的组件不做采集，找不到唯一标识
    if(ac_util_isNullOrEmpty(createdTime) || ac_util_isNullOrEmpty(tag)){
      return;
    }

    var nowTime = ac_util_getTime().timeStamp;
    var loadTime = parseInt(nowTime - createdTime);

    if(loadTime >= Component.$vueDataAc._options.maxComponentLoadTime){
      if(ac_util_isNullOrEmpty(Component.$vueDataAc._componentsTime[tag])){
        Component.$vueDataAc._componentsTime[tag] = [];
      }
      Component.$vueDataAc._componentsTime[tag].push(loadTime);
    }

    var isLoaded = (--Component.$vueDataAc._componentTimeCount === 0);

    if(isLoaded && !ac_util_isEmptyObject(Component.$vueDataAc._componentsTime)){
      this._setAcData(Component.$vueDataAc._options.storeCompErr, {
        componentsTimes: Component.$vueDataAc._componentsTime
      });
      Component.$vueDataAc._componentsTime = {};
    }
  };

  /**
   * 输入事件
   * */
  VueDataAc.prototype._formatInputEvent = function _formatInputEvent (e) {
    var event = window.event || e;
    var target = event.srcElement ? event.srcElement : event.target;
    var id = target.id;
      var className = target.className;
      var value = target.value;
      var innerText = target.innerText;
    var attrs = ac_util_getAllAttr(target);
    var _value = value || innerText;
    var _now = ac_util_getTime().timeStamp;
    var inputKey = '';
    /**
     * 尝试用所有属性做key，异常情况下拼接id+class
     * */
    try {
      inputKey = JSON.stringify(attrs);
    } catch (e) {
      inputKey = id + "-" + className;
    }

    var cacheData = _VueDataAc._inputCacheData[inputKey];
    if (ac_util_isNullOrEmpty(cacheData) || ac_util_isEmptyObject(cacheData)) {
      cacheData = {
        value: ("0:" + _value),
        timeStamp: _now
      };
    } else {
      cacheData = {
        value: ((cacheData.value) + "," + (parseInt(_now - cacheData.timeStamp)) + ":" + _value),
        timeStamp: _now
      };
    }
    _VueDataAc._inputCacheData[inputKey] = cacheData;
  };

  /**
   * 失焦事件
   * */
  VueDataAc.prototype._formatBlurEvent = function _formatBlurEvent (e) {
    var event = window.event || e;
    var target = event.srcElement ? event.srcElement : event.target;
    var id = target.id;
      var className = target.className;
    var attrs = ac_util_getAllAttr(target);
    var inputKey = '';
    /**
     * 尝试用所有属性做key，异常情况下拼接id+class
     * */
    try {
      inputKey = JSON.stringify(attrs);
    } catch (e) {
      inputKey = id + "-" + className;
    }

    var cacheData = _VueDataAc._inputCacheData[inputKey];
    if (ac_util_isNullOrEmpty(cacheData)) { return; }

    _VueDataAc._inputCacheData[inputKey] = null;
    _VueDataAc._setAcData(_VueDataAc._options.storeInput, {
      eId: id,
      className: className,
      val: cacheData.value,
      attrs: attrs
    });
  };

  /**
   *混入vue watch 用来监控路由变化
   * */
  VueDataAc.prototype._mixinRouterWatch = function _mixinRouterWatch (to, from, isVueRouter) {
      if ( to === void 0 ) to = {};
      if ( from === void 0 ) from = {};

    var toPath = '';
    var toParams = {};
    var fromPath = '';
    var formParams = {};
    var _lastRouterStr = '';

    if(isVueRouter){
      toPath = to.fullPath || to.path || to.name;
      toParams = ac_util_isEmptyObject(to.params) ? to.query : to.params;
      fromPath = from.fullPath || from.path || from.name;
      formParams = ac_util_isEmptyObject(from.params) ? from.query : from.params;
      _lastRouterStr = this._lastRouterStr;
      if (_lastRouterStr === (toPath + "-" + (JSON.stringify(toParams)))) {
        return
      }
    }else {
      _lastRouterStr = ac_util_getStorage(this._options, ("_vueac_" + (this._options.storePage))) || '';
      toPath = window.location.href;
      toParams = { search: window.location.search };
      fromPath = _lastRouterStr;
      formParams = {};
    }

    //该情况认为是根页面渲染，留给页面级信息上报
    if (isVueRouter && (ac_util_isNullOrEmpty(toPath) || ac_util_isNullOrEmpty(fromPath))) {
      return;
    }

    this._lastRouterStr = toPath + "-" + (JSON.stringify(toParams));
    ac_util_setStorage(this._options,("_vueac_" + (this._options.storePage)), (toPath + "-" + (JSON.stringify(toParams))));

    this._setAcData(this._options.storePage, {
      toPath: toPath,
      toParams: toParams,
      fromPath: fromPath,
      formParams: formParams
    });

    if(this._options.openReducer && !this._options.manualReport){
      this.postAcData && this.postAcData();
    }
  };

  /**
   *初始化点击事件
   * */
  VueDataAc.prototype._initClickAc = function _initClickAc () {
      var this$1 = this;

    document.addEventListener("click", function (e) {
      var event = window.event || e;
      var target = event.srcElement ? event.srcElement : event.target;
      var helpfulElement = ac_util_getHelpfulElement(target, this$1._options);

      if(!ac_util_isNullOrEmpty(helpfulElement)){
        var className = helpfulElement.className;
          var id = helpfulElement.id;
          var value = helpfulElement.value;
          var innerText = helpfulElement.innerText;
        var attrs = ac_util_getAllAttr(helpfulElement);
        this$1._setAcData(this$1._options.storeClick, {
          eId: id,
          className: className,
          val: (value || innerText).substr(0, 20),
          attrs: attrs
        });
      }
    });
  };

  /**
   *初始化请求劫持
   * */
  VueDataAc.prototype._initXhrErrAc = function _initXhrErrAc () {
    var _nativeAjaxOpen = XMLHttpRequest.prototype.open;
    var _nativeAjaxSend = XMLHttpRequest.prototype.send;
    var _nativeAjaxonReady = XMLHttpRequest.onreadystatechange;
    this._proxyXhrObj = {
      open: function () {
        this._ac_method = (arguments[0] || [])[0];
        return (_nativeAjaxOpen && _nativeAjaxOpen.apply(this, arguments));
      },
      send: function () {
        this._ac_send_time = ac_util_getTime().timeStamp;
        this._ac_post_data = (arguments[0] || [])[0] || '';
        this.addEventListener('error', function (xhr) {
          _VueDataAc._formatXhrErrorData(xhr.target);
        });

        this.onreadystatechange = function (xhr) {
          _VueDataAc._formatXhrErrorData(xhr.target);
          _nativeAjaxonReady && _nativeAjaxonReady.apply(this, arguments);
        };

        return (_nativeAjaxSend && _nativeAjaxSend.apply(this, arguments));
      }
    };

    XMLHttpRequest.prototype.open = this._proxyXhrObj.open;
    XMLHttpRequest.prototype.send = this._proxyXhrObj.send;
  };

  VueDataAc.prototype._formatXhrErrorData = function _formatXhrErrorData (xhr) {
    var _ajax = xhr;
    var method = _ajax.method;
      var send_time = _ajax.send_time; if ( send_time === void 0 ) send_time = 0;
      var post_data = _ajax.post_data; if ( post_data === void 0 ) post_data = {};
      var readyState = _ajax.readyState;

    if (readyState === 4) {
      var status = _ajax.status;
        var statusText = _ajax.statusText;
        var response = _ajax.response;
        var responseURL = _ajax.responseURL;
      var ready_time = ac_util_getTime().timeStamp;
      var requestTime = ready_time - (send_time || ready_time);
      var ref = _VueDataAc._options;
        var openXhrTimeOut = ref.openXhrTimeOut;
        var storeReqErr = ref.storeReqErr;
        var customXhrErrCode = ref.customXhrErrCode;
        var openXhrQuery = ref.openXhrQuery;

      var isTimeOut = requestTime > _VueDataAc._options.maxRequestTime;
      var isHttpErr = (!(status >= 200 && status < 208) && (status !== 0 && status !== 302));
      var isCustomErr = (!ac_util_isNullOrEmpty(customXhrErrCode) && (("" + (response && response.code)) === customXhrErrCode));
      var isReportErr = (!ac_util_isNullOrEmpty(responseURL) && responseURL === _VueDataAc._options.postUrl); //避免上报接口异常导致死循环

      if (((openXhrTimeOut && isTimeOut) || isHttpErr || isCustomErr) && !isReportErr) {
        _VueDataAc._setAcData(storeReqErr, {
          responseURL: responseURL,
          method: method,
          isHttpErr: isHttpErr,
          isCustomErr: isCustomErr,
          readyState: readyState,
          status: status,
          statusText: statusText,
          requestTime: requestTime,
          response: ('' + response).substr(0, 100),
          query: openXhrQuery ? post_data : ''
        });
      }
    }
  };

  /**
   *初始化页面性能
   * */
  VueDataAc.prototype._initPerformance = function _initPerformance () {
    if (window.performance) {
      var performance = window.performance || {};
      var _timing = performance.timing;

      if (!ac_util_isNullOrEmpty(_timing)) {
        var loadAcData = {
          WT: _timing.responseStart - _timing.navigationStart, //白屏时间
          TCP: _timing.connectEnd - _timing.connectStart, //TCP连接耗时
          ONL: _timing.loadEventEnd - _timing.loadEventStart, //执行onload事件耗时
          ALLRT: _timing.responseEnd - _timing.requestStart, //所有请求耗时
          TTFB: _timing.responseStart - _timing.navigationStart, //TTFB 即 Time To First Byte,读取页面第一个字节的时间
          DNS: _timing.domainLookupEnd - _timing.domainLookupStart //DNS查询时间
        };
        this._setAcData(this._options.storeTiming, loadAcData);
      }
    }
  };

  /**
   *初始化Vue异常监控
   * */
  VueDataAc.prototype._initVueErrAc = function _initVueErrAc () {
      var this$1 = this;

    this._vue_ && this._vue_.config && (this._vue_.config.errorHandler = function (error, vm, info) {
        if ( error === void 0 ) error = {};

      var componentName = vm._isVue
        ? ((vm.$options && vm.$options.name) || (vm.$options && vm.$options._componentTag))
        : vm.name;
      var fileName = (vm._isVue && vm.$options && vm.$options.__file)
        ? (vm.$options && vm.$options.__file)
        : "";
      var propsData = vm.$options && vm.$options.propsData;

      this$1._setAcData(this$1._options.storeVueErr, {
        componentName: componentName,
        fileName: fileName,
        propsData: propsData,
        info: info,
        msg: error.message || '',
        stack: ac_util_formatVueErrStack(error)
      });
    });
  };

  /**
   *初始化代码异常监控
   * */
  VueDataAc.prototype._initCodeErrAc = function _initCodeErrAc () {
      var arguments$1 = arguments;
      var this$1 = this;

    /**
     * 全局异常
     * */
    window.onerror = function (msg, url, line, col, err) {
      //屏蔽跨域脚本异常， 建议跨域脚本增加 crossorigin
      if (ac_util_isNullOrEmpty(url) && msg === "Script error.") {
        return false;
      }

      var codeErrData = {
        msg: msg,
        line: line,
        col: col
      };
      codeErrData.col = col || (window.event && window.event.errorCharacter) || 0;

      //屏蔽关闭网页时的Network Error
      setTimeout(function () {
        if (err && err.stack) {
          //可以直接使用堆栈信息
          codeErrData.err = err.stack.toString();
        } else if (arguments$1.callee) {
          //尝试通过callee获取异常堆栈
          var errmsg = [];
          var f = arguments$1.callee.caller;
          var c = 3;//防止堆栈信息过大
          while (f && (--c > 0)) {
            errmsg.push(f.toString());
            if (f === f.caller) {
              break;
            }
            f = f.caller;
          }
          errmsg = errmsg.join(",");
          codeErrData.err = errmsg;
        } else {
          codeErrData.err = "script err";
        }
        this$1._setAcData(this$1._options.storeCodeErr, codeErrData);
      }, 0);
    };
  };

  /**
   *初始化资源加载异常监听
   * */
  VueDataAc.prototype._initSourceErrAc = function _initSourceErrAc () {
      var this$1 = this;

    window.addEventListener('error', function (event) {
      var eventType = [].toString.call(event, event);
      if (eventType === "[object Event]") {
        var theTag = event.target || event.srcElement || event.originalTarget || {};
        var href = theTag.href;
          var src = theTag.src;
          var currentSrc = theTag.currentSrc;
          var localName = theTag.localName;
        var tagName = theTag.tagName || localName;
        var outerHTML = theTag.outerHTML;

        var resourceUri = href || src;

        if (tagName === "IMG" && !ac_util_isNullOrEmpty(theTag.onerror)) {
          //存在行内的 error事件终止执行
          return false;
        }

        //优化请求内容，对大标签内容进行截取
        if (outerHTML && outerHTML.length > 200) {
          outerHTML = outerHTML.slice(0, 200);
        }

        this$1._setAcData(this$1._options.storeSourceErr, {
          tagName: tagName,
          outerHTML: outerHTML,
          resourceUri: resourceUri,
          currentSrc: currentSrc
        });
      }
    });
  };

  /**
   *初始化 Promise 异常监听
   *在使用Promise的时候，如果没有声明catch代码块
   *Promise的异常会被抛出
   * */
  VueDataAc.prototype._initPromiseErrAc = function _initPromiseErrAc () {
      var this$1 = this;

    window.addEventListener('unhandledrejection', function (event) {
      this$1._setAcData(this$1._options.storePrmseErr, {
        reason: event.reason || "unknown"
      });
      // 如果想要阻止继续抛出，即会在控制台显示 `Uncaught(in promise) Error` 的话，调用以下函数
      event.preventDefault();
    });
  };

  /**
   * 数据采集存储, 包含数据格式化
   * options，当前采集的对象
   * */
  VueDataAc.prototype._setAcData = function _setAcData (options, data) {
      var this$1 = this;

    var _Ac = {
      uuid: this._uuid,
      t: this._userToken
    };
    switch (options) {
      case this._options.storePage: {
        var toPath = data.toPath;
          var toParams = data.toParams;
          var fromPath = data.fromPath;
          var formParams = data.formParams;
        var pageInTime = this._pageInTime;
        var nowTime = ac_util_getTime().timeStamp;
        this._pageInTime = nowTime;

        _Ac['acData'] = {
          type: this._options.storePage,
          sTme: nowTime,
          fromPath: fromPath,
          formParams: formParams,
          toPath: toPath,
          toParams: toParams,
          inTime: pageInTime,
          outTime: nowTime
        };
      }
        break;
      case this._options.storeInput: {
        var eId = data.eId;
          var className = data.className;
          var val = data.val;
          var attrs = data.attrs;
        _Ac['acData'] = {
          type: this._options.storeInput,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          eId: eId,
          className: className,
          val: val,
          attrs: attrs
        };
      }
        break;
      case this._options.storeClick: {
        var eId$1 = data.eId;
          var className$1 = data.className;
          var val$1 = data.val;
          var attrs$1 = data.attrs;
        _Ac['acData'] = {
          type: this._options.storeClick,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          eId: eId$1,
          className: className$1,
          val: val$1,
          attrs: attrs$1
        };
      }
        break;
      case this._options.storeReqErr: {
        var responseURL = data.responseURL;
          var method = data.method;
          var isHttpErr = data.isHttpErr;
          var isCustomErr = data.isCustomErr;
          var readyState = data.readyState;
          var status = data.status;
          var statusText = data.statusText;
          var requestTime = data.requestTime;
          var response = data.response;
          var query = data.query;
        _Ac['acData'] = {
          type: this._options.storeReqErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          errSubType: isHttpErr ? 'http' : (isCustomErr ? 'custom' : 'time'),
          responseURL: responseURL,
          method: method,
          readyState: readyState,
          status: status,
          statusText: statusText,
          requestTime: requestTime,
          response: response,
          query: query
        };
      }
        break;
      case this._options.storeVueErr: {
        var componentName = data.componentName;
          var fileName = data.fileName;
          var propsData = data.propsData;
          var info = data.info;
          var msg = data.msg;
          var stack = data.stack;
        _Ac['acData'] = {
          type: this._options.storeVueErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          componentName: componentName,
          fileName: fileName,
          propsData: propsData,
          info: info,
          msg: msg,
          err: stack
        };
      }
        break;
      case this._options.storeCodeErr: {
        var msg$1 = data.msg;
          var line = data.line;
          var col = data.col;
          var err = data.err;
        _Ac['acData'] = {
          type: this._options.storeCodeErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          msg: msg$1,
          line: line,
          col: col,
          err: err
        };
      }
        break;
      case this._options.storeSourceErr: {
        var tagName = data.tagName;
          var outerHTML = data.outerHTML;
          var resourceUri = data.resourceUri;
          var currentSrc = data.currentSrc;
        _Ac['acData'] = {
          type: this._options.storeSourceErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          fileName: currentSrc,
          resourceUri: resourceUri,
          tagName: tagName,
          outerHTML: outerHTML
        };
      }
        break;
      case this._options.storePrmseErr: {
        var reason = data.reason;
        _Ac['acData'] = {
          type: this._options.storePrmseErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          reason: reason
        };
      }
        break;
      case this._options.storeCustom: {
        var cusKey = data.cusKey;
          var cusVal = data.cusVal;
        _Ac['acData'] = {
          type: this._options.storeCustom,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          cusKey: cusKey,
          cusVal: cusVal
        };
      }
        break;
      case this._options.storeTiming: {
        var WT = data.WT;
          var TCP = data.TCP;
          var ONL = data.ONL;
          var ALLRT = data.ALLRT;
          var TTFB = data.TTFB;
          var DNS = data.DNS;
        _Ac['acData'] = {
          type: this._options.storeTiming,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          WT: WT,
          TCP: TCP,
          ONL: ONL,
          ALLRT: ALLRT,
          TTFB: TTFB,
          DNS: DNS
        };
      }
        break;
      case this._options.storeCompErr:{
        var componentsTimes = data.componentsTimes;
        _Ac['acData'] = {
          type: this._options.storeCompErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          componentsTimes: componentsTimes
        };
      }
        break;
      default:
        ac_util_warn("--------系统错误：0x00000001------");
    }
    this._acData.push(_Ac);
    if (this._options.openReducer) {
      ac_util_setStorage(this._options, this._options.cacheEventStorage, JSON.stringify(this._acData));
      if (!this._options.manualReport && this._options.sizeLimit && this._acData.length >= this._options.sizeLimit) {
        if (this._vue_ && this._vue_.$nextTick) {
          this._vue_.$nextTick(function () {
            this$1.postAcData();
          });
        } else {
          this.postAcData();
        }
      }
    } else {
      if (this._vue_ && this._vue_.$nextTick) {
        this._vue_.$nextTick(function () {
          this$1.postAcData();
        });
      } else {
        this.postAcData();
      }
    }
  };

  /**
   * 自定义数据上报
   * */
  VueDataAc.prototype.setCustomAc = function setCustomAc (data) {
    var cusKey = data.cusKey; if ( cusKey === void 0 ) cusKey = 'custom';
      var cusVal = data.cusVal; if ( cusVal === void 0 ) cusVal = '';
    this._setAcData(this._options.storeCustom, {
      cusKey: cusKey,
      cusVal: cusVal
    });
  };

  /**
   *数据上报, 可以根据实际场景进行上报优化：
   *默认当事件触发就会自动上报，频率为一个事件1次上报
   *如果频率过大，可以使用 openReducer， sizeLimit，manualReport进行节流
   * */
  VueDataAc.prototype.postAcData = function postAcData () {
    if (ac_util_isNullOrEmpty(this._acData) || this._acData.length === 0) {
      return;
    }

    var reqData = JSON.stringify(this._acData);

    if (this._options.useImgSend) {
      //图片上报
      new Image().src = (this._options.imageUrl) + "?acError=" + reqData;
    } else {
      //接口上报
      ac_util_ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: reqData,
        url: this._options.postUrl
      });
    }
    /**
     * 上报完成，清空数据
     * */
    this._acData = [];
    ac_util_delStorage(this._options, this._options.cacheEventStorage);
  };

  /**
   * 关联后台session
   * */
  VueDataAc.prototype.setUserToken = function setUserToken (value) {
    this._userToken = value;
  };

  VueDataAc.install = function (Vue, options) { return install(Vue, options, VueDataAc); };
  VueDataAc.version = '2.0.8';

  return VueDataAc;

})));
