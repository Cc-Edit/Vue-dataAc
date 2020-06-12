/**
 * 全局配置
 * */
export const BASEOPTIONS = {
  storeVer     : '__VERSION__',  //Vue 版本dataAc
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
  imageUrl     : "http://open.isjs.cn/admin/ac.png",   //《建议》 图片上报地址（通过1*1px图片接收上报信息）
  postUrl      : "http://open.isjs.cn/logStash/push",       // 数据上报接口

  /**
   * 对上报频率的限制项 (2.0新增）
   * */
  openReducer: false,   //是否开启节流,用于限制上报频率
  sizeLimit: 20,        //操作数据超过指定条目时自动上报
  lifeReport: false,    //开启懒惰上报，路由变化时统一上报
  manualReport: false   //手动上报，需要手动执行postAcData(),开启后 lifeReport，sizeLimit配置失效
}
