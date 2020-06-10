/*!
  * vue-dataAc v2.0.1
  * (c) 2020 adminV
  * @license MIT
  */
/**
 * 判断是否为空
 * */
function ac_util_isNullOrEmpty (obj) {
  return ( obj !== 0 || obj !== "0" ) && ( obj === undefined || typeof obj === "undefined" || obj === null || obj === "null" || obj === "" );
}
/**
 * 判断是否为空对象
 * */
function ac_util_isEmptyObject ( obj ) {
  for( let key in obj ){
    return false;
  }
  return true;
}
/**
 * 获取元素所有属性
 * */
function ac_util_getAllAttr( elem ) {
  let len = (elem.attributes ? elem.attributes.length : 0);
  let obj = {};
  if(len > 0){
    for(let i = 0; i < len; i++){
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
function ac_util_isDef (v) { return v !== undefined; }

/**
 * 数据存储，可通过 useStorage 配置修改存储位置
 * @param name * 存储key
 * @param value * 存储内容
 * @param Day 存储时长，maxDays
 * @param options 配置信息
 * */
function ac_util_setStorage (options, name, value, Day) {
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
function ac_util_getStorage (options, name) {
  if (!name)return null;
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
 * 生成UUID
 * @param len * UUID长度,默认16
 * @param radix 进制，默认16
 * */
function ac_util_getUuid (len = 16, radix = 16) {//uuid长度以及进制
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [], i;
  for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  return uuid.join('');
}

/**
 * 获取时间戳
 * */
function ac_util_getTime () {
  let date = new Date();
  return {
    timeStr: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
    timeStamp: date.getTime()
  }
}

/**
 * 配置项合并
 * */
function ac_util_mergeOption (userOpt, baseOpt){
  let newOpt = {};
  let key;
  const keys  = Object.keys(baseOpt);

  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    newOpt[key] = ac_util_isDef(userOpt[key]) ? userOpt[key] : baseOpt[key];
  }

  return newOpt;
}

/**
 * 配置项检查
 * */
function ac_util_checkOptions (options){
  if(ac_util_isEmptyObject(options)){
    ac_util_warn(`--------配置项异常：不能为空------`);
    return;
  }
  const notEmpty = ['storeInput', 'storePage', 'storeClick', 'storeReqErr', 'storeTiming', 'storeCodeErr',
    'userSha', 'useImgSend', 'useStorage', 'maxDays', 'openInput', 'openCodeErr', 'openClick', 'openXhrData',
    'openXhrHock', 'openPerformance', 'openPage'];
  notEmpty.map(key => {
    if(ac_util_isNullOrEmpty(options[key])){
      ac_util_warn(`--------配置项【${key}】不能为空------`);
    }
  });

  // 上报方式检查
  if(options['useImgSend']){
    if(ac_util_isNullOrEmpty(options['imageUrl'])){
      ac_util_warn(`--------使用图片上报数据，需要配置 【imageUrl】------`);
    }
  }else {
    if(ac_util_isNullOrEmpty(options['postUrl'])){
      ac_util_warn(`--------使用接口上报数据，需要配置 【postUrl】------`);
    }
  }

  //输入框采集配置
  if(options['openInput']){
    if(ac_util_isNullOrEmpty(options['selector'])){
      ac_util_warn(`--------请指定输入框选择器：selector------`);
    }
    if(ac_util_isNullOrEmpty(options['acRange'])){
      ac_util_warn(`--------请指定输入框选择器类型：acRange------`);
    }
  }
  //存储配置
  if(options['useStorage']){
    if(typeof window.localStorage == 'undefined'){
      ac_util_warn(`--------当前容器不支持Storage存储：useStorage------`);
    }
  }
}
/**
 *  警告
 * */
function ac_util_warn (message) {
  {
    typeof console !== 'undefined' && console.warn(`[vue-dataAc] ${message}`);
  }
}

/**
 *  内嵌AJAX
 * */
function ac_util_ajax (options = {} ) {
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
function  ac_util_formatVueErrStack(error) {
  const msg = error.toString();
  let stack = error.stack
    .replace(/\n/gi, "") // 去掉换行
    .replace(/\bat\b/gi, "@")
    .replace(/\?[^:]+/gi, "")
    .replace(/^\s*|\s*$/g, "")
    .split("@") // 以@分割信息
    .slice(0, 5) //只取5条
    .join("&&");
  if (stack.indexOf(msg) < 0)  stack = msg + "@" + stack;
  return stack;
}

/**
 * 暴露插件接口
 * */
function install (Vue, options, VueDataAc) {
  if (install.installed) return
  install.installed = true;

  Vue.mixin({
    watch:{
      $route(to, from) {
        /**
         *  路由变化进行页面访问的采集
         * */
        this.$vueDataAc && this.$vueDataAc._mixinRouterWatch(to, from);
      }
    },
    /**
     * 在组件渲染完成后，尝试进行事件劫持
     * mounted 不会保证所有的子组件也都一起被挂载
     * 所以使用 vm.$nextTick
     * */
    mounted () {
      this.$vueDataAc._componentCount++;
      this.$vueDataAc && this.$vueDataAc._options.openInput && this.$nextTick(function () {
        --this.$vueDataAc._componentCount === 0 && this.$vueDataAc._mixinMounted(this);
      });
    }
  });

  Vue.prototype.$vueDataAc = new VueDataAc(options, Vue);
}

/**
 * 全局配置
 * */
const BASEOPTIONS = {
  storeVer     : '2.0.1',  //Vue 版本dataAc
  /**
   *  标识类作为数据上报的key，在后台数据分析时进行数据区分，不需要动态配置
   * */
  storeInput     : "ACINPUT",    //输入采集标识
  storePage      : "ACPAGE",     //页面采集标识
  storeClick     : "ACCLIK",     //点击事件采集标识
  storeReqErr    : "ACRERR",     //请求异常采集标识
  storeTiming    : "ACTIME",     //页面时间采集标识
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
  useStorage      : true,     //默认使用storage,
  maxDays         : 365,      //如果使用cookie，此项生效，配置cookie生效时间，默认一年
  openInput       : true,     //是否开启输入数据采集
  openCodeErr     : true,     //是否开启代码异常采集
  openClick       : true,     //是否开启点击数据采集
  openXhrData     : true,     //是否采集接口异常时的参数params
  openXhrHock     : true,     //是否开启xhr异常采集
  openPerformance : true,     //是否开启页面性能采集
  openPage        : true,     //是否开启页面访问信息采集 (2.0新增）
  openVueErr      : true,     //是否开启Vue异常监控 (2.0新增）
  openSourceErr   : true,     //是否开启资源加载异常采集 (2.0新增）
  openPromiseErr  : true,     //是否开启promise异常采集 (2.0新增）
  openComponent   : true,     //是否开启组件性能采集 (2.0新增）


  /**
   * 输入行为采集相关配置，通过以下配置修改要监控的输入框,
   * 设置 input 采集全量输入框，也可以通过修改 selector 配置实现主动埋点
   * 设置 selector 为 `input.isjs-ac` 为主动埋点，只会采集class为isjs-ac的输入框
   * acRange 存在的目的是为了从安全角度排除 type 为 password 的输入框
   * 有更好方案请提给我  Thanks♪(･ω･)ﾉ
   * */
  selector     : 'input',     //通过控制输入框的选择器来限定监听范围,使用document.querySelector进行选择，值参考：https://www.runoob.com/cssref/css-selectors.html
  acRange      : ['text','tel', 'password'],   //输入框采集范围, 不建议采集密码输入框内容，此处只为展示用

  /**
   *  点击行为采集相关配置，通过 classTag 进行主动埋点和自动埋点的切换：
   *  classTag 配置为 'isjs-ac' 只会采集 class 包含 isjs-ac 的元素
   *  classTag 配置为 '' 会采集所有被点击的元素，当然也会导致数据量大。
   *  因为点击事件存在事件冒泡，我们会把父元素也采集到此次事件中，以保证精准定位，
   *  可以通过 acbLength 控制冒泡层级
   * */
  classTag     : '',      //主动埋点标识, 自动埋点时请配置空字符串
  acbLength    : 2,           //点击元素采集层数，自动埋点时会向上层查找，该选项可以配置查找层数

  /**
   * 以下内容为可配置信息，影响插件逻辑功能
   * */
  imageUrl     : "http://open.isjs.cn/admin/ac.png",   //《建议》 图片上报地址（通过1*1px图片接收上报信息）
  postUrl      : "http://open.isjs.cn/logStash/push",       // 数据上报接口

  /**
   * 对上报频率的限制项 (2.0新增）
   * */
  openReducer: false,   //是否开启节流,用于限制上报频率
  sizeLimit: 20,        //操作数据超过指定条目时自动上报
  lifeReport: false,    //开启懒惰上报，组件destroy时统一上报
  manualReport: false   //手动上报，需要手动执行postAcData(),开启后 lifeReport，sizeLimit配置失效
};

class VueDataAc {

  /**
   * @param options 配置项
   * @param Vue 当前Vue实例， 主要目的是使用nextTick, 保证数据上报不影响页面展示效率
   * */
  constructor (options = {}, Vue = {}) {
    let newOptions = ac_util_mergeOption(options, BASEOPTIONS);
    ac_util_checkOptions(newOptions);
    this._options = newOptions;
    this._vue_ = Vue;

    this._uuid = ac_util_getStorage(this._options, this._options.userSha);
    if(ac_util_isNullOrEmpty(this._uuid)){
      this._uuid = ac_util_getUuid();
      ac_util_setStorage(this._options, this._options.userSha, this._uuid);
    }

    this._acData = [];
    this._inputCacheData = []; //缓存输入框输入信息
    this._lastRouterStr = ''; //防止路由重复采集
    this._userToken = ''; //关联后台token
    this._pageInTime = 0; //防止路由重复采集
    this._componentCount = 0; //保证所有组件渲染完成
    this._init();
  }
  /**
   * 页面初始化
   * */
  _init(){
    /**
     * 异常监控初始化
     * */
    if(this._options.openVueErr){
      this._initVueErrAc();
    }

    /**
     * 异常监控初始化
     * */
    if(this._options.openCodeErr){
      this._initCodeErrAc();
    }

    /**
     * 资源监控初始化
     * */
    if(this._options.openSourceErr){
      this._initSourceErrAc();
    }

    /**
     * Promise监控初始化
     * */
    if(this._options.openPromiseErr){
      this._initPromiseErrAc();
    }

    /**
     * 点击事件代理初始化
     * */
    if(this._options.openClick){
      this._initClickAc();
    }


    if(this._options.openXhrData){
      this._initXhrErrAc();
    }

    if(this._options.openPerformance){
      this._initPerformance();
    }
  }

  /**
   *  混入vue生命周期 Mounted
   *  用来绑定全局代理事件，当根元素渲染完成后绑定
   *  @param VueRoot 根元素
   * */
  _mixinMounted(VueRoot){
    let {acRange, selector} = this._options;
    let _ACIDoms = document.querySelectorAll(selector);
    for (let i = 0, len = _ACIDoms.length; i < len; i++) {
      let selector = _ACIDoms[i];
      if (selector.type && acRange.indexOf(selector.type.toLowerCase()) > -1) {
        /**
         * 因为有弹窗类的组件中途添加，所以先移除，再添加
         * 避免重复绑定
         */
        selector.removeEventListener("input", this._formatInputEvent);
        selector.removeEventListener("blur", this._formatBlurEvent);

        selector.addEventListener("input", this._formatInputEvent);
        selector.addEventListener("blur", this._formatBlurEvent);
      }
    }
  }
  /**
   * 输入事件
   * */
  _formatInputEvent(e){
    console.log(e);
  }
  /**
   * 失焦事件
   * */
  _formatBlurEvent(e){
    console.log(e);
  }
  /**
   *  混入vue watch 用来监控路由变化
   * */
  _mixinRouterWatch(to = {}, from = {}){
    let toPath = to.fullPath || to.path || to.name;
    let toParams = ac_util_isEmptyObject(to.params) ? to.query : to.params;
    let fromPath = from.fullPath || from.path || from.name;
    let formParams = ac_util_isEmptyObject(from.params) ? from.query : from.params;
    if(this._lastRouterStr === `${toPath}-${JSON.stringify(toParams)}`){
      return
    }

    if(!ac_util_isNullOrEmpty(toPath) && !ac_util_isNullOrEmpty(fromPath)){
      this._lastRouterStr = `${toPath}-${JSON.stringify(toParams)}`;
      this._setAcData(this._options.storePage, {
        toPath,
        toParams,
        fromPath,
        formParams
      });
    }
  }

  /**
   *  初始化点击事件
   * */
  _initClickAc(){
    document.addEventListener("click",  (e) => {
      let event = window.event || e;
      let target = event.srcElement ? event.srcElement : event.target;
      let className = target.className;
      let { classTag } = this._options;
      //主动埋点未命中
      if(!ac_util_isNullOrEmpty(classTag) && className.indexOf(classTag) < 0){
        return;
      }
      let attrs = ac_util_getAllAttr(target);

      this._setAcData(this._options.storeClick, {
        eId: target.id,
        className: target.className,
        val: (target.value || target.innerText).substr(0, 20),
        attrs
      });
    });
  }

  /**
   *  初始化请求劫持
   * */
  _initXhrErrAc(){}

  /**
   *  初始化页面性能
   * */
  _initPerformance(){}
  /**
   *  初始化Vue异常监控
   * */
  _initVueErrAc(){
    this._vue_ && this._vue_.config && (this._vue_.config.errorHandler = (error = {}, vm, info) => {
      const componentName = vm._isVue
                            ? ((vm.$options && vm.$options.name) || (vm.$options && vm.$options._componentTag))
                              : vm.name;
      const fileName = (vm._isVue && vm.$options && vm.$options.__file)
                        ? (vm.$options && vm.$options.__file)
                        : "";
      const propsData = vm.$options && vm.$options.propsData;


      this._setAcData(this._options.storeVueErr, {
        componentName,
        fileName,
        propsData,
        info,
        msg: error.message || '',
        stack: ac_util_formatVueErrStack(error),
      });
    });
  }
  /**
   *  初始化代码异常监控
   * */
  _initCodeErrAc(){
    /**
     * 全局异常
     * */
    window.onerror = (msg, url, line, col, err) => {
      //屏蔽跨域脚本异常， 建议跨域脚本增加 crossorigin
      if (ac_util_isNullOrEmpty(url) && msg === "Script error.") {
        return false;
      }

      let codeErrData = {
        msg: msg,
        line: line,
        col: col
      };
      codeErrData.col = col || (window.event && window.event.errorCharacter) || 0;

      //屏蔽关闭网页时的Network Error
      setTimeout(() => {
        if (!!err && !!err.stack) {
          //可以直接使用堆栈信息
          codeErrData.err = err.stack.toString();
        } else if (!!arguments.callee) {
          //尝试通过callee获取异常堆栈
          let errmsg = [];
          let f = arguments.callee.caller, c = 3;//防止堆栈信息过大
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
        this._setAcData(this._options.storeCodeErr, codeErrData);
      }, 0);
    };

  }
  /**
   *  初始化资源加载异常监听
   * */
  _initSourceErrAc(){
    window.addEventListener('error', (event) => {
      const eventType = [].toString.call(event, event);
      if (eventType === "[object Event]") {
        let theTag = event.target || event.srcElement || event.originalTarget || {};
        let { tagName, outerHTML = '', href, src, currentSrc, localName } = theTag;
        tagName = tagName|| localName;

        let resourceUri = href || src;

        if (tagName === "IMG" && !ac_util_isNullOrEmpty(theTag.onerror)) {
          //存在行内的 error事件  终止执行
          return false;
        }

        //优化请求内容，对大标签内容进行截取
        if(outerHTML && outerHTML.length > 200){
          outerHTML = outerHTML.slice(0, 200);
        }

        this._setAcData(this._options.storeSourceErr, {
          tagName,
          outerHTML,
          resourceUri,
          currentSrc
        });
      }
    });
  }

  /**
   *  初始化 Promise 异常监听
   *  在使用Promise的时候，如果没有声明catch代码块
   *  Promise的异常会被抛出
   * */
  _initPromiseErrAc(){
    window.addEventListener('unhandledrejection', (event) => {
      this._setAcData(this._options.storePrmseErr, {
        reason: event.reason || "unknown",
      });
      // 如果想要阻止继续抛出，即会在控制台显示 `Uncaught(in promise) Error` 的话，调用以下函数
      event.preventDefault();
    });
  }

  /**
   * 数据采集存储, 包含数据格式化
   * options，当前采集的对象
   * */
  _setAcData(options, data) {
    let _Ac = {
      uuid: this._uuid,
      t: this._userToken
    };
    switch (options) {
      case this._options.storeInput:
        break;
      case this._options.storePage:
        {
          let { toPath, toParams, fromPath, formParams } = data;
          let pageInTime = this._pageInTime;
          let nowTime = ac_util_getTime().timeStamp;
          this._pageInTime = nowTime;

          _Ac['acData'] = {
            type: this._options.storePage,
            fromPath: fromPath,
            formParams: formParams,
            toPath: toPath,
            toParams: toParams,
            sTme: pageInTime,
            eTme: nowTime
          };
        }
        break;
      case this._options.storeClick:
        {
          let { eId, className, val, attrs} = data;
          _Ac['acData'] = {
            type: this._options.storeClick,
            path: window.location.href,
            sTme: ac_util_getTime().timeStamp,
            ua: navigator.userAgent,
            eId,
            className,
            val,
            attrs
          };
        }
        break;
      case this._options.storeReqErr:
        break;
      case this._options.storeVueErr:
        {
          let { componentName, fileName, propsData, info, msg, stack } = data;
          _Ac['acData'] = {
            type: this._options.storeVueErr,
            path: window.location.href,
            sTme: ac_util_getTime().timeStamp,
            ua: navigator.userAgent,
            componentName,
            fileName,
            propsData,
            info,
            msg,
            err: stack
          };
        }
        break;
      case this._options.storeCodeErr:
        {
          let { msg, line, col, err } = data;
          _Ac['acData'] = {
            type: this._options.storeCodeErr,
            path: window.location.href,
            sTme: ac_util_getTime().timeStamp,
            ua: navigator.userAgent,
            msg,
            line,
            col,
            err
          };
        }
        break;
      case this._options.storeSourceErr:
        {
          let { tagName, outerHTML, resourceUri, currentSrc } = data;
          _Ac['acData'] = {
            type: this._options.storeSourceErr,
            path: window.location.href,
            sTme: ac_util_getTime().timeStamp,
            ua: navigator.userAgent,
            fileName: currentSrc,
            resourceUri,
            tagName,
            outerHTML,
          };
        }
        break;
      case this._options.storePrmseErr:
        {
          let { reason } = data;
          _Ac['acData'] = {
            type: this._options.storePrmseErr,
            path: window.location.href,
            sTme: ac_util_getTime().timeStamp,
            ua: navigator.userAgent,
            reason: reason
          };
        }
        break;
      case this._options.storeCustom:
        {
          let { cusKey, cusVal } = data;
          _Ac['acData'] = {
            type: this._options.storeCustom,
            path: window.location.href,
            sTme: ac_util_getTime().timeStamp,
            ua: navigator.userAgent,
            cusKey,
            cusVal
          };
        }
        break;
      case this._options.storeTiming:
        break;
      default:
        ac_util_warn(`--------系统错误：0x00000001------`);
    }
    this._acData.push(_Ac);
    if(this._options.openReducer){
      if(!this._options.manualReport && this._options.sizeLimit && this._acData.length >= this._options.sizeLimit){
        if(this._vue_ && this._vue_.$nextTick){
          this._vue_.$nextTick(() => {
            this.postAcData();
          });
        }else {
          this.postAcData();
        }
      }
    }else {
      if(this._vue_ && this._vue_.$nextTick){
        this._vue_.$nextTick(() => {
          this.postAcData();
        });
      }else {
        this.postAcData();
      }
    }
  }

  /**
   * 自定义数据上报
   * */
  setCustomAc(data){
    let { cusKey = 'custom', cusVal = ''} = data;
    this._setAcData(this._options.storeCustom, {
      cusKey,
      cusVal
    });
  }

  /**
   *  数据上报, 可以根据实际场景进行上报优化：
   *  默认当事件触发就会自动上报，频率为一个事件1次上报
   *  如果频率过大，可以使用 openReducer， sizeLimit，lifeReport, manualReport进行节流
   * */
  postAcData(){
    if(ac_util_isNullOrEmpty(this._acData) || this._acData.length === 0){
      return;
    }

    let reqData = JSON.stringify(this._acData);

    if(this._options.useImgSend){
      //图片上报
      new Image().src = `${this._options.imageUrl}?acError=${reqData}`;
    }else {
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
  }
  /**
   * 关联后台session
   * */
  setUserToken(value){
    this._userToken = value;
  }
}

VueDataAc.install = (Vue, options) => install(Vue, options, VueDataAc);
VueDataAc.version = '2.0.1';

export default VueDataAc;
