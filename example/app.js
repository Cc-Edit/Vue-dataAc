
/**
 * VueDataAc 配置
 * */
var OPTIONS = {
  useImgSend: false,
  selector: 'input,textArea',
}
Vue.use(VueDataAc, OPTIONS)

/**
 * 文档目录
 * */
var menuData = window.__menuData__ || [];
var subMenu = menuData.splice(0,1)[0];
subMenu.child = window.__docData__
/**
 * 默认实例
 * */
var app = new Vue({
  el: '#app',
  data: {
    menuData: menuData,
    subMenu: subMenu,
    columns: [
      {title: '公众号', key: 'a'},
      {title: '打赏', key: 'b'}
    ],
    data: [],
    columns1:[
      {title: '配置项', key: 'a'},
      {title: '类型', key: 'b'},
      {title: '默认值', key: 'c'},
      {title: '是否可配置', key: 'd'},
      {title: '说明', key: 'e'},
      {title: '生效版本', key: 'f'}
    ],
    data1:[
      {
        a: 'storeInput',
        b: 'String',
        c: '\'ACINPUT\'',
        d: '不建议',
        e: '输入框行为采集标识',
        f: '1.0.0'
      },
      {
        a: 'storePage',
        b: 'String',
        c: '\'ACPAGE\'',
        d: '不建议',
        e: '页面访问信息采集标识',
        f: '1.0.0'
      },
      {
        a: 'storeClick',
        b: 'String',
        c: '\'ACCLIK\'',
        d: '不建议',
        e: '点击事件采集标识',
        f: '1.0.0'
      },
      {
        a: 'storeReqErr',
        b: 'String',
        c: '\'ACRERR\'',
        d: '不建议',
        e: '请求异常采集标识',
        f: '1.0.0'
      },
      {
        a: 'storeTiming',
        b: 'String',
        c: '\'ACTIME\'',
        d: '不建议',
        e: '页面性能采集标识',
        f: '1.0.0'
      },
      {
        a: 'storeCodeErr',
        b: 'String',
        c: '\'ACCERR\'',
        d: '不建议',
        e: '代码异常采集标识',
        f: '1.0.0'
      },
      {
        a: 'storeCustom',
        b: 'String',
        c: '\'ACCUSTOM\'',
        d: '不建议',
        e: '自定义事件采集标识',
        f: '2.0.0'
      },
      {
        a: 'storeSourceErr',
        b: 'String',
        c: '\'ACSCERR\'',
        d: '不建议',
        e: '资源加载异常采集标识',
        f: '2.0.0'
      },
      {
        a: 'storePrmseErr',
        b: 'String',
        c: '\'ACPRERR\'',
        d: '不建议',
        e: 'promise抛出异常标识',
        f: '2.0.0'
      },
      {
        a: 'storeCompErr',
        b: 'String',
        c: '\'ACCOMP\'',
        d: '不建议',
        e: 'Vue组件性能监控标识',
        f: '2.0.0'
      },
      {
        a: 'storeVueErr',
        b: 'String',
        c: '\'ACVUERR\'',
        d: '不建议',
        e: 'Vue异常监控标识',
        f: '2.0.0'
      }
    ],
    columns2:[
      {title: '配置项', key: 'a'},
      {title: '类型', key: 'b'},
      {title: '默认值', key: 'c'},
      {title: '是否可配置', key: 'd'},
      {title: '说明', key: 'e'},
      {title: '生效版本', key: 'f'}
    ],
    data2:[
      {
        a: 'userSha',
        b: 'String',
        c: '\'vue_ac_userSha\'',
        d: '可以',
        e: '用户标识存储在Storage中的key，有冲突可修改',
        f: '1.0.0'
      },
      {
        a: 'useImgSend',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否使用图片上报数据, 设置为 false 为 xhr 接口请求上报',
        f: '2.0.0'
      },
      {
        a: 'useStorage',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否使用storage作为存储载体, 设置为 false 时使用cookie',
        f: '2.0.0'
      },
      {
        a: 'maxDays',
        b: 'Number',
        c: '365',
        d: '可以',
        e: '如果使用cookie作为存储载体，此项生效，配置cookie存储时间，默认一年',
        f: '2.0.0'
      },
      {
        a: 'openInput',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否开启输入数据采集',
        f: '1.0.0'
      },
      {
        a: 'openCodeErr',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否开启代码异常采集',
        f: '1.0.0'
      },
      {
        a: 'openClick',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否开启点击数据采集',
        f: '1.0.0'
      },
      {
        a: 'openXhrQuery',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '采集接口异常时是否采集请求参数params',
        f: '2.0.0'
      },
      {
        a: 'openXhrHock',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否开启xhr异常采集',
        f: '1.0.0'
      },
      {
        a: 'openPerformance',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否开启页面性能采集',
        f: '1.0.0'
      },
      {
        a: 'openPage',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否开启页面访问信息采集(PV/UV) ',
        f: '2.0.0'
      },
      {
        a: 'openVueErr',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否开启Vue异常监控',
        f: '2.0.0'
      },
      {
        a: 'openSourceErr',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否开启资源加载异常采集',
        f: '2.0.0'
      },
      {
        a: 'openPromiseErr',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否开启promise异常采集',
        f: '2.0.0'
      },
      {
        a: 'openComponent',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否开启组件性能采集',
        f: '2.0.0'
      },
      {
        a: 'maxComponentLoadTime',
        b: 'Number',
        c: '1000',
        d: '不建议改小',
        e: '组件渲染超时阈值，太小会导致信息过多，出发点是找出渲染异常的组件',
        f: '2.0.0'
      },
      {
        a: 'openXhrTimeOut',
        b: 'Boolean',
        c: 'true',
        d: '可以',
        e: '是否开启请求超时上报',
        f: '2.0.0'
      },
      {
        a: 'maxRequestTime',
        b: 'Number',
        c: '10000',
        d: '可以',
        e: '请求时间阈值，请求到响应大于此时间，会上报异常，openXhrTimeOut 为 false 时不生效',
        f: '2.0.0'
      },
      {
        a: 'customXhrErrCode',
        b: 'String',
        c: '\'\'',
        d: '可以',
        e: '支持自定义响应code，当接口响应中的code为指定内容时上报异常',
        f: '2.0.0'
      }
    ],
    columns3:[
      {title: '配置项', key: 'a'},
      {title: '类型', key: 'b'},
      {title: '默认值', key: 'c'},
      {title: '采集范围', key: 'g'},
      {title: '是否可配置', key: 'd'},
      {title: '说明', key: 'e'},
      {title: '生效版本', key: 'f'}
    ],
    data3:[
      {
        a: 'selector',
        b: 'String',
        c: '\'input\'',
        g: '所有input输入框（全量采集)',
        d: '可以',
        e: '通过控制选择器来限定监听范围,使用document.querySelectorAll进行选择，值参考：https://www.runoob.com/cssref/css-selectors.html',
        f: '1.0.0'
      },
      {
        a: 'selector',
        b: 'String',
        c: '\'input.isjs-ac\'',
        g: '所有class包含isjs-ac的input输入框（埋点采集）',
        d: '可以',
        e: '同上',
        f: '1.0.0'
      },
      {
        a: 'ignoreInputType',
        b: 'Array',
        c: '[\'password\', \'file\']',
        g: 'type不是password和file的输入框',
        d: '可以',
        e: '---',
        f: '2.0.0'
      },
      {
        a: 'ignoreInputType',
        b: 'Array',
        c: '[ ]',
        g: '所有输入框',
        d: '可以',
        e: '---',
        f: '2.0.0'
      },
      {
        a: 'classTag',
        b: 'String',
        c: '\'\'',
        g: '所有可点击元素（全量采集）',
        d: '可以',
        e: '点击事件埋点标识, 自动埋点时请配置空字符串',
        f: '1.0.0'
      },
      {
        a: 'classTag',
        b: 'String',
        c: '\'isjs-ac\'',
        g: '只会采集 class 包含 isjs-ac 元素的点击（埋点采集）',
        d: '可以',
        e: '点击事件埋点标识, 自动埋点时请配置空字符串',
        f: '1.0.0'
      },
      {
        a: 'maxHelpfulCount',
        b: 'Number',
        c: '5',
        g: '全量采集场景下，为了使上报数据准确，我们会递归父元素，找到一个有class或id的祖先元素，此项配置递归次数',
        d: '不建议',
        e: '页面层次较深情况下，建议保留配置，以减少性能损耗',
        f: '2.0.0'
      }
    ],
    columns4:[
      {title: '配置项', key: 'a'},
      {title: '类型', key: 'b'},
      {title: '默认值', key: 'c'},
      {title: '是否可配置', key: 'd'},
      {title: '说明', key: 'e'},
      {title: '生效版本', key: 'f'}
    ],
    data4:[
      {
        a: 'imageUrl',
        b: 'String',
        c: '\'http://data.isjs.cn/lib/image/ac.png\'',
        d: '可以',
        e: '《建议》 图片上报地址（通过1*1px图片接收上报信息）依赖 useImgSend 配置打开',
        f: '1.0.0'
      },
      {
        a: 'postUrl',
        b: 'String',
        c: '\'http://data.isjs.cn/logStash/push\'',
        d: '可以',
        e: '接口上报地址',
        f: '1.0.0'
      },
      {
        a: 'openReducer',
        b: 'Boolean',
        c: 'false',
        d: '可以',
        e: '是否开启节流,用于限制上报频率，开启后sizeLimit，manualReport生效',
        f: '2.0.0'
      },
      {
        a: 'sizeLimit',
        b: 'Number',
        c: '20',
        d: '可以',
        e: '采集数据超过指定条目时自动上报，依赖 openReducer == true, 优先级：2 ',
        f: '2.0.0'
      },
      {
        a: 'cacheEventStorage',
        b: 'String',
        c: '\'ac_cache_data\'',
        d: '可以',
        e: '开启节流后数据本地存储key',
        f: '2.0.0'
      },
      {
        a: 'manualReport',
        b: 'Boolean',
        c: 'false',
        d: '可以',
        e: '强制手动上报，开启后只能调用postAcData方法上报，依赖 openReducer == true，优先级：1 ',
        f: '2.0.0'
      }
    ]
  },
  computed: {},
  watch: {},
  methods: {},
  components: {},
  created: function(){
  },
  mounted: function(){
    //控制loading层
    document.getElementById('app').style.display = 'block';
    document.getElementById('load').style.display = 'none';
  },
})