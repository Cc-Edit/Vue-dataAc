
/**
 * VueDataAc 配置
 * */
var OPTIONS = {
  useImgSend: false
}
Vue.use(VueDataAc, OPTIONS)


/**
 * 默认实例
 * */
var app = new Vue({
  el: '#app',
  data: {
    menuData: window.__menuData__ || [],
    inputValue: '',
    inputPassword: '',
    desc: '',
    phone: 'apple',
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
  mounted: function(){
    //控制loading层
    document.getElementById('app') && document.getElementById('app').style.display = 'block';
    document.getElementById('load') && document.getElementById('load').style.display = 'none';
  },
})