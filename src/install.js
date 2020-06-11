import { ac_util_isDef } from './util/util'

/**
 * 暴露插件接口
 * */
export function install (Vue, options, VueDataAc) {
  if (install.installed) return
  install.installed = true

  Vue.mixin({
    watch:{
      $route(to, from) {
        /**
         *  路由变化进行页面访问的采集
         * */
        this.$vueDataAc && this.$vueDataAc._mixinRouterWatch(to, from);
      }
    },
    beforeDestroy () {
      /**
       * 根元素移除时手动上报，以免累计条数不满足 sizeLimit
       * */
      if(this && this.$root && this._uid === this.$root._uid){
        this.$vueDataAc && this.$vueDataAc.postAcData();
      }
    },
    /**
     * 在组件渲染完成后，尝试进行事件劫持
     * mounted 不会保证所有的子组件也都一起被挂载
     * 所以使用 vm.$nextTick
     * */
    mounted () {
      this.$vueDataAc._componentCount++;
      this.$vueDataAc && this.$vueDataAc._options.openInput && this.$nextTick(function () {
        --this.$vueDataAc._componentCount === 0 && this.$vueDataAc._mixinMounted(this);
      });
    }
  })

  Vue.prototype.$vueDataAc = new VueDataAc(options, Vue);
}
