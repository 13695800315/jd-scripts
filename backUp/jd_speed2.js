/*
京东天天加速活动 国内gitee链接：https://gitee.com/fm1223/jd-scripts/raw/master/jd_speed.js
更新时间:2020-08-15
每天4京豆，再小的苍蝇也是肉
从 https://github.com/Zero-S1/JD_tools/blob/master/JD_speed.py 改写来的
建议3小时运行一次，打卡时间间隔是6小时
注：如果使用Node.js, 需自行安装'crypto-js,got,http-server,tough-cookie'模块. 例: npm install crypto-js http-server tough-cookie got --save
*/
// quantumultx
// [task_local]
// #天天加速
// 8 */3 * * * https://gitee.com/fm1223/jd-scripts/raw/master/jd_speed.js, tag=京东天天加速, img-url=https://raw.githubusercontent.com/znz1992/Gallery/master/jdttjs.png, enabled=true
// Loon
// [Script]
// cron "8 */3 * * *" script-path=https://gitee.com/fm1223/jd-scripts/raw/master/jd_speed.js,tag=京东天天加速
const name = '天天加速';
const $ = new Env(name);
const Key = '';//单引号内自行填写您抓取的京东Cookie
//直接用NobyDa的jd cookie
const cookie =  Key ? Key : $.getdata('CookieJD');
let jdNotify = $.getdata('jdSpeedNotify');
const JD_API_HOST = 'https://api.m.jd.com/';
let gen = entrance();
gen.next();

