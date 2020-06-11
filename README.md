# Vue-dataAc
    Vue-dataAc 重构 dataAcquisition 以支持Vue

## TODO:

- [x] 异常监控  
    - [x] 代码异常  
    - [x] 资源加载异常  
    - [x] promise异常  
    - [x] Vue异常  
    - [x] 请求异常(慢请求，超时，错误)  
    
- [x] 用户行为监控  
    - [x] 点击事件  
    - [x] 输入事件  
    - [x] 自定义事件  
    - [x] 页面访问事件    
    
- [x] 数据上报  
    - [x] 图片上报  
    - [x] 接口上报  
    - [x] 手动上报  
    
- [ ] 页面性能上报  
    - [x] performance  
    - [ ] 组件性能上报  
    
- [x] 留存  
    - [x] 访问时间  
    - [x] 访问间隔  
    
- [ ] 开关  
    - [x] openPage 页面访问信息采集开关  
    - [x] openSourceErr 资源加载异常采集  
    - [x] openPromiseErr promise异常采集  
    - [x] openCodeErr 是否开启代码异常采集 
    - [x] openVueErr 是否开启Vue异常监控 
    - [x] openSourceErr 是否开启资源加载异常采集 
    - [x] openPromiseErr 是否开启promise异常采集 
    - [x] openClick 是否开启点击数据采集   
    - [x] openInput 是否开启输入数据采集   
    - [x] openXhrData 是否采集接口异常时的参数params     
    - [x] openXhrHock 是否开启xhr异常采集    
    - [x] openPerformance 是否开启页面性能采集  
    - [ ] openComponent 组件性能采集     
       
    
- [x] npm自动发布  
- [x] 后端日志关联机制  
- [ ] demo  

    
    
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

### 2. 代码异常

```
 {
        "uuid": "F6A6C801B7197603",                 //用户标识
        "t"   : "",                                 //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
             "type"    : "ACCERR",     		        //上报数据类型：代码异常
             "path"    : "www.domain.com/w/w/w/",   //事件发生页面的url
             "sTme"    : "1591760073422",	        //事件上报时间
             "msg"     : "script error",            //异常摘要
             "line"    : "301",  		            //代码行数
             "col"     : "13",  		            //代码列下标
             "err"     : "error message",           //错误信息
             "ua"      : "ios/chrome 44.44"         //浏览器信息
         }
}
```

### 3. 资源加载异常

```
 {
        "uuid": "F6A6C801B7197603",                         //用户标识
        "t"   : "",                                         //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
             "type"        : "ACSCERR",     		        //上报数据类型：资源加载异常
             "path"        : "www.domain.com/w/w/w/",       //事件发生页面地址
             "sTme"        : "1591760073422",	            //事件上报时间
             "fileName"    : "test.js",                     //文件名
             "resourceUri" : "http://isjs.cn/js/test.js",   //资源地址
             "tagName"     : "script",  		            //标签类型
             "outerHTML"   : "<script ...>",                //标签内容
             "ua"          : "ios/chrome 44.44"             //浏览器信息
         }
}
```

### 4. Promise 异常数据

```
 {
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",                                      //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
            "type"        : "ACPRERR",     		         //上报数据类型：资源加载异常
            "path"        : "www.domain.com/w/w/w/",     //事件发生页面地址
            "sTme"        : "1591760073422",	         //事件上报时间
            "ua"          : "ios/chrome 44.44"           //浏览器信息 
            "reason"      : "reason"                     //异常说明
         }
}
```

### 5. 自定义事件

```
  //自定义事件上报
  vue.$vueDataAc.setCustomAc({
    cusKey: "click-button-001",
    cusVal: "1"
  })  

 {
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",                                      //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
            "type"        : "ACCUSTOM",     		     //上报数据类型：资源加载异常
            "path"        : "www.domain.com/w/w/w/",     //事件发生页面地址
            "sTme"        : "1591760073422",	         //事件上报时间
            "ua"          : "ios/chrome 44.44"           //浏览器信息 
            "cusKey"      : "click-button-001"           //自定义事件key，用户定义
            "cusVal"      ："1"                          //自定义事件值，用户定义
         }
}
```
### 6. Vue异常监控

