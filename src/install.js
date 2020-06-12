/**
 * 暴露插件接口
 * */
export function install(Vue, options, VueDataAc) {
  if (install.installed) return
  install.installed = true

  Vue.mixin({
    watch: {
      $route(to, from) {
        /**
         *  路由变化进行页面访问的采集
         * */
        if(this.$vueDataAc && this.$vueDataAc.installed && this.$vueDataAc._options.openPage){
          this.$vueDataAc._mixinRouterWatch(to, from, true);
        }
      }
    },
    beforeCreate: function beforeMount(){
      /**
       * 组件性能监控，可能因为某些场景下的数据异常，导致组件不能正常渲染或者渲染慢
       * 我们希望对每个组件进行监控生命周期耗时
       * */
      if (this.$vueDataAc && this.$vueDataAc.installed && this.$vueDataAc._options.openComponent){
        this.$vueDataAc._mixinComponentsPerformanceStart(this)
      }
      /**
       *  上报当前页面url
       * */
      if(this._uid === this.$root._uid){
        if(this.$vueDataAc && this.$vueDataAc.installed && this.$vueDataAc._options.openPage){
          this.$vueDataAc._mixinRouterWatch(null, null, false);
        }
      }
    },
    beforeDestroy() {
      /**
       * 根元素移除时手动上报，以免累计条数不满足 sizeLimit
       * */
      if (this.$vueDataAc && this.$vueDataAc.installed && this._uid === this.$root._uid) {
        this.$vueDataAc && this.$vueDataAc.postAcData();
      }
    },
    /**
     * 在组件渲染完成后，尝试进行事件劫持
     * mounted 不会保证所有的子组件也都一起被挂载
     * 所以使用 vm.$nextTick
     * */
    mounted() {
      if(this.$vueDataAc && this.$vueDataAc.installed){
        //input 时间监听
        if(this.$vueDataAc._options.openInput){
          this.$vueDataAc._componentLoadCount++;
          this.$nextTick(function () {
            --this.$vueDataAc._componentLoadCount === 0 && this.$vueDataAc._mixinInputEvent(this);
          });
        }

        //组件性能监控
        if(this.$vueDataAc._options.openComponent){
          this.$nextTick(function(){
            this.$vueDataAc._mixinComponentsPerformanceEnd(this);
          })
        }
      }
    },
    beforeUpdate() {
      /**
       * 组件性能监控，可能因为某些场景下的数据异常，导致组件不能正常渲染或者渲染慢
       * 我们希望对每个组件进行监控生命周期耗时
       * */
      if (this.$vueDataAc && this.$vueDataAc.installed && this.$vueDataAc._options.openComponent){
        this.$vueDataAc._mixinComponentsPerformanceStart(this)
      }
    },
    updated() {
      if(this.$vueDataAc && this.$vueDataAc.installed && this.$vueDataAc._options.openComponent){
        //组件性能监控
        this.$nextTick(function(){
          this.$vueDataAc._mixinComponentsPerformanceEnd(this);
        })
      }
    }
  })

  Vue.prototype.$vueDataAc = new VueDataAc(options, Vue);
}
