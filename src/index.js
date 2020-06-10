import { install } from './install'
import { BASEOPTIONS } from './config/config'
import {
  ac_util_isNullOrEmpty,
  ac_util_isEmptyObject,
  ac_util_mergeOption,
  ac_util_checkOptions,
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
    this._lastRouterStr = ''; //防止路由重复采集
    this._pageInTime = 0; //防止路由重复采集
    this._init();
  }
  /**
   * 页面初始化
   * */
  _init(){
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
  }
  
  /**
   *  初始化页面访问监听
   * */
  _initPageAc(){}

  /**
   *  初始化请求劫持
   * */
  _initXhrErrAc(){}

  /**
   *  初始化页面性能
   * */
  _initPerformance(){}

  /**
   *  初始化代码异常监控
   * */
  _initCodeErrAc(){}

  /**
   *  初始化输入事件监听
   * */
  _initInputAc(){}

  /**
   *  初始化点击事件监听
   * */
  _initClickAc(){}

  /**
   *  数据上报, 可以根据实际场景进行上报优化：
   *  默认当事件触发就会自动上报，频率为一个事件1次上报
   *  如果频率过大，可以使用 openReducer， sizeLimit，lazyReport进行节流
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
   *  混入vue生命周期 BeforeCreate
   * */
  _mixinBeforeCreate(){

  }
  /**
   *  混入vue生命周期 Mounted
   * */
  _mixinMounted(){}
  /**
   *  混入vue生命周期 Destroyed
   * */
  _mixinDestroyed(){}
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
   *  上报
   * */
  _report(acData){

  }
  /**
   * 数据采集存储, 包含数据格式化
   * options，当前采集的对象
   * */
  _setAcData(options, data) {
    let _Ac = {
      uuid: this._uuid
    }
    switch (options) {
      case this._options.storeInput:
        break;

      case this._options.storePage:
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
        break;
      case this._options.storeClick:
        break;
      case this._options.storeReqErr:
        break;
      case this._options.storeCodeErr:
        break;
      case this._options.storeCustom:
        break;
      case this._options.storeTiming:
        break;
      default:
        ac_util_warn(`--------系统错误：0x00000001------`)
    }
    this._acData.push(_Ac);
    if(this._options.openReducer){
      if(this._options.sizeLimit && this._acData.length >= this._options.sizeLimit){
        this.postAcData();
      }
    }else{
      this.postAcData();
    }
  }
}

VueDataAc.install = (Vue, options) => install(Vue, options, VueDataAc);
VueDataAc.version = '__VERSION__';