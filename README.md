# Vue-dataAc
    Vue-dataAc 重构 dataAcquisition 以支持Vue

## TODO:

- [ ] 异常监听  
    - [ ] 代码异常  
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
            "sTme"   :  "19802020000"           //页面进入时间
            "eTme"   :  "19802026000"           //离开页面时间
        }
    }
```
    
## 错误代码：
    0x00000001  没有找到对应的时间类型，用户新增加了事件类型，没有在setAcData中添加