
/**
 * VueDataAc 配置
 * */
var OPTIONS = {
  useImgSend: false,
  openClick: false,
  openInput: false,
  maxComponentLoadTime: 500
}
Vue.use(VueDataAc, OPTIONS)


/**
 * 默认实例
 * */
var app = new Vue({
  el: '#app',
  data: {
    menuData: window.__menuData__ || [],
    arrayData:[],
    asyncArrayData:[],
  },
  computed: {},
  watch: {},
  methods: {
    genBigData: function(){
      this.asyncArrayData = new Array(100000).keys()
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