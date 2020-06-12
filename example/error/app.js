
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
  created: function(){
    throw new DOMException()
  },
  mounted: function(){},
})
