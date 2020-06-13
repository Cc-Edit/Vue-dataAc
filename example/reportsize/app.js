
/**
 * VueDataAc 配置
 * */
var OPTIONS = {
  useImgSend: false,

  openReducer: true,
  sizeLimit: 5,

  selector: '.ac_input input, .ac_input textarea', //主动输入埋点
  classTag: 'ac_click', //主动点击埋点
  maxHelpfulCount: 6, //点击查找递归次数
}
Vue.use(VueDataAc, OPTIONS)


/**
 * vuerouter 测试数据
 * */
var Home = { template: '<div>home page</div>' }
var Login = { template: '<div>login page</div>' }
var User = { template: '<div>user page</div>' }

var routes = [
  { path: '/home', component: Home },
  { path: '/login', component: Login },
  { path: '/user', component: User },
]
const router = new VueRouter({
  routes: routes
})
/**
 * 默认实例
 * */
var app = new Vue({
  router,
  el: '#app',
  data: {
    menuData: window.__menuData__ || [],
    inputValue: '',
    inputValue2: '',
    inputPassword: '',
    desc: '',
    desc1: '',
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
    document.getElementById('app').style.display = 'block';
    document.getElementById('load').style.display = 'none';
  },
})