let indexState = 0;
let message = '', subTitle = '';
let beans_num = null;
let distance = null;
let destination = null;
let source_id = null;
let done_distance = null;
let task_status = null, able_energeProp_list = [], spaceEvents = [], energePropUsale = [];
function* entrance() {
  if (!cookie) {
    $.msg(name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', { "open-url": "https://bean.m.jd.com/" });
    $.done();
    return
  }
  console.log(`start...`);
  yield flyTask_state();
  console.log(`task_status::${task_status}`)
  if (task_status === 0) {
    console.log(`开启新任务：${JSON.stringify(destination)}`);
    yield flyTask_start(source_id)
  } else if (task_status === 1) {
    console.log(`任务进行中：${JSON.stringify(destination)}`);
  } else if (task_status === 2) {
    $.msg(name, subTitle, '天天加速2个京豆已到账');
    yield flyTask_state();
    console.log(`task_status::${task_status}`)
    console.log(`开启新任务：${JSON.stringify(destination)}`);
    yield flyTask_start(source_id);
  }

  yield spaceEvent_list();//检查太空特殊事件
  console.log(`可处理的太空特殊事件信息:${spaceEvents.length}个`);
  if (spaceEvents && spaceEvents.length > 0) {
    yield spaceEvent();//处理太空特殊事件
  }
  console.log('开始检查可领取燃料')
  yield energyPropList();
  console.log(`可领取燃料::${able_energeProp_list.length}个`)
  if (able_energeProp_list && able_energeProp_list.length > 0) {
    yield receiveeEergyProp();
  }
  yield energePropUsaleList();//检查剩余可用的燃料
  console.log(`可使用燃料${energePropUsale.length}个`)
  if (energePropUsale && energePropUsale.length > 0) {
    yield useEnergy();
  }
  //执行上面操作后，再进行一次检测
  yield flyTask_state();
  if (task_status === 0) {
    console.log(`开启新任务：${JSON.stringify(destination)}`);
    yield flyTask_start(source_id);
    // fix bug ，开启新任务后，再次检查可用的燃料，如果有可用的，继续使用
    yield energePropUsaleList();//检查剩余可用的燃料
    console.log(`可使用燃料${energePropUsale.length}个`)
    if (energePropUsale && energePropUsale.length > 0) {
      yield useEnergy();
    }
  } else if (task_status === 1) {
    console.log(`任务进行中：${JSON.stringify(destination)}`);
  } else if (task_status === 2) {
    $.msg(name, subTitle, '天天加速2个京豆已到账');
    yield flyTask_state();
    console.log(`task_status::${task_status}`)
    console.log(`开启新任务：${JSON.stringify(destination)}`);
    yield flyTask_start(source_id);
  }
  if (!jdNotify || jdNotify === 'false') {
    $.msg(name, subTitle, message);
  }
  $.done();
}
//检查燃料
function energyPropList() {
  const body = {
    "source":"game",
  }
  request('energyProp_list', body).then(response => {
    // console.log(`检查燃料列表:${JSON.stringify(response)}`);
    if (response.code === 0 && response.data && response.data.length > 0) {
      for (let item of response.data) {
        if (item.thaw_time === 0) {
          able_energeProp_list.push(item);
        }
      }
    }
    gen.next();
  })
}

async function receiveeEergyProp() {
  //开始领取燃料
  for (let i of able_energeProp_list) {
    let memberTaskCenterRes =  await _energyProp_gain(i.id);
    console.log(`领取燃料结果：：：${memberTaskCenterRes.message}`)
  }
  gen.next();
}
// 领取燃料调用的api
function _energyProp_gain(energy_id) {
  console.log('energy_id', energy_id)
  if (!energy_id) return;
  const body = {
    "source":"game",
    "energy_id": energy_id
  }
  return new Promise((res, rej) => {
    request('energyProp_gain', body).then((response) => {
      res(response);
    })
  })
}
//检查特殊事件
function spaceEvent_list() {
  const body = {
    "source":"game",
  }
  request('spaceEvent_list', body).then(response => {
    console.log(`开始检查特殊事件`);
    if (response.code === 0 && response.data && response.data.length > 0) {
      for (let item of response.data) {
        if (item.status === 1) {
          for (let j of item.options) {
            if(j.type === 1) {
              spaceEvents.push({
                "id": item.id,
                "value": j.value
              })
            }
          }
        }
      }
    }
    gen.next();
  })
}
// 处理太空特殊事件
async function spaceEvent() {
  for (let item of spaceEvents) {
    let spaceEventRes = await spaceEventHandleEvent(item.id, item.value);
    console.log(`处理特殊事件的结果：：${JSON.stringify(spaceEventRes)}`)
  }
  gen.next();
}
//处理太空特殊事件调用的api
function spaceEventHandleEvent(id, value) {
  if (!id && !value) return;
  const body = {
    "source":"game",
    "eventId": id,
    "option": value
  }
  return new Promise((res, rej) => {
    request('spaceEvent_handleEvent', body).then((response) => {
      res(response);
    })
  })
}
function energePropUsaleList() {
  const body = {
    "source":"game"
  };
  request('energyProp_usalbeList', body).then(res => {
    console.log(`检查剩余燃料`);
    energePropUsale = [];
    if (res.code === 0 && res.data && res.data.length > 0) {
      res.data.map(item => {
        energePropUsale.push(item)
      })
    }
    gen.next();
  });
}

//使用能源
async function useEnergy() {
  for (let i of energePropUsale) {
    let _energyProp_use = await energyPropUse(i.id);
    console.log(`使用燃料的结果：：${_energyProp_use.message}`)
    if (_energyProp_use.code !== 0) {
      console.log(`${_energyProp_use.message},跳出循环`);
      $.msg($.name, '', "【上轮太空旅行】2 🐶京豆已到账");
      break
    }
  }
  gen.next();
}
//使用能源调用的api
function energyPropUse(id) {
  if (!id) return
  const body = {
    "source":"game",
    "energy_id": id
  }
  return new Promise((res, rej) => {
    request('energyProp_use', body).then((response) => {
      res(response);
    })
  })
}
//开始新的任务
function flyTask_start(source_id) {
  if (!source_id) return;
  const functionId = arguments.callee.name.toString();
  const body = {
    "source":"game",
    "source_id": source_id
  }
  request(functionId, body).then(res => {
    console.log(`新的任务结束时间:${res.data.end_time}`);
    gen.next();
  })
}
function flyTask_state() {
  const functionId = arguments.callee.name.toString();
  const body = {
    "source":"game"
  }
  request(functionId, body).then((res) => {
    // console.log(`初始化信息flyTask_state:${JSON.stringify(res)}`)
    if (res.code === 0) {
      if (res.info.isLogin === 0) {
        $.setdata('', 'CookieJD');//cookie失效，故清空cookie。
        $.msg(name, '【提示】京东cookie已失效,请重新登录获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
        $.done();
        return
      }
      let data = res.data;
      if (data.beans_num) {
        beans_num = data.beans_num
        distance = data.distance
        destination = data.destination
        done_distance = data.done_distance
        source_id = data.source_id//根据source_id 启动flyTask_start()
        task_status = data.task_status //0,没开始；1，已开始
        subTitle = `【奖励】${beans_num}京豆`
        if (indexState === 1) {
          message += `【空间站】 ${destination}\n`;
          message += `【结束时间】 ${data['end_time']}\n`;
          message += `【进度】 ${((res.data.done_distance / res.data.distance) * 100).toFixed(2)}%\n`;
        }
        indexState++;
      }
      gen.next();
    } else {
      gen.return()
    }
  })
}

async function request(function_id, body = {}) {
  await $.wait(300);//延迟两秒
  return new Promise((resolve, reject) => {
    $.get(taskurl(function_id, body), (err, resp, data) => {
      try {
        if (err) {
          console.log("=== request error -s--");
          console.log("=== request error -e--");
        } else {
          data = JSON.parse(_jsonpToJson(data))
        }
      } catch (e) {
        console.log(e)
      } finally {
        resolve(data)
      }
    })
  })
}

function _jsonpToJson(v) {
  return v.match(/{.*}/)[0]
}
function taskurl(function_id, body) {
  let url = '';
  if (function_id === 'spaceEvent_handleEvent') {
    url = `${JD_API_HOST}?appid=memberTaskCenter&functionId=${function_id}&body=${escape(JSON.stringify(body))}&jsonp=__jsonp1593330783690&_=${new Date().getTime()}&t=${new Date().getTime()}`
  } else {
    url = `${JD_API_HOST}?appid=memberTaskCenter&functionId=${function_id}&body=${escape(JSON.stringify(body))}&jsonp=__jsonp1593330783690&_=${new Date().getTime()}`;
  }
  return {
    url,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'User-Agent': 'jdapp;iPhone;8.5.5;13.4;9b812b59e055cd226fd60ebb5fd0981c4d0d235d;network/wifi;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/0;model/iPhone9,2;addressid/138109592;hasOCPay/0;appBuild/167121;supportBestPay/0;jdSupportDarkMode/0;pv/104.43;apprpd/MyJD_GameMain;ref/MyJdGameEnterPageController;psq/9;ads/;psn/9b812b59e055cd226fd60ebb5fd0981c4d0d235d|272;jdv/0|direct|-|none|-|1583449735697|1583796810;adk/;app_device/IOS;pap/JA2015_311210|8.5.5|IOS 13.4;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
      'Accept-Language': 'zh-cn',
      'Referer': 'https://h5.m.jd.com/babelDiy/Zeus/6yCQo2eDJPbyPXrC3eMCtMWZ9ey/index.html?lng=116.845095&lat=39.957701&sid=ea687233c5e7d226b30940ed7382c5cw&un_area=5_274_49707_49973',
      'Accept-Encoding': 'gzip, deflate, br'
    }
  }
}

// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}