
/**
 * VueDataAc 配置
 * */
var OPTIONS = {
  useImgSend: false,
  openClick: false,
  openInput: false,
  maxComponentLoadTime: 50
}
Vue.use(VueDataAc, OPTIONS)


/**
 * 默认实例
 * */
var app = new Vue({
  el: '#app',
  data: {
    menuData: window.__menuData__ || [],
    arrayData:[]
  },
  computed: {},
  watch: {},
  methods: {
    /**
     * 自定义事件上报
     * */
    customEvent: function(){
      this.$vueDataAc.setCustomAc({
        cusKey: 'clickAnyButton',
        cusVal: 'click button ...'
      })
    }
  },
  components: {},
  created: function(){
  },
  mounted: function(){},
})