import { install } from './install'
import { BASEOPTIONS } from './config/config'
import {
  ac_util_formatVueErrStack,
  ac_util_isNullOrEmpty,
  ac_util_isEmptyObject,
  ac_util_mergeOption,
  ac_util_checkOptions,
  ac_util_getAllAttr,
  ac_util_getStorage,
  ac_util_setStorage,
  ac_util_getUuid,
  ac_util_getTime,
  ac_util_ajax,
  ac_util_warn
} from './util/index'

export default class VueDataAc {

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
    const _ACIDoms = document.querySelector(selector);
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
    console.log(e)
  }
  /**
   * 失焦事件
   * */
  _formatBlurEvent(e){
    console.log(e)
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
      })
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
      })
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
      })
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
        this._setAcData(this._options.storeCodeErr, codeErrData)
      }, 0)
    }

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
  _initPromiseErrAc(){
    window.addEventListener('unhandledrejection', (event) => {
      this._setAcData(this._options.storePrmseErr, {
        reason: event.reason || "unknown",
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
    let _Ac = {
      uuid: this._uuid,
      t: this._userToken
    }
    switch (options) {
      case this._options.storeInput:
        {

        }
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
            type: this._options.storeVueErr,
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
        {}
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
        {

        }
        break;
      default:
        ac_util_warn(`--------系统错误：0x00000001------`)
    }
    this._acData.push(_Ac);
    if(this._options.openReducer){
      if(!this._options.manualReport && this._options.sizeLimit && this._acData.length >= this._options.sizeLimit){
        if(this._vue_ && this._vue_.$nextTick){
          this._vue_.$nextTick(() => {
            this.postAcData();
          })
        }else{
          this.postAcData();
        }
      }
    }else{
      if(this._vue_ && this._vue_.$nextTick){
        this._vue_.$nextTick(() => {
          this.postAcData();
        })
      }else{
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
    })
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
    }else{
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
VueDataAc.version = '__VERSION__';