```
 {
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",                                      //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
            "type"          : "ACVUERR",     		     //上报数据类型：资源加载异常
            "path"          : "www.domain.com/w/w/w/",   //事件发生页面地址
            "sTme"          : "1591760073422",	         //事件上报时间
            "ua"            : "ios/chrome 44.44"         //浏览器信息 
            "componentName" : "Button"                   //组件名
            "fileName"      : "button.js"                //组件文件
            "propsData"     : "{}"                       //组件props
            "err"           : "..."                      //错误堆栈
            "info"          : "信息"                      //错误信息
            "msg"           : "1"                        //异常摘要
         }
}
```
### 7. 点击事件监控

```
 {
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",                                      //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
            "type"          : "ACCLIK",     		     //上报数据类型：资源加载异常
            "path"          : "www.domain.com/w/w/w/",   //事件发生页面地址
            "sTme"          : "1591760073422",	         //事件上报时间
            "ua"            : "ios/chrome 44.44"         //浏览器信息 
            "eId"           : ""                         //元素id属性
            "className"     : "login-form"               //点击元素class属性
            "val"           : "标题"                      //元素value或者innertext
            "attrs"         : "{class:'...', placeholder:'...', type:'...'}"       //元素所有属性对象
         }
}
```

### 8. input输入事件监控

```
 {
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",                                      //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
            "type"          : "ACINPUT",     		     //上报数据类型：资源加载异常
            "path"          : "www.domain.com/w/w/w/",   //事件发生页面地址
            "sTme"          : "1591760073422",	         //事件上报时间
            "ua"            : "ios/chrome 44.44"         //浏览器信息 
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
        "t"   : "",                                      //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
            "type"          : "ACRERR",     		     //上报数据类型：资源加载异常
            "path"          : "www.domain.com/w/w/w/",   //事件发生页面地址
            "sTme"          : "1591760073422",	         //事件上报时间
            "ua"            : "ios/chrome 44.44"         //浏览器信息 
            "errSubType"    : "http/time/custom"         //异常类型：【time: 请求时间过长】【custom: 自定义code】【http:请求错误】
            "responseURL"   : "/static/push"             //请求接口
            "method"        : "GET"                      //请求方式
            "readyState"    : 4                          //xhr.readyState状态码
            "status"        : "404"                      //请求状态码
            "statusText"    : "not found"                //错误描述
            "requestTime"   : 3000                       //请求耗时
            "response"      : "{...}"                    //接口响应摘要，截取前100个字符
            "query"         : "{}"                       //请求参数，用 openXhrData 配置打开，注意用户信息泄露
         }
}
```

### 10. 页面性能监控

```
 {
        "uuid": "F6A6C801B7197603",                      //用户标识
        "t"   : "",                                      //后端 用户标识/登录标识 默认为空，通过setUserToken设置
        "acData" : {
            "type"          : "ACRERR",     		     //上报数据类型：资源加载异常
            "path"          : "www.domain.com/w/w/w/",   //事件发生页面地址
            "sTme"          : "1591760073422",	         //事件上报时间
            "ua"            : "ios/chrome 44.44"         //浏览器信息 
            "WT"            : 1000                       //白屏时间
            "TCP"           : 1000                       //TCP连接耗时
            "ONL"           : 1000                       //执行onload事件耗时
            "ALLRT"         : 1000                       //所有请求耗时
            "TTFB"          : 1000                       //TTFB读取页面第一个字节的时间
            "DNS"           : 1000                       //DNS查询时间
            "DR"            : 1000                       //dom ready时间
         }
}
```

## 错误代码：
    0x00000001  没有找到对应的时间类型，用户新增加了事件类型，没有在setAcData中添加
    
## 方法：

#### vue.$vueDataAc.setCustomAc(cusKey: String, cusVal: Any)
    用于自定义事件的约定上报，例如在业务场景中对某些逻辑的埋点。
    自定义事件上报逻辑与其他事件上报共用，可以通过openReducer限制频率
    
#### vue.$vueDataAc.postAcData()
    手动上报当前采集信息
    
#### vue.$vueDataAc.setUserToken(userToken: String)
    用于关联用户后台标记，利用用户登录后的userid，sessionId
    目的是将前后台日志打通，方便查找