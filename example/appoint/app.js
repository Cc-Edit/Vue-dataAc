/**
 * VueDataAc 配置
 * */
var OPTIONS = {
  useImgSend: false,
  selector: '.ac_input input, .ac_input textarea', //主动输入埋点
  classTag: 'ac_click', //主动点击埋点
  maxHelpfulCount: 6, //点击查找递归次数
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
    inputValue2: '',
    inputPassword: '',
    desc: '',
    desc1: '',
  },
  computed: {},
  watch: {},
  methods: {},
  components: {},
  created: function(){
  },
  mounted: function(){
    //控制loading层
    document.getElementById('app').style.display = 'block';
    document.getElementById('load').style.display = 'none';
  },
})