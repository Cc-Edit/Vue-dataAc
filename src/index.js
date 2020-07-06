import {install} from './install'
import {BASEOPTIONS} from './config/config'
import {
  ac_util_formatVueErrStack,
  ac_util_getHelpfulElement,
  ac_util_isNullOrEmpty,
  ac_util_isEmptyObject,
  ac_util_mergeOption,
  ac_util_checkOptions,
  ac_util_getAllAttr,
  ac_util_getStorage,
  ac_util_delStorage,
  ac_util_setStorage,
  ac_util_getUuid,
  ac_util_getTime,
  ac_util_ajax,
  ac_util_warn
} from './util/util'

/**
 * 原生事件涉及到移除与绑定，所以缓存VueDataAc
 * */
let _VueDataAc;

export default class VueDataAc {
  /**
   * @param options 配置项
   * @param Vue 当前Vue实例， 主要目的是使用nextTick, 保证数据上报不影响页面展示效率
   * */
  constructor(options = {}, Vue = {}) {
    const newOptions = ac_util_mergeOption(options, BASEOPTIONS);
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

    const cacheEventData = ac_util_getStorage(this._options, this._options.cacheEventStorage);
    this._acData = ac_util_isNullOrEmpty(cacheEventData) ? [] : JSON.parse(cacheEventData);
    this._proxyXhrObj = {};     //代理xhr
    this._inputCacheData = {};  //缓存输入框输入信息
    this._componentsTime = {};  //缓存组件加载时间
    this._lastRouterStr = '';   //防止路由重复采集
    this._userToken = '';       //关联后台token
    this._pageInTime = 0;       //防止路由重复采集
    this._componentLoadCount = 0;   //保证所有组件渲染完成
    this._componentTimeCount = 0;   //保证所有组件渲染完成
    this._init();
  }

  /**
   * 页面初始化
   * */
  _init() {
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
  }

