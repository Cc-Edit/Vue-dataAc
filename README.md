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
    
- [ ] 数据上报  
    - [x] 图片上报  
    - [x] 接口上报  
    - [ ] 手动上报  
    
- [ ] 页面性能上报  
    - [ ] performance  
    - [ ] 组件性能上报  
    
- [x] 留存  
    - [x] 访问时间  
    - [x] 访问间隔  
    
- [ ] 开关  
    - [x] openPage 页面访问信息采集开关  
    - [ ] openInput 是否开启输入数据采集     
    - [x] openCodeErr 是否开启代码异常采集     
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
             "sTme"    : "2017-06-21 13:31:31",	    //事件发生时间
             "msg"     : "script error",            //异常摘要
             "line"    : "301",  		            //代码行数
             "col"     : "13",  		            //代码列下标
             "err"     : "error message",           //错误信息
             "ua"      : "ios/chrome 44.44"         //浏览器版本
         }
}
```
 

## 错误代码：
    0x00000001  没有找到对应的时间类型，用户新增加了事件类型，没有在setAcData中添加