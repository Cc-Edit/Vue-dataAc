// import { ac_util_isNullOrEmpty, isDef } from './util/index'
/**
 * 暴露插件接口
 * */
export function install (Vue) {
  if (install.installed) return
  install.installed = true
  Vue.prototype.$vueDataAc = this;
  Vue.mixin({
    watch:{
      $route(to, from) {

      }
    },
    /**
     *  在组件初始化同时，进行页面访问的采集
     * */
    beforeCreate () {

    },
    /**
     * 在组件移除同时，进行数据上报（可配置）
     * */
    destroyed () {

    },
    /**
     * 在组件渲染完成后，尝试进行事件劫持
     * */
    mounted () {

    }
  })


}
