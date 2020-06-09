/*!
  * vue-dataAc v2.0.0
  * (c) 2020 adminV
  * @license MIT
  */
'use strict';

// import { ac_util_isNullOrEmpty, isDef } from './util/index'

/**
 * 暴露插件接口
 * */
function install (Vue, options, VueDataAc) {
  if (install.installed) { return }
  install.installed = true;
  Vue.mixin({
    watch:{
      $route: function $route(to, from) {

      }
    },
    /**
     *  在组件初始化同时，进行页面访问的采集
     * */
    beforeCreate: function beforeCreate () {

    },
    /**
     * 在组件移除同时，进行数据上报（可配置）
     * */
    destroyed: function destroyed () {

    },
    /**
     * 在组件渲染完成后，尝试进行事件劫持
     * */
    mounted: function mounted () {

    }
  });

  Vue.prototype.$vueDataAc = new VueDataAc(options);
}

/**
 * 全局配置
 * */
var BASEOPTIONS = {
  storeVer     : '2.0.0',     //Vue 版本dataAc
  /**
   *  标识类作为数据上报的key，在后台数据分析时进行数据区分，不需要动态配置
   * */
  storeInput   : "ACINPUT",   //输入采集标识
  storePage    : "ACPAGE",    //页面采集标识
  storeClick   : "ACCLIK",    //点击事件采集标识
  storeReqErr  : "ACRERR",    //请求异常采集标识
  storeTiming  : "ACTIME",    //页面时间采集标识
  storeCodeErr : "ACCERR",    //代码异常采集标识
  /**
   *  全局开关，用来修改采集内容
   * */
  userSha      : 'vue_ac_userSha',   //用户标识存储key，有冲突可修改
  useImgSend   : true,        //默认使用图片上报数据, false为xhr请求接口上报
  useStorage   : true,        //默认使用storage,
  maxDays      : 365,         //如果使用cookie，此项生效，配置cookie生效时间，默认一年
  openInput    : true,        //是否开启输入数据采集
  openCodeErr  : true,        //是否开启代码异常采集
  openClick    : true,        //是否开启点击数据采集
  openXhrData  : true,        //是否采集接口异常时的参数params
  openXhrHock  : true,        //自动检测是否开启xhr异常采集
  openPerformance : true,     //是否开启页面性能采集
  openPage     : true,        //是否开启页面访问信息采集 (2.0新增）

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
  classTag     : 'isjs-ac',   //主动埋点标识, 自动埋点时请配置空字符串
  acbLength    : 2,           //点击元素采集层数，自动埋点时会向上层查找，该选项可以配置查找层数

  /**
   * 以下内容为可配置信息，影响插件逻辑功能
   * */
  imageUrl     : "http://open.isjs.cn/logStash/push.png",   //《建议》 图片上报地址（通过1*1px图片接收上报信息）
  postUrl      : "",       // 数据上报接口

  /**
   * 对上报频率的限制项 (2.0新增）
   * */
  openReducer: false, //是否开启节流,用于限制上报频率
  sizeLimit: 20,      //操作数据超过指定条目时自动上报
  lazyReport: false  //开启懒惰上报，组件destroy时统一上报
};

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
  for( var key in obj ){
    return false;
  }
  return true;
}
/**
 * 判断是否浏览器
 * */
