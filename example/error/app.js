
/**
 * VueDataAc 配置
 * */
var OPTIONS = {
  useImgSend: false,
  openClick: false
}
Vue.use(VueDataAc, OPTIONS)


/**
 * 默认实例
 * */
var app = new Vue({
  el: '#app',
  data: {
    menuData: window.__menuData__ || []
  },
  computed: {},
  watch: {},
  methods: {
    /**
     * 自定义事件上报
     * */
    codeErrEvent: function(){
      var a = b+1;
    }
  },
  components: {},
  created: function(){
  },
  mounted: function(){},
})