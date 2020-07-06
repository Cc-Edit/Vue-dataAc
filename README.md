# Vue-dataAc - Vue 数据采集上报插件（求小星星，求star）
   
    
## 写在前面
此插件基于 [dataAcquisition](https://github.com/adminV/dataAcquisition) 进行重构    
基于Vue进行插件开发，新增了很多配置，也对整体的采集监控做了优化，让这一切更优雅更灵活更简单。    
项目初期，难免有一些不同场景下的问题，大家在使用过程中遇到任何问题，或者有不满意的点都可以提交issue上来。    
另外： http://data.isjs.cn/logStash/push 作为测试接口使用，会不定期清空数据，请不要上报真实数据    

| 公众号: **js前端架构** | 打赏 :confetti_ball: | 
| :------------: |:---------------:| 
|![js前端架构](http://www.isjs.cn/wp-content/uploads/2013/06/2018_07_25_1136562613-1.png "关注我哟")|![打赏](http://www.isjs.cn/wp-content/uploads/2020/06/Wechat-z.png "感谢")|


## 快速开始

**安装**
```
    npm install vue-dataac --save
```

**Vue Cli**
```    
   import Vue from 'vue'
   import VueDataAc from 'vue-dataac'

   Vue.use(VueDataAc, {
       // imageUrl: 'http://data.isjs.cn/lib/image/ac.png'
       // or
       useImgSend: false,
       postUrl: 'http://data.isjs.cn/logStash/push'
    });
```

**ES6**
```
    import VueDataAc from 'vue-dataac'
```

**CommonJS**
```
    var VueDataAc =  require('vue-dataac');
```

**直接引用**
```
    <script src="../node_modules/vue-dataac/dist/vue-dataAc.min.js"></script>
```


## demo:
| 功能 | demo地址  | 数据分析展示 | 
| :------------ |:---------------| :---------------|
| 文档 | 'http://data.isjs.cn/index.html' | '' |
| 行为监控Demo | 'http://data.isjs.cn/basic/index.html' | 'http://data.isjs.cn/log/index.html' |
| 异常监控Demo | 'http://data.isjs.cn/error/index.html' | 'http://data.isjs.cn/log/index.html' |
| 性能监控Demo | 'http://data.isjs.cn/performance/index.html' | 'http://data.isjs.cn/log/index.html' |
| 主动埋点Demo | 'http://data.isjs.cn/appoint/index.html' | 'http://data.isjs.cn/log/index.html' |
| 图片数据上报Demo | 'http://data.isjs.cn/imgreport/index.html' | 'http://data.isjs.cn/log/index.html' |
| 上报节流Demo(sizeLimit) | 'http://data.isjs.cn/reportsize/index.html' | 'http://data.isjs.cn/log/index.html' |
| 关联登录信息Demo | 'http://data.isjs.cn/token/index.html' | 'http://data.isjs.cn/log/index.html' |


## 文档：
    为了尽可能灵活，以下所有配置项理论上都可以修改配置，
    我对每个配置项做了修改建议，供大家参考：
:smile:   = 可以修改    
:neutral_face:   = 最好不修改     
:rage:   = 千万不要修改   

### 1. 标识类配置，作为数据上报信息的分类标识
| 配置项 | 类型  | 默认值 | 是否可配置 | 说明 | 生效版本 |
| :------------ |:---------------| :---------------|:---------------|:---------------|:-----:|
| storeInput | String | 'ACINPUT' |  :neutral_face: | 输入框行为采集标识 | 1.0.0 |
| storePage | String | 'ACPAGE' |  :neutral_face: | 页面访问信息采集标识 |1.0.0 |
| storeClick | String | 'ACCLIK' |  :neutral_face: | 点击事件采集标识 |1.0.0 |
| storeReqErr | String | 'ACRERR' |  :neutral_face: | 请求异常采集标识 |1.0.0 |
| storeTiming | String | 'ACTIME' |  :neutral_face: | 页面性能采集标识 |1.0.0 |
| storeCodeErr | String | 'ACCERR' |  :neutral_face: | 代码异常采集标识 |1.0.0 |
| storeCustom | String | 'ACCUSTOM' |  :neutral_face: | 自定义事件采集标识 | 2.0.0 |
| storeSourceErr | String | 'ACSCERR' |  :neutral_face: | 资源加载异常采集标识  |2.0.0 |
| storePrmseErr | String | 'ACPRERR' |  :neutral_face: | promise抛出异常标识 |2.0.0 |
| storeCompErr | String | 'ACCOMP' |  :neutral_face: | Vue组件性能监控标识 |2.0.0 |
| storeVueErr | String | 'ACVUERR' |  :neutral_face: | Vue异常监控标识  |2.0.0 |

### 2. 全局开关，用来自定义采集范围
| 配置项 | 类型  | 默认值 | 是否可配置 | 说明 | 生效版本 |
| :------------ |:---------------| :---------------|:---------------|:---------------|:-----:|
| userSha | String | 'vue_ac_userSha' |  :smile: | 用户标识存储在Storage中的key，有冲突可修改 | 1.0.0 |
| useImgSend | Boolean | true |  :smile: | 是否使用图片上报数据, 设置为 false 为 xhr 接口请求上报 | 2.0.0 |
| useStorage | Boolean | true |  :smile: | 是否使用storage作为存储载体, 设置为 false 时使用cookie | 2.0.0 |
| maxDays | Number | 365 |  :smile: | 如果使用cookie作为存储载体，此项生效，配置cookie存储时间，默认一年 | 2.0.0 |
| openInput | Boolean | true |  :smile: | 是否开启输入数据采集 | 1.0.0 |
| openCodeErr | Boolean | true |  :smile: | 是否开启代码异常采集 | 1.0.0 |
| openClick | Boolean | true |  :smile: | 是否开启点击数据采集 | 1.0.0 |
| openXhrQuery | Boolean | true |  :smile: | 采集接口异常时是否采集请求参数params | 2.0.0 |
| openXhrHock | Boolean | true |  :smile: | 是否开启xhr异常采集 | 1.0.0 |
| openPerformance | Boolean | true |  :smile: | 是否开启页面性能采集 | 1.0.0 |
| openPage | Boolean | true |  :smile: | 是否开启页面访问信息采集(PV/UV) | 2.0.0 |
| openVueErr | Boolean | true |  :smile: | 是否开启Vue异常监控 | 2.0.0 |
| openSourceErr | Boolean | true |  :smile: | 是否开启资源加载异常采集 | 2.0.0 |
| openPromiseErr | Boolean | true |  :smile: | 是否开启promise异常采集 | 2.0.0 |
| openComponent | Boolean | true |  :smile: | 是否开启组件性能采集 | 2.0.0 |
| maxComponentLoadTime | Number | 1000 |  :rage: | 组件渲染超时阈值，太小会导致信息过多，出发点是找出渲染异常的组件 | 2.0.0 |
| openXhrTimeOut | Boolean | true |  :smile: | 是否开启请求超时上报 | 2.0.0 |
| maxRequestTime | Number | 10000 |  :smile: | 请求时间阈值，请求到响应大于此时间，会上报异常，openXhrTimeOut 为 false 时不生效 | 2.0.0 |
| customXhrErrCode | String | '' |  :smile: | 支持自定义响应code，当接口响应中的code为指定内容时上报异常 | 2.0.0 |

### 3. 行为采集配置
| 配置项 | 类型  | 默认值 | 采集范围 | 是否可配置 | 说明 | 生效版本 |
| :------------ |:---------------| :---------------| :---------------|:---------------|:---------------|:-----:|
| selector | String | 'input' | 所有input输入框（全量采集） | :smile: | 通过控制选择器来限定监听范围,使用document.querySelectorAll进行选择，值参考：https://www.runoob.com/cssref/css-selectors.html | 1.0.0 |
| selector | String | 'input.isjs-ac' | 所有class包含isjs-ac的input输入框（埋点采集） | :smile: | 通过控制选择器来限定监听范围,使用document.querySelectorAll进行选择，值参考：https://www.runoob.com/cssref/css-selectors.html | 1.0.0 |
| ignoreInputType | Array | `['password', 'file']` | type不是password和file的输入框 | :smile: | --- | 1.0.0 |
| ignoreInputType | Array | `[]` | 所有输入框 | :smile: | --- | 2.0.0 |
| classTag | String | '' | 所有可点击元素（全量采集） | :smile: | 点击事件埋点标识, 自动埋点时请配置空字符串| 1.0.0 |
| classTag | String | 'isjs-ac' | 只会采集 class 包含 isjs-ac 元素的点击（埋点采集） | :smile: | 点击事件埋点标识, 自动埋点时请配置空字符串| 1.0.0 |
| maxHelpfulCount | Number | 5 | 全量采集和埋点采集场景下，为了使上报数据准确，我们会递归父元素，找到一个有class或id的祖先元素，此项配置递归次数 | :neutral_face: | 页面层次较深情况下，建议保留配置，以减少性能损耗 | 2.0.0 |

### 4. 数据上报配置
| 配置项 | 类型  | 默认值 | 是否可配置 | 说明 | 生效版本 |
| :------------ |:---------------| :---------------| :---------------|:---------------|:---------------|
| imageUrl | String | 'http://data.isjs.cn/lib/image/ac.png' | :smile: | 《建议》 图片上报地址（通过1*1px图片接收上报信息）依赖 useImgSend 配置打开| 1.0.0 |
| postUrl | String | 'http://data.isjs.cn/logStash/push' | :smile: | 接口上报地址 | 1.0.0 |
| openReducer | Boolean | false | :smile: | 是否开启节流,用于限制上报频率，开启后sizeLimit，manualReport生效 | 2.0.0 |
| sizeLimit | Number | 20 | :smile: | 采集数据超过指定条目时自动上报，依赖 openReducer == true, 优先级：2 | 2.0.0 |
| cacheEventStorage | String | 'ac_cache_data' | :smile: | 开启节流后数据本地存储key | 2.0.0 |
| manualReport | Boolean | false | :smile: | 强制手动上报，开启后只能调用postAcData方法上报，依赖 openReducer == true，优先级：1 | 2.0.0 |

### 5. 实例方法

#### 1. vue.$vueDataAc.setCustomAc( {cusKey: String, cusVal: Any} )
    用于自定义事件的约定上报，例如在业务场景中对某些逻辑的埋点。
    自定义事件上报逻辑与其他事件上报共用，可以通过openReducer限制频率
    
#### 2. vue.$vueDataAc.postAcData()
    手动上报当前采集信息
    
#### 3. vue.$vueDataAc.setUserToken(userToken: String)
    用于关联用户后台标记，利用用户登录后的userid，sessionId
    目的是将前后台日志打通，方便查找模拟用户
       
 
## 上报数据格式：

### 1. 页面访问，路由跳转，等同于PV/UV数据：
    
```
    {
        "uuid": "F6A6C801B7197603",             //用户标识
        "t"   : "",                             //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
            "type"       :  "ACPAGE"            //行为标识
            "sTme"       :  1591760011268       //数据上报时间
            "fromPath"   :  "/register?type=1"  //来源路由
            "formParams" :  "{'type': 1}"       //来源参数
            "toPath"     :  "/login"            //目标路由
            "toParams"   :  "{}"                //目标参数
            "inTime"     :  1591760011268       //页面进入时间
            "outTime"    :  1591760073422       //离开页面时间
        }
    }
```

### 2. 代码异常数据

```
{
        "uuid": "F6A6C801B7197603",                 //用户标识
        "t"   : "",
        "acData" : {
             "type"    : "ACCERR",     		        //上报数据类型：代码异常
             "path"    : "www.domain.com/w/w/w/", //事件发生页面的url
             "sTme"    : "1591760073422",	        //事件上报时间
             "msg"     : "script error",          //异常摘要
             "line"    : "301",  		              //代码行数
             "col"     : "13",  		              //代码列下标
             "err"     : "error message",         //错误信息
         }
}
```

### 3. 资源加载异常数据

```
{
        "uuid": "F6A6C801B7197603",                         //用户标识
        "t"   : "",                                         
        "acData" : {
             "type"        : "ACSCERR",     		            //上报数据类型：资源加载异常
             "path"        : "www.domain.com/w/w/w/",       //事件发生页面地址
             "sTme"        : "1591760073422",	              //事件上报时间
             "fileName"    : "test.js",                     //文件名
             "resourceUri" : "http://isjs.cn/js/test.js",   //资源地址
             "tagName"     : "script",  		                //标签类型
             "outerHTML"   : "script ...",                  //标签内容
          }
}
```

### 4. Promise 异常数据

```
{
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",                                      
        "acData" : {
            "type"        : "ACPRERR",     		           //上报数据类型：Promise 异常
            "path"        : "www.domain.com/w/w/w/",     //事件发生页面地址
            "sTme"        : "1591760073422",	           //事件上报时间
            "reason"      : "reason"                     //异常说明
         }
}
```

### 5. 自定义事件数据

```
  //自定义事件上报
  vue.$vueDataAc.setCustomAc({
    cusKey: "click-button-001",
    cusVal: "1"
  })  

{
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",                                      
        "acData" : {
            "type"        : "ACCUSTOM",     		         //上报数据类型：自定义事件
            "path"        : "www.domain.com/w/w/w/",     //事件发生页面地址
            "sTme"        : "1591760073422",	           //事件上报时间
            "cusKey"      : "click-button-001"           //自定义事件key，用户定义
            "cusVal"      ："1"                          //自定义事件值，用户定义
         }
}
```
### 6. Vue异常监控数据

```
{
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",                                      
        "acData" : {
            "type"          : "ACVUERR",     		         //上报数据类型：Vue异常监控
            "path"          : "www.domain.com/w/w/w/",   //事件发生页面地址
            "sTme"          : "1591760073422",	         //事件上报时间
            "componentName" : "Button"                   //组件名
            "fileName"      : "button.js"                //组件文件
            "propsData"     : "{}"                       //组件props
            "err"           : "..."                      //错误堆栈
            "info"          : "信息"                      //错误信息
            "msg"           : "1"                        //异常摘要
         }
}
```
### 7. 点击事件监控数据

```
{
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",                                      //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
            "type"          : "ACCLIK",     		         //上报数据类型：点击事件监控
            "path"          : "www.domain.com/w/w/w/",   //事件发生页面地址
            "sTme"          : "1591760073422",	         //事件上报时间
            "eId"           : ""                         //元素id属性
            "className"     : "login-form"               //点击元素class属性
            "val"           : "标题"                      //元素value或者innertext
            "attrs"         : "{class:'...', placeholder:'...', type:'...'}"       //元素所有属性对象
         }
}
```

### 8. 输入事件监控数据

```
{
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",                                      //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
            "type"          : "ACINPUT",     		         //上报数据类型：输入事件监控
            "path"          : "www.domain.com/w/w/w/",   //事件发生页面地址
            "sTme"          : "1591760073422",	         //事件上报时间
            "eId"           : ""                         //元素id属性
            "className"     : "van-field__control"       //元素class属性
            "val"           : "0:111,638:11,395:1,327:,1742:5,214:55,207:555,175:5555"     //时间:当前值，用逗号分隔，体现时间变化
            "attrs"         : "{class:'...', placeholder:'...', type:'...'}"               //元素所有属性对象
         }
}
```

### 9. 接口异常数据（包含 请求时间过长/自定义code/请求错误）

```
{
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",
        "acData" : {
            "type"          : "ACRERR",     		         //上报数据类型：接口异常
            "path"          : "www.domain.com/w/w/w/",   //事件发生页面地址
            "sTme"          : "1591760073422",	         //事件上报时间
            "errSubType"    : "http/time/custom"         //异常类型：【time: 请求时间过长】【custom: 自定义code】【http:请求错误】
            "responseURL"   : "/static/push"             //请求接口
            "method"        : "GET"                      //请求方式
            "readyState"    : 4                          //xhr.readyState状态码
            "status"        : "404"                      //请求状态码
            "statusText"    : "not found"                //错误描述
            "requestTime"   : 3000                       //请求耗时
            "response"      : "{...}"                    //接口响应摘要，截取前100个字符
            "query"         : "{}"                       //请求参数，用 openXhrQuery 配置打开，注意用户信息泄露
         }
}
```

### 10. 页面性能监控数据

```
{
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",
        "acData" : {
            "type"          : "ACTIME",     		         //上报数据类型：页面性能监控
            "path"          : "www.domain.com/w/w/w/",   //事件发生页面地址
            "sTme"          : "1591760073422",	         //事件上报时间
            "WT"            : 1000                       //白屏时间
            "TCP"           : 1000                       //TCP连接耗时
            "ONL"           : 1000                       //执行onload事件耗时
            "ALLRT"         : 1000                       //所有请求耗时
            "TTFB"          : 1000                       //TTFB读取页面第一个字节的时间
            "DNS"           : 1000                       //DNS查询时间
         }
}
```
### 11. Vue组件性能监控数据

```
{
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",
        "acData" : {
            "type"          : "ACCOMP",     		         //上报数据类型：页面性能监控
            "path"          : "www.domain.com/w/w/w/",   //事件发生页面地址
            "sTme"          : "1591760073422",	         //事件上报时间
            "componentsTimes" : [                        //渲染超时组件列表
                '组件名': [1000,1200,1090]   
            ]
         }
}
```

## TODO:

- [x] 异常监控  
    - [x] 代码异常  
    - [x] 资源加载异常  
    - [x] promise异常  
    - [x] Vue异常  
    - [x] 请求异常(慢请求，超时，错误)  
    - [x] axios异常
    
- [x] 用户行为监控  
    - [x] 点击事件  
    - [x] 输入事件  
    - [x] 自定义事件  
    - [x] 页面访问事件    
    
- [x] 数据上报  
    - [x] 图片上报  
    - [x] 接口上报  
    - [x] 手动上报  
    
- [x] 页面性能上报  
    - [x] performance  
    - [x] 组件性能上报  
    
- [x] 留存  
    - [x] 访问时间  
    - [x] 访问间隔  
    
- [x] 开关  
    - [x] openPage 页面访问信息采集开关  
    - [x] openSourceErr 资源加载异常采集  
    - [x] openPromiseErr promise异常采集  
    - [x] openCodeErr 是否开启代码异常采集 
    - [x] openVueErr 是否开启Vue异常监控 
    - [x] openSourceErr 是否开启资源加载异常采集 
    - [x] openPromiseErr 是否开启promise异常采集 
    - [x] openClick 是否开启点击数据采集   
    - [x] openInput 是否开启输入数据采集   
    - [x] openXhrQuery 是否采集接口异常时的参数params     
    - [x] openXhrHock 是否开启xhr异常采集    
    - [x] openPerformance 是否开启页面性能采集  
    - [x] openComponent 组件性能采集     
       
    
- [x] npm自动发布  
- [x] 后端日志关联机制  
- [x] eslint  
- [x] docs
- [x] demo
- [x] 文章

    
## Q&A
**1. 我需要采集用户行为吗？**

    用户行为相关数据，我认为对产品有益，可以用于分析转化，页面热点图等   
    根据数据对产品进行调整。所以看你的产品类型 2C 的产品一般有这样的需求   
     
**2. 我需要监控页面异常吗？**

    从前端角度是有必要的，用户遇到问题，经过问题上报，汇总，最终分配到你，时间不可控
    能在第一时间对端上的问题进行告警，会大大提高解决问题的效率
    所以我认为需要有一个监控系统作为生产安全的兜底方案
    
**3. 我需要采集页面性能&组件性能吗？**

    页面性能组件性能，我建议开启，生产测试环境可能因为数据不相同，会有差异性bug
    可能会导致组件渲染慢，影响体验
    但是前提是要把阈值调大，以免数据过多，大量数据上报，会降低对报警的敏感度
    
**4. 数据采集后如何进行整理分析？**

    我们的数据上报分为两种，接口和图片
    其实不论哪一种方式，最终都要将数据本地化，持久化。
    可以问一下公司后端的同事，他们的数据怎么分析，对接他们的上报接口就可以。
    一般这样的日志搜集分析，会用到 ELK 系统。没有的话让运维帮忙搭建一套。
    通过接口将上报的数据存储到本地文件或数据库中。或是通过图片上报，将数据存储在nginx中
    然后用ELK对接日志即可。ELK有提供查询API，你可以做一套轮训告警系统
    
**5. 如何将前端日志与后台日志关联起来？**

    前端日志的唯一标识是uuid，后端唯一标识可以通过 setUserToken方法将用户唯一 id 和 uuid 做关联
    
    
**6. 我该如何将他应用到生产项目中？**
    
    建议你分批次，分功能，做足够量的测试之后，逐步打开开关上线。
    我只能保证在我的场景下可以正常使用，但是不同的产品，不同的用户场景，不能百分百保证
    
    
## 设计思路

### 1. 页面访问采集
    作为页面级访问的采集，我们在beforeCreate中注入了根组件监控，
    当根组件开始渲染时，上报当前页面的地址信息，同时会将此次记录本地存储，页面跳转后，会附加到from字段。
    在多页面应用的场景下，该方式保证了上报，但如果是多入口嵌套vue-router的情况下，会触发第二种监控，
    路由监控，插件会监控你的$route变化，并记录上报。在没有使用vue-router的情况下，只会上报页面的访问信息
    
## change log
### 2.0.9: 
**bugfix:**
1. 修复页面刷新数据未上报问题