var ac_util_inBrowser = typeof window !== 'undefined';

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
function ac_util_setStorage (name, value, Day, options) {
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
function ac_util_getStorage (name, options) {
  if (!name){ return null; }
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
 * 生成UUID
 * @param len * UUID长度,默认16
 * @param radix 进制，默认16
 * */
function ac_util_getUuid (len, radix) {
  if ( len === void 0 ) len = 16;
  if ( radix === void 0 ) radix = 16;
//uuid长度以及进制
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [], i;
  for (i = 0; i < len; i++) { uuid[i] = chars[0 | Math.random() * radix]; }
  return uuid.join('');
}

/**
 * 配置项合并
 * */
function ac_util_mergeOption (userOpt, baseOpt){
  var newOpt = {};
  var key;
  var keys  = Object.keys(baseOpt);

  for (var i = 0; i < keys.length; i++) {
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
    ac_util_warn("--------配置项异常：不能为空------");
    return;
  }
  var notEmpty = ['storeInput', 'storePage', 'storeClick', 'storeReqErr', 'storeTiming', 'storeCodeErr',
    'userSha', 'useImgSend', 'useStorage', 'maxDays', 'openInput', 'openCodeErr', 'openClick', 'openXhrData',
    'openXhrHock', 'openPerformance', 'openPage'];
  notEmpty.map(function (key) {
    if(ac_util_isNullOrEmpty(options[key])){
      ac_util_warn(("--------配置项【" + key + "】不能为空------"));
    }
  });

  // 上报方式检查
  if(options['useImgSend']){
    if(ac_util_isNullOrEmpty(options['imageUrl'])){
      ac_util_warn("--------使用图片上报数据，需要配置 【imageUrl】------");
    }
  }else {
    if(ac_util_isNullOrEmpty(options['postUrl'])){
      ac_util_warn("--------使用接口上报数据，需要配置 【postUrl】------");
    }
  }

  //输入框采集配置
  if(options['openInput']){
    if(ac_util_isNullOrEmpty(options['selector'])){
      ac_util_warn("--------请指定输入框选择器：selector------");
    }
    if(ac_util_isNullOrEmpty(options['acRange'])){
      ac_util_warn("--------请指定输入框选择器类型：acRange------");
    }
  }
  //存储配置
  if(options['useStorage']){
    if(typeof window.localStorage == 'undefined'){
      ac_util_warn("--------当前容器不支持Storage存储：useStorage------");
    }
  }
}
/**
 *  警告
 * */
function ac_util_warn (message) {
  if (process.env.NODE_ENV !== 'production') {
    typeof console !== 'undefined' && console.warn(("[vue-dataAc] " + message));
  }
}

/**
 *  内嵌AJAX
 * */
function ac_util_ajax (options ) {
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

var VueDataAc = function VueDataAc (options) {
  if ( options === void 0 ) options = {};

  var newOptions = ac_util_mergeOption(options, BASEOPTIONS);
  ac_util_checkOptions(newOptions);
  this._options = newOptions;

  this._uuid = ac_util_getStorage(this._options.userSha, this._options);
  if(ac_util_isNullOrEmpty(this._uuid)){
    this._uuid = ac_util_getUuid();
    ac_util_setStorage(this._options.userSha, this._uuid, this._options);
  }

  this._acData = [];
  this._init();
};
/**
 * 页面初始化
 * */
VueDataAc.prototype._init = function _init (){
  if(this._options.openXhrData){
    this._initXhrErrAc();
  }

  if(this._options.openPerformance){
    this._initPerformance();
  }

  if(this._options.openCodeErr){
    this._initCodeErrAc();
  }

  if(this._options.openInput){
    this._initInputAc();
  }

  if(this._options.openClick){
    this._initClickAc();
  }

  if(this._options.openPage){
    this._initPageAc();
  }
};
  
/**
 *初始化页面访问监听
 * */
VueDataAc.prototype._initPageAc = function _initPageAc (){};

/**
 *初始化请求劫持
 * */
VueDataAc.prototype._initXhrErrAc = function _initXhrErrAc (){};

/**
 *初始化页面性能
 * */
VueDataAc.prototype._initPerformance = function _initPerformance (){};

/**
 *初始化代码异常监控
 * */
VueDataAc.prototype._initCodeErrAc = function _initCodeErrAc (){};

/**
 *初始化输入事件监听
 * */
VueDataAc.prototype._initInputAc = function _initInputAc (){};

/**
 *初始化点击事件监听
 * */
VueDataAc.prototype._initClickAc = function _initClickAc (){};

/**
 *数据上报, 可以根据实际场景进行上报优化：
 *默认当事件触发就会自动上报，频率为一个事件1次上报
 *如果频率过大，可以使用 openReducer， sizeLimit，lazyReport进行节流
 * */
VueDataAc.prototype.postAcData = function postAcData (){
  if(ac_util_isNullOrEmpty(this._acData) || this._acData.length === 0){
    return;
  }

  var reqData = JSON.stringify({uuid: this._uuid, acData: this._acData});

  if(this._options.useImgSend){
    //图片上报
    new Image().src = (this._options.imageUrl) + "?acError=" + reqData;
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
};
/**
 *混入vue生命周期 BeforeCreate
 * */
VueDataAc.prototype._mixinBeforeCreate = function _mixinBeforeCreate (){

};
/**
 *混入vue生命周期 Mounted
 * */
VueDataAc.prototype._mixinMounted = function _mixinMounted (){};
/**
 *混入vue生命周期 Destroyed
 * */
VueDataAc.prototype._mixinDestroyed = function _mixinDestroyed (){};
/**
 *混入vue watch 用来监控路由变化
 * */
VueDataAc.prototype._mixinRouterWatch = function _mixinRouterWatch (){

};

VueDataAc.install = function (Vue, options) { return install(Vue, options, VueDataAc); };
VueDataAc.version = '2.0.0';

/**
 *  自动挂载
 * */
if (ac_util_inBrowser && window.Vue) {
  window.Vue.use(VueDataAc);
}

module.exports = VueDataAc;
