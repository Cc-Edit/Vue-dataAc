# Vue-dataAc
    Vue-dataAc 重构 dataAcquisition 以支持Vue

## TODO:

- [ ] 异常监听  
    - [x] 代码异常  
    - [ ] 资源加载异常  
    - [ ] promise异常  
    - [ ] Vue异常  
    
- [ ] 用户行为监控  
    - [ ] 点击事件  
    - [ ] 输入事件  
    - [ ] 自定义事件  
    - [x] 页面访问事件    
    
- [x] 数据上报  
    - [x] 图片上报  
    - [x] 接口上报  
    - [x] 手动上报  
    
- [ ] 页面性能上报  
    - [ ] performance  
    - [ ] 组件性能上报  
    
- [x] 留存  
    - [x] 访问时间  
    - [x] 访问间隔  
    
- [ ] 开关  
    - [x] openPage 页面访问信息采集开关  
    - [x] openSourceErr 资源加载异常采集  
    - [x] openPromiseErr promise异常采集  
    - [x] openCodeErr 是否开启代码异常采集 
    - [ ] openComponent 组件性能采集     
    - [ ] openInput 是否开启输入数据采集     
    - [ ] openClick 是否开启点击数据采集     
    - [ ] openXhrData 是否采集接口异常时的参数params     
    - [ ] openXhrHock 是否开启xhr异常采集     
    - [ ] openPerformance 是否开启页面性能采集     
    
- [ ] npm自动发布  
- [ ] demo  
- [ ] 热点图  
- [ ] 圈选  

    
    
## 上报数据格式：

### 1. 页面访问，路由跳转，等同于PV/UV数据：
    
```
    {
        "uuid": "F6A6C801B7197603",             //用户标识
        "acData" : {
            "type"       :  "ACPAGE"            //行为标识
            "fromPath"   :  "/register?type=1"  //来源路由
            "formParams" :  "{'type': 1}"       //来源参数
            "toPath"     :  "/login"            //目标路由
            "toParams"   :  "{}"                //目标参数
            "sTme"   :  1591760011268           //页面进入时间
            "eTme"   :  1591760073422           //离开页面时间
        }
    }
```

### 2. 代码异常

```
 {
        "uuid": "F6A6C801B7197603",                 //用户标识
        "acData" : {
             "type"    : "ACCERR",     		        //上报数据类型：代码异常
             "path"    : "www.domain.com/w/w/w/",   //事件发生页面的url
             "sTme"    : "1591760073422",	        //事件发生时间
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
        "acData" : {
             "type"        : "ACSCERR",     		        //上报数据类型：资源加载异常
             "path"        : "www.domain.com/w/w/w/",       //事件发生页面地址
             "sTme"        : "1591760073422",	            //事件发生时间
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
        "acData" : {
            "type"        : "ACSCERR",     		         //上报数据类型：资源加载异常
            "path"        : "www.domain.com/w/w/w/",     //事件发生页面地址
            "sTme"        : "1591760073422",	         //事件发生时间
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
        "acData" : {
            "type"        : "ACSCERR",     		         //上报数据类型：资源加载异常
            "path"        : "www.domain.com/w/w/w/",     //事件发生页面地址
            "sTme"        : "1591760073422",	         //事件发生时间
            "ua"          : "ios/chrome 44.44"           //浏览器信息 
            "cusKey"      : "click-button-001"           //自定义事件key，用户定义
            "cusVal"      ："1"                          //自定义事件值，用户定义
         }
}
```
 

## 错误代码：
    0x00000001  没有找到对应的时间类型，用户新增加了事件类型，没有在setAcData中添加
    
## 方法：

#### vue.$vueDataAc.setCustomAc(cusKey: string, cusVal: Any)
    用于自定义事件的约定上报，例如在业务场景中对某些逻辑的埋点。
    自定义事件上报逻辑与其他事件上报共用，可以通过openReducer限制频率
    
#### vue.$vueDataAc.postAcData()
    手动上报当前采集信息