import { install } from './install'
import { BASEOPTIONS } from './config/config'
import {
  ac_util_inBrowser,
  ac_util_isNullOrEmpty,
  ac_util_mergeOption,
  ac_util_checkOptions,
  ac_util_getStorage,
  ac_util_setStorage,
  ac_util_getUuid,
  ac_util_ajax
} from './util/index'

export default class VueDataAc {

  constructor (options = {}) {
    let newOptions = ac_util_mergeOption(options, BASEOPTIONS);
    ac_util_checkOptions(newOptions);
    this._options = newOptions;

    this._uuid = ac_util_getStorage(this._options, this._options.userSha, this._options);
    if(ac_util_isNullOrEmpty(this._uuid)){
      this._uuid = ac_util_getUuid();
      ac_util_setStorage(this._options, this._options.userSha, this._uuid);
    }

    this._acData = [];
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

    let reqData = JSON.stringify({uuid: this._uuid, acData: this._acData});

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
  _mixinRouterWatch(){

  }
}

VueDataAc.install = (Vue, options) => install(Vue, options, VueDataAc);
VueDataAc.version = '__VERSION__'

/**
 *  自动挂载
 * */
if (ac_util_inBrowser && window.Vue) {
  window.Vue.use(VueDataAc)
}