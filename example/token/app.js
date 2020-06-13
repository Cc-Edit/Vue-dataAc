
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
     * 设置用户信息
     * */
    setUserToken: function(){
      this.$vueDataAc.setUserToken('112233')
    }
  },
  components: {},
  created: function(){
  },
  mounted: function(){
    //控制loading层
    document.getElementById('app').style.display = 'block';
    document.getElementById('load').style.display = 'none';
  },
})