  /**
   *  混入vue生命周期 Mounted
   *  用来绑定全局代理事件，当根元素渲染完成后绑定
   *  @param VueRoot 根元素
   * */
  _mixinInputEvent(VueRoot) {
    const {ignoreInputType, selector} = this._options;
    const _ACIDoms = document.querySelectorAll(selector);
    for (let i = 0, len = _ACIDoms.length; i < len; i++) {
      const selector = _ACIDoms[i];
      if (selector.type && ignoreInputType.indexOf(selector.type.toLowerCase()) < 0) {
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
   *  混入vue生命周期 beforeCreate
   *  用来监控组件渲染性能
   *  @param Component 组件
   * */
  _mixinComponentsPerformanceStart(Component){
    const {$vnode = {}} = Component;
    const tag = $vnode.tag;
    //没有tag的组件不做采集，找不到唯一标识
    if(ac_util_isNullOrEmpty(tag)){
      return;
    }

    Component.$_vueAc_bc_time = ac_util_getTime().timeStamp;
    Component.$vueDataAc._componentTimeCount++;
  }

  /**
   *  混入vue生命周期 Mounted
   *  用来监控组件渲染性能
   *  @param Component 组件
   * */
  _mixinComponentsPerformanceEnd(Component){
    const createdTime = Component.$_vueAc_bc_time;
    const {$vnode = {}} = Component;
    const tag = $vnode.tag;

    //没有tag的组件不做采集，找不到唯一标识
    if(ac_util_isNullOrEmpty(createdTime) || ac_util_isNullOrEmpty(tag)){
      return;
    }

    const nowTime = ac_util_getTime().timeStamp;
    const loadTime = parseInt(nowTime - createdTime);

    if(loadTime >= Component.$vueDataAc._options.maxComponentLoadTime){
      if(ac_util_isNullOrEmpty(Component.$vueDataAc._componentsTime[tag])){
        Component.$vueDataAc._componentsTime[tag] = [];
      }
      Component.$vueDataAc._componentsTime[tag].push(loadTime);
    }

    const isLoaded = (--Component.$vueDataAc._componentTimeCount === 0);

    if(isLoaded && !ac_util_isEmptyObject(Component.$vueDataAc._componentsTime)){
      this._setAcData(Component.$vueDataAc._options.storeCompErr, {
        componentsTimes: Component.$vueDataAc._componentsTime
      })
      Component.$vueDataAc._componentsTime = {};
    }
  }

  /**
   * 输入事件
   * */
  _formatInputEvent(e) {
    const event = window.event || e;
    const target = event.srcElement ? event.srcElement : event.target;
    const {id, className, value, innerText} = target;
    const attrs = ac_util_getAllAttr(target);
    const _value = value || innerText;
    const _now = ac_util_getTime().timeStamp;
    let inputKey = '';
    /**
     * 尝试用所有属性做key，异常情况下拼接id+class
     * */
    try {
      inputKey = JSON.stringify(attrs)
    } catch (e) {
      inputKey = `${id}-${className}`;
    }

    let cacheData = _VueDataAc._inputCacheData[inputKey];
    if (ac_util_isNullOrEmpty(cacheData) || ac_util_isEmptyObject(cacheData)) {
      cacheData = {
        value: `0:${_value}`,
        timeStamp: _now
      };
    } else {
      cacheData = {
        value: `${cacheData.value},${parseInt(_now - cacheData.timeStamp)}:${_value}`,
        timeStamp: _now
      };
    }
    _VueDataAc._inputCacheData[inputKey] = cacheData;
  }

  /**
   * 失焦事件
   * */
  _formatBlurEvent(e) {
    const event = window.event || e;
    const target = event.srcElement ? event.srcElement : event.target;
    const {id, className} = target;
    const attrs = ac_util_getAllAttr(target);
    let inputKey = '';
    /**
     * 尝试用所有属性做key，异常情况下拼接id+class
     * */
    try {
      inputKey = JSON.stringify(attrs)
    } catch (e) {
      inputKey = `${id}-${className}`;
    }

    const cacheData = _VueDataAc._inputCacheData[inputKey];
    if (ac_util_isNullOrEmpty(cacheData)) return;

    _VueDataAc._inputCacheData[inputKey] = null;
    _VueDataAc._setAcData(_VueDataAc._options.storeInput, {
      eId: id,
      className: className,
      val: cacheData.value,
      attrs
    })
  }

  /**
   *  混入vue watch 用来监控路由变化
   * */
  _mixinRouterWatch(to = {}, from = {}, isVueRouter) {
    let toPath = '';
    let toParams = {};
    let fromPath = '';
    let formParams = {};
    let _lastRouterStr = '';

    if(isVueRouter){
      toPath = to.fullPath || to.path || to.name;
      toParams = ac_util_isEmptyObject(to.params) ? to.query : to.params;
      fromPath = from.fullPath || from.path || from.name;
      formParams = ac_util_isEmptyObject(from.params) ? from.query : from.params;
      _lastRouterStr = this._lastRouterStr;
      if (_lastRouterStr === `${toPath}-${JSON.stringify(toParams)}`) {
        return
      }
    }else{
      _lastRouterStr = ac_util_getStorage(this._options, `_vueac_${this._options.storePage}`) || ''
      toPath = window.location.href;
      toParams = { search: window.location.search }
      fromPath = _lastRouterStr;
      formParams = {}
    }

    //该情况认为是根页面渲染，留给页面级信息上报
    if (isVueRouter && (ac_util_isNullOrEmpty(toPath) || ac_util_isNullOrEmpty(fromPath))) {
      return;
    }

    this._lastRouterStr = `${toPath}-${JSON.stringify(toParams)}`;
    ac_util_setStorage(this._options,`_vueac_${this._options.storePage}`, `${toPath}-${JSON.stringify(toParams)}`)

    this._setAcData(this._options.storePage, {
      toPath,
      toParams,
      fromPath,
      formParams
    })

    if(this._options.openReducer && !this._options.manualReport){
      this.postAcData && this.postAcData();
    }
  }

  /**
   *  初始化点击事件
   * */
  _initClickAc() {
    document.addEventListener("click", (e) => {
      const event = window.event || e;
      const target = event.srcElement ? event.srcElement : event.target;
      const helpfulElement = ac_util_getHelpfulElement(target, this._options)

      if(!ac_util_isNullOrEmpty(helpfulElement)){
        const {className, id, value, innerText} = helpfulElement;
        const attrs = ac_util_getAllAttr(helpfulElement);
        this._setAcData(this._options.storeClick, {
          eId: id,
          className: className,
          val: (value || innerText).substr(0, 20),
          attrs
        })
      }
    });
  }

  /**
   *  初始化请求劫持
   * */
  _initXhrErrAc() {
    const _nativeAjaxOpen = XMLHttpRequest.prototype.open;
    const _nativeAjaxSend = XMLHttpRequest.prototype.send;
    const _nativeAjaxonReady = XMLHttpRequest.onreadystatechange;
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
  }

  _formatXhrErrorData(xhr) {
    const _ajax = xhr;
    const {method, send_time = 0, post_data = {}, readyState} = _ajax;

    if (readyState === 4) {
      const {status, statusText, response, responseURL} = _ajax;
      const ready_time = ac_util_getTime().timeStamp
      const requestTime = ready_time - (send_time || ready_time);
      const {openXhrTimeOut, storeReqErr, customXhrErrCode, openXhrQuery} = _VueDataAc._options;

      const isTimeOut = requestTime > _VueDataAc._options.maxRequestTime;
      const isHttpErr = (!(status >= 200 && status < 208) && (status !== 0 && status !== 302));
      const isCustomErr = (!ac_util_isNullOrEmpty(customXhrErrCode) && (`${response && response.code}` === customXhrErrCode));
      const isReportErr = (!ac_util_isNullOrEmpty(responseURL) && responseURL === _VueDataAc._options.postUrl); //避免上报接口异常导致死循环

      if (((openXhrTimeOut && isTimeOut) || isHttpErr || isCustomErr) && !isReportErr) {
        _VueDataAc._setAcData(storeReqErr, {
          responseURL,
          method,
          isHttpErr,
          isCustomErr,
          readyState,
          status,
          statusText,
          requestTime,
          response: ('' + response).substr(0, 100),
          query: openXhrQuery ? post_data : ''
        })
      }
    }
  }

  /**
   *  初始化页面性能
   * */
  _initPerformance() {
    if (window.performance) {
      const performance = window.performance || {};
      const _timing = performance.timing;

      if (!ac_util_isNullOrEmpty(_timing)) {
        var loadAcData = {
          WT: _timing.responseStart - _timing.navigationStart, //白屏时间
          TCP: _timing.connectEnd - _timing.connectStart, //TCP连接耗时
          ONL: _timing.loadEventEnd - _timing.loadEventStart, //执行onload事件耗时
          ALLRT: _timing.responseEnd - _timing.requestStart, //所有请求耗时
          TTFB: _timing.responseStart - _timing.navigationStart, //TTFB 即 Time To First Byte,读取页面第一个字节的时间
          DNS: _timing.domainLookupEnd - _timing.domainLookupStart //DNS查询时间
        };
        this._setAcData(this._options.storeTiming, loadAcData)
      }
    }
  }

  /**
   *  初始化Vue异常监控
   * */
  _initVueErrAc() {
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
        stack: ac_util_formatVueErrStack(error)
      })
    });
  }

  /**
   *  初始化代码异常监控
   * */
  _initCodeErrAc() {
    /**
     * 全局异常
     * */
    window.onerror = (msg, url, line, col, err) => {
      //屏蔽跨域脚本异常， 建议跨域脚本增加 crossorigin
      if (ac_util_isNullOrEmpty(url) && msg === "Script error.") {
        return false;
      }

      const codeErrData = {
        msg: msg,
        line: line,
        col: col
      };
      codeErrData.col = col || (window.event && window.event.errorCharacter) || 0;

      //屏蔽关闭网页时的Network Error
      setTimeout(() => {
        if (err && err.stack) {
          //可以直接使用堆栈信息
          codeErrData.err = err.stack.toString();
        } else if (arguments.callee) {
          //尝试通过callee获取异常堆栈
          let errmsg = [];
          let f = arguments.callee.caller;
          let c = 3;//防止堆栈信息过大
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
        this._setAcData(this._options.storeCodeErr, codeErrData)
      }, 0)
    }
  }

  /**
   *  初始化资源加载异常监听
   * */
  _initSourceErrAc() {
    window.addEventListener('error', (event) => {
      const eventType = [].toString.call(event, event);
      if (eventType === "[object Event]") {
        const theTag = event.target || event.srcElement || event.originalTarget || {};
        const { href, src, currentSrc, localName} = theTag;
        const tagName = theTag.tagName || localName;
        let outerHTML = theTag.outerHTML;

        const resourceUri = href || src;

        if (tagName === "IMG" && !ac_util_isNullOrEmpty(theTag.onerror)) {
          //存在行内的 error事件  终止执行
          return false;
        }

        //优化请求内容，对大标签内容进行截取
        if (outerHTML && outerHTML.length > 200) {
          outerHTML = outerHTML.slice(0, 200)
        }

        this._setAcData(this._options.storeSourceErr, {
          tagName,
          outerHTML,
          resourceUri,
          currentSrc
        })
      }
    });
  }

  /**
   *  初始化 Promise 异常监听
   *  在使用Promise的时候，如果没有声明catch代码块
   *  Promise的异常会被抛出
   * */
  _initPromiseErrAc() {
    window.addEventListener('unhandledrejection', (event) => {
      this._setAcData(this._options.storePrmseErr, {
        reason: event.reason || "unknown"
      })
      // 如果想要阻止继续抛出，即会在控制台显示 `Uncaught(in promise) Error` 的话，调用以下函数
      event.preventDefault();
    });
  }

  /**
   * 数据采集存储, 包含数据格式化
   * options，当前采集的对象
   * */
  _setAcData(options, data) {
    const _Ac = {
      uuid: this._uuid,
      t: this._userToken
    }
    switch (options) {
      case this._options.storePage: {
        const {toPath, toParams, fromPath, formParams} = data;
        const pageInTime = this._pageInTime;
        const nowTime = ac_util_getTime().timeStamp;
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
        const {eId, className, val, attrs} = data;
        _Ac['acData'] = {
          type: this._options.storeInput,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          eId,
          className,
          val,
          attrs
        };
      }
        break;
      case this._options.storeClick: {
        const {eId, className, val, attrs} = data;
        _Ac['acData'] = {
          type: this._options.storeClick,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          eId,
          className,
          val,
          attrs
        };
      }
        break;
      case this._options.storeReqErr: {
        const {
          responseURL, method,
          isHttpErr, isCustomErr,
          readyState, status, statusText,
          requestTime, response, query
        } = data;
        _Ac['acData'] = {
          type: this._options.storeReqErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          errSubType: isHttpErr ? 'http' : (isCustomErr ? 'custom' : 'time'),
          responseURL,
          method,
          readyState,
          status,
          statusText,
          requestTime,
          response,
          query
        };
      }
        break;
      case this._options.storeVueErr: {
        const {componentName, fileName, propsData, info, msg, stack} = data;
        _Ac['acData'] = {
          type: this._options.storeVueErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          componentName,
          fileName,
          propsData,
          info,
          msg,
          err: stack
        };
      }
        break;
      case this._options.storeCodeErr: {
        const {msg, line, col, err} = data;
        _Ac['acData'] = {
          type: this._options.storeCodeErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          msg,
          line,
          col,
          err
        };
      }
        break;
      case this._options.storeSourceErr: {
        const {tagName, outerHTML, resourceUri, currentSrc} = data;
        _Ac['acData'] = {
          type: this._options.storeSourceErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          fileName: currentSrc,
          resourceUri,
          tagName,
          outerHTML
        };
      }
        break;
      case this._options.storePrmseErr: {
        const {reason} = data;
        _Ac['acData'] = {
          type: this._options.storePrmseErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          reason: reason
        };
      }
        break;
      case this._options.storeCustom: {
        const {cusKey, cusVal} = data;
        _Ac['acData'] = {
          type: this._options.storeCustom,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          cusKey,
          cusVal
        };
      }
        break;
      case this._options.storeTiming: {
        const {WT, TCP, ONL, ALLRT, TTFB, DNS} = data;
        _Ac['acData'] = {
          type: this._options.storeTiming,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          WT,
          TCP,
          ONL,
          ALLRT,
          TTFB,
          DNS
        };
      }
        break;
      case this._options.storeCompErr:{
        const {componentsTimes} = data;
        _Ac['acData'] = {
          type: this._options.storeCompErr,
          path: window.location.href,
          sTme: ac_util_getTime().timeStamp,
          componentsTimes
        };
      }
        break;
      default:
        ac_util_warn(`--------系统错误：0x00000001------`)
    }
    this._acData.push(_Ac);
    if (this._options.openReducer) {
      ac_util_setStorage(this._options, this._options.cacheEventStorage, JSON.stringify(this._acData))
      if (!this._options.manualReport && this._options.sizeLimit && this._acData.length >= this._options.sizeLimit) {
        if (this._vue_ && this._vue_.$nextTick) {
          this._vue_.$nextTick(() => {
            this.postAcData();
          })
        } else {
          this.postAcData();
        }
      }
    } else {
      if (this._vue_ && this._vue_.$nextTick) {
        this._vue_.$nextTick(() => {
          this.postAcData();
        })
      } else {
        this.postAcData();
      }
    }
  }

  /**
   * 自定义数据上报
   * */
  setCustomAc(data) {
    const {cusKey = 'custom', cusVal = ''} = data;
    this._setAcData(this._options.storeCustom, {
      cusKey,
      cusVal
    })
  }

  /**
   *  数据上报, 可以根据实际场景进行上报优化：
   *  默认当事件触发就会自动上报，频率为一个事件1次上报
   *  如果频率过大，可以使用 openReducer， sizeLimit，manualReport进行节流
   * */
  postAcData() {
    if (ac_util_isNullOrEmpty(this._acData) || this._acData.length === 0) {
      return;
    }

    const reqData = JSON.stringify(this._acData);

    if (this._options.useImgSend) {
      //图片上报
      new Image().src = `${this._options.imageUrl}?acError=${reqData}`;
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
    ac_util_delStorage(this._options, this._options.cacheEventStorage)
  }

  /**
   * 关联后台session
   * */
  setUserToken(value) {
    this._userToken = value;
  }
}

VueDataAc.install = (Vue, options) => install(Vue, options, VueDataAc);
VueDataAc.version = '__VERSION__';