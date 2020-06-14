/**
 * 默认实例
 * */
var app = new Vue({
  el: '#app',
  data: function(){
    var _this = this;
    return {
      menuData: window.__menuData__ || [],
      allLogData: [],
      uuid: '',
      pageSize: 0,
      clickSize: 0,
      inputSize: 0,
      userFoot: [],
      errCode: [],
      reqError: [],
      sourceError: [],
      promiseError: [],
      customError: [],
      vueError: [],
      pagePer: []
    }
  },
  computed: {},
  watch: {},
  methods: {
    formatTime: function(time) {
      var date = new Date(time);
      return ((date.getFullYear()) + "/" + (date.getMonth() + 1) + "/" + (date.getDate()) + " " + (date.getHours()) + ":" + (date.getMinutes()) + ":" + (date.getSeconds()));
    },
    refData: function(){
      var uuid = localStorage.getItem('vue_ac_userSha');
      this.uuid = uuid;
      this.getAllLog(uuid);
    },
    getAllLog: function(uuid, type){
      var _this = this;
      var url = 'http://data.isjs.cn/logStash/getLog?uuid=' + uuid + '&type=' + (type || '');
      axios.get(url)
        .then(function (response) {
          if(response.data && response.data.isOk){
            _this.allLogData = response.data.data || [];
          }else{
            _this.allLogData = []
          }
          _this.renderPage(_this.allLogData);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    renderPage: function(acData) {
      var pageSize = 0,
        clickSize = 0,
        inputSize = 0;

      var userFoot = [],
        errCode  = [],
        reqError = [],
        sourceError = [],
        promiseError = [],
        customError = [],
        vueError = [],
        pagePer  = [];

      for(var i = 0,len = acData.length; i < len; i++){
        for(var key in acData[i]._acData) {
          acData[i][key] = acData[i]._acData[key];
        }
        acData[i]['sTme'] && (acData[i]['sTme'] = this.formatTime(acData[i]['sTme']));
        acData[i]['inTime'] && (acData[i]['inTime'] = this.formatTime(acData[i]['inTime']));
        acData[i]['outTime'] && (acData[i]['outTime'] = this.formatTime(acData[i]['outTime']));
        switch (acData[i].type){
          case 'ACPAGE':
            pageSize++;
            userFoot.push(acData[i]);
            break;
          case 'ACINPUT':
            inputSize++;
            userFoot.push(acData[i]);
            break;
          case 'ACCLIK':
            clickSize++;
            userFoot.push(acData[i]);
            break;
          case 'ACRERR':
            reqError.push(acData[i]);
            break;
          case 'ACSCERR':
            sourceError.push(acData[i]);
            break;
          case 'ACPRERR':
            promiseError.push(acData[i]);
            break;
          case 'ACCUSTOM':
            customError.push(acData[i]);
            break;
          case 'ACVUERR':
            errCode.push(acData[i]);
            break;
          case 'ACTIME':
            pagePer.push(acData[i]);
            break;
          case 'ACCERR':
            errCode.push(acData[i]);
            break;
          case 'ACCOMP':
            vueError.push(acData[i]);
            break;
        }
      }

      this.pageSize = pageSize;
      this.inputSize = inputSize;
      this.clickSize = clickSize;

      this.userFoot = userFoot;
      this.errCode = errCode;
      this.reqError = reqError;
      this.sourceError = sourceError;
      this.promiseError = promiseError;
      this.customError = customError;
      this.vueError = vueError;
      this.pagePer = pagePer;
    }
  },
  components: {},
  created: function(){
    this.refData();
  },
  mounted: function(){
    //控制loading层
    document.getElementById('app').style.display = 'block';
    document.getElementById('load').style.display = 'none';
  },
})