
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
    promiseErr: function(){
      new Promise(function (resolve,reject) {
        reject();
      })
    }
  },
  components: {},
  created: function(){},
  mounted: function(){
    //控制loading层
    document.getElementById('app') && document.getElementById('app').style.display = 'block';
    document.getElementById('load') && document.getElementById('load').style.display = 'none';
  },
})
