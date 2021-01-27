//暂有功能：每日签到
// nobyda大佬的京东签到里面， 已添加了此功能，如果用了京东签到脚本，此脚本可以停用了。
const $ = new Env('天天签到领现金');
const Key = '';//单引号内自行填写您抓取的京东Cookie
//直接用NobyDa的jd cookie
const cookie = Key ? Key : $.getdata('CookieJD');
const JD_API_HOST = 'https://api.m.jd.com/client.action';
!(async () => {
  if (!cookie) {
    $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
    return;
  }
  await cash_sign();
  await cash_homePage();
  // await cash_doTask(2, '1000002389')
  await msgShow();
  // if ($.isLogin) {
  //   if (!jdNotify || jdNotify === 'false') {
  //     $.msg($.name, subTitle, message);
  //   }
  // }
  // $.msg($.name, subTitle, message);
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
//每日签到
function cash_sign() {
  let functionId = arguments.callee.name.toString();
  let body = {"remind":0,"inviteCode":"","type":0,"breakReward":0};
  return new Promise((resolve) => {
    $.post(taskUrl(functionId, body), (err, resp, data) => {
      try {
        data = JSON.parse(data);
        // console.log(`data${JSON.stringify(data)}`)
        $.data = data;
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
      // if (err) {
      //   console.log("=== request error -s--");
      //   console.log("=== request error -e--");
      // } else {
      //   try {
      //     data = JSON.parse(data);
      //     console.log(`data${JSON.stringify(data)}`)
      //     $.data = data;
      //   } catch (e) {
      //     $.logErr(e, resp);
      //   } finally {
      //     resolve()
      //   }
      // }
    })
  })
}
//做任务
function cash_doTask(type, taskInfo) {
  const body = {
    'type': type,
    'taskInfo': taskInfo
  };
  return new Promise((resolve) => {
    const doTaskUrl = {
      url: JD_API_HOST + `?functionId=cash_doTask`,
      body: `adid=3B3AD5BC-B5E6-4A08-B32A-030CD805B5DD&area=19_1601_50258_51885&body=${escape(JSON.stringify(body))}&build=167283&client=apple&clientVersion=9.0.4&d_brand=apple&d_model=iPhone11%2C8&eid=eidI42550111OTc2RjFCQzgtMTYxQy00OA%3D%3DrCYdObgFE80GYJdgxMLJ0RlHfdF1uWSVuAwDfNOV%2BH%2BArP2K4Ht7t9Cscz%2B/mkYaC70ypbQutgv8vqJr&isBackground=N&joycious=298&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=e35caf0a69be42084e3c97eef56c3af7b0262d01&osVersion=13.5.1&partner=apple&rfs=0000&scope=01&screen=828%2A1792&sign=b2a86a0f477e65a5ea40adc4a7a296cb&st=${Date.now()}&sv=101&uts=0f31TVRjBSsqndu4/jgUPz6uymy50MQJOnkRxds9DBcksJKOMWtLozcAH/M69g0LniG6s05YlJ4C6nk%2BI1mo0gto0Kw8pej0%2BiVtbzGBGqYDTEvkT7XS8YjpNXWZmM4gEDOL2mHlGnj251JSm9QUxTwQz0qHIHeQDWSErxbtZIA45XJsDxWqIIClWOUUPgFrbDVA11WciAWXJ1lqN41m7g%3D%3D&uuid=coW0lj7vbXVin6h7ON%2BtMNFQqYBqMahr&wifiBssid=f7754c40c09909dc5fccf03e8d7e39d4`,
      headers: {
        // 'Cookie': cookie,
        "Host": "api.m.jd.com",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Cookie": "pt_key=AAJfAv31AEBlB0UzN_9K9kXOEs2VvYg5kz8AACQyVpWZs4zInFVXVF01t-a-7ylquYGxUM5DG9F6sSddD4xs_GZV3LYKgX5I;pt_pin=%E8%A2%AB%E6%8A%98%E5%8F%A0%E7%9A%84%E8%AE%B0%E5%BF%8633;",
        "User-Agent": "JD4iPhone/167283 (iPhone; iOS 13.5.1; Scale/2.00)",
        "Accept-Language": "zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8",
        "Content-Length": "870",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.post(doTaskUrl, (err, resp, data) => {
      try {
        data = JSON.parse(data);
        console.log(`做任务----data${JSON.stringify(data)}`)
        // $.homePage = data;
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    })
  })
}
function cash_homePage() {
  const body = {};
  return new Promise((resolve) => {
    const homePageUrl = {
      url: JD_API_HOST + `?functionId=cash_homePage`,
      body: `adid=3B3AD5BC-B5E6-4A08-B32A-030CD805B5DD&area=19_1601_50258_51885&body=${escape(JSON.stringify(body))}&build=167283&client=apple&clientVersion=9.0.4&d_brand=apple&d_model=iPhone11%2C8&eid=eidI42550111OTc2RjFCQzgtMTYxQy00OA%3D%3DrCYdObgFE80GYJdgxMLJ0RlHfdF1uWSVuAwDfNOV%2BH%2BArP2K4Ht7t9Cscz%2B/mkYaC70ypbQutgv8vqJr&isBackground=N&joycious=298&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=e35caf0a69be42084e3c97eef56c3af7b0262d01&osVersion=13.5.1&partner=apple&rfs=0000&scope=01&screen=828%2A1792&sign=216d0aa860a52ea89420293976d2ee28&st=1595926359893&sv=101&uts=0f31TVRjBSsqndu4/jgUPz6uymy50MQJcPZxWlSpDrAQ8407rzIXjarvshNNSEsnLV0tV3BB9%2B3IWXJgCfYn8yocpXrWCjeJzfA4MHUq%2BjAyQ7ZUc8ZaXvIx2JM4dUlg6P1v6IgCWZJa1u0j1YuA7IUrZzm3E1eYuNoB7UmQTgXV4%2BFyD/FzKY0DqsmdN6Fvo8yZeblZwy8sAEI//MvESQ%3D%3D&uuid=coW0lj7vbXVin6h7ON%2BtMNFQqYBqMahr&wifiBssid=f7754c40c09909dc5fccf03e8d7e39d4`,
      headers: {
        'Cookie': cookie,
        "Host": "api.m.jd.com",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "*/*",
        "Connection": "keep-alive",
        "User-Agent": "JD4iPhone/167283 (iPhone; iOS 13.5.1; Scale/2.00)",
        "Accept-Language": "zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8",
        "Content-Length": "870",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.post(homePageUrl, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        // console.log(`cash_homePage----data${JSON.stringify(data)}`)
        $.homePage = data;
        // var canDoTaskList = [];
        // if (data.code === 0) {
        //   if (data.data.result.taskInfos && data.data.result.taskInfos.length > 0) {
        //     for (let item of data.data.result.taskInfos) {
        //       if ((item.type === 2 || item.type === 3 || item.type === 4 || item.type === 17) && item.finishFlag === 2) {
        //         canDoTaskList.push(item);
        //         console.log('type', item.type)
        //         console.log('type', item.desc)
        //         let aa = await cash_doTask(item.type, item.desc);
        //         if (aa.code === 0) {
        //           console.log('重新请求任务列表')
        //           await cash_homePage();
        //         }
        //       }
        //     }
        //   }
        // }
        // canDoTaskList
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    })
  })
}

function msgShow() {
  if ($.data.data.bizCode === 0 && $.data.data.success === 'True' ) {
    $.msg($.name, `今日签到${$.data.data.bizMsg}`, `【签到获得现金】${$.data.data.result.signCash}元\n【现有红包】${$.homePage.data.result.totalMoney}，${$.homePage.data.result.cashOutStatusTip}\\n`);

  } else {
    $.msg($.name, '今日已签到，请明日再来哦', `【现有红包】${$.homePage.data.result.totalMoney}元，${$.homePage.data.result.cashOutStatusTip}\n`);
  }
}
// function request(function_id, body = {}) {
//   return new Promise((resolve) => {
//     $.post(taskurl(function_id, body), (err, resp, data) => {
//       if (err) {
//         console.log("=== request error -s--");
//         console.log("=== request error -e--");
//       } else {
//         try {
//           data = JSON.parse(data);
//           console.log(`data${JSON.stringify(data)}`)
//           $.data = data;
//         } catch (e) {
//           console.log(e);
//         } finally {
//           resolve()
//         }
//       }
//     })
//   })
// }
function taskUrl(function_id, body = {}) {
  // console.log(`${JD_API_HOST}?functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld&client=apple&clientVersion=&networkType=&osVersion=&uuid=`)
  return {
    // url: `${JD_API_HOST}?functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld&client=apple&clientVersion=&networkType=&osVersion=&uuid=`,
    url: JD_API_HOST + `?functionId=${function_id}`,
    // body: `adid=3B3AD5BC-B5E6-4A08-B32A-030CD805B5DD&area=19_1601_50258_51885&body=%7B%22remind%22%3A0%2C%22inviteCode%22%3A%22%22%2C%22type%22%3A0%2C%22breakReward%22%3A0%7D&build=167283&client=apple&clientVersion=9.0.4&d_brand=apple&d_model=iPhone11%2C8&eid=eidI42550111OTc2RjFCQzgtMTYxQy00OA%3D%3DrCYdObgFE80GYJdgxMLJ0RlHfdF1uWSVuAwDfNOV%2BH%2BArP2K4Ht7t9Cscz%2B/mkYaC70ypbQutgv8vqJr&isBackground=N&joycious=298&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=e35caf0a69be42084e3c97eef56c3af7b0262d01&osVersion=13.5.1&partner=apple&rfs=0000&scope=01&screen=828%2A1792&sign=59c1af6b257421672f1c8f6ab878084d&st=1595926377439&sv=102&uts=0f31TVRjBSsqndu4/jgUPz6uymy50MQJcPZxWlSpDrAQ8407rzIXjarvshNNSEsnLV0tV3BB9%2B3IWXJgCfYn8yocpXrWCjeJzfA4MHUq%2BjAyQ7ZUc8ZaXvIx2JM4dUlg6P1v6IgCWZJa1u0j1YuA7IUrZzm3E1eYuNoB7UmQTgXV4%2BFyD/FzKY0DqsmdN6Fvo8yZeblZwy8sAEI//MvESQ%3D%3D&uuid=coW0lj7vbXVin6h7ON%2BtMNFQqYBqMahr&wifiBssid=f7754c40c09909dc5fccf03e8d7e39d4`,
    body: `adid=3B3AD5BC-B5E6-4A08-B32A-030CD805B5DD&area=19_1601_50258_51885&body=${escape(JSON.stringify(body))}&build=167283&client=apple&clientVersion=9.0.4&d_brand=apple&d_model=iPhone11%2C8&eid=eidI42550111OTc2RjFCQzgtMTYxQy00OA%3D%3DrCYdObgFE80GYJdgxMLJ0RlHfdF1uWSVuAwDfNOV%2BH%2BArP2K4Ht7t9Cscz%2B/mkYaC70ypbQutgv8vqJr&isBackground=N&joycious=298&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=e35caf0a69be42084e3c97eef56c3af7b0262d01&osVersion=13.5.1&partner=apple&rfs=0000&scope=01&screen=828%2A1792&sign=59c1af6b257421672f1c8f6ab878084d&st=1595926377439&sv=102&uts=0f31TVRjBSsqndu4/jgUPz6uymy50MQJcPZxWlSpDrAQ8407rzIXjarvshNNSEsnLV0tV3BB9%2B3IWXJgCfYn8yocpXrWCjeJzfA4MHUq%2BjAyQ7ZUc8ZaXvIx2JM4dUlg6P1v6IgCWZJa1u0j1YuA7IUrZzm3E1eYuNoB7UmQTgXV4%2BFyD/FzKY0DqsmdN6Fvo8yZeblZwy8sAEI//MvESQ%3D%3D&uuid=coW0lj7vbXVin6h7ON%2BtMNFQqYBqMahr&wifiBssid=f7754c40c09909dc5fccf03e8d7e39d4`,
    headers: {
      'Cookie': cookie,
      "Host": "api.m.jd.com",
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "*/*",
      "Connection": "keep-alive",
      "User-Agent": "JD4iPhone/167283 (iPhone; iOS 13.5.1; Scale/2.00)",
      "Accept-Language": "zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8",
      "Content-Length": "955",
      "Accept-Encoding": "gzip, deflate, br"
    }
  }
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,o)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=e&&e.timeout?e.timeout:o;const[r,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),o=JSON.stringify(this.data);s?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(e,o):this.fs.writeFileSync(t,o)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return s;return o}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),o=s?this.getval(s):"";if(o)try{const t=JSON.parse(o);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(e),r=this.getval(i),h=i?"null"===r?null:r||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,o,t),s=this.setval(JSON.stringify(e),i)}catch(e){const r={};this.lodash_set(r,o,t),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:o,body:r}=t;e(null,{status:s,statusCode:i,headers:o,body:r},r)},t=>e(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:o,body:r}=t;e(null,{status:s,statusCode:i,headers:o,body:r},r)},t=>e(t)))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:o,body:r}=t;e(null,{status:s,statusCode:i,headers:o,body:r},r)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:o,body:r}=t;e(null,{status:s,statusCode:i,headers:o,body:r},r)},t=>e(t))}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",o){const r=t=>{if(!t||!this.isLoon()&&this.isSurge())return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,r(o)):this.isQuanX()&&$notify(e,s,i,r(o)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}