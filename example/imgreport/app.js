
/**
 * VueDataAc 配置
 * */
var OPTIONS = {
  imageUrl: 'http://data.isjs.cn/lib/image/ac.png',
  openClick: false
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
    document.getElementById('app').style.display = 'block';
    document.getElementById('load').style.display = 'none';
  },
})