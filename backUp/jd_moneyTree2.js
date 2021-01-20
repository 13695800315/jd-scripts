/*
京东摇钱树 ：https://gitee.com/fm1223/jd-scripts/raw/master/jd_moneyTree.js
更新时间:2020-07-22
注：如果使用Node.js, 需自行安装'crypto-js,got,http-server,tough-cookie'模块. 例: npm install crypto-js http-server tough-cookie got --save
*/
// quantumultx
// [task_local]
// #京东摇钱树
// 3 */2 * * * https://gitee.com/fm1223/jd-scripts/raw/master/jd_moneyTree.js, tag=京东摇钱树, img-url=https://raw.githubusercontent.com/znz1992/Gallery/master/moneyTree.png, enabled=true
// Loon
// [Script]
// cron "3 */2 * * *" script-path=https://gitee.com/fm1223/jd-scripts/raw/master/jd_moneyTree.js,tag=京东摇钱树
const Notice = 2;//设置运行多少次才通知。
const name = '京东摇钱树';
const $ = new Env(name);
const Key = '';//单引号内自行填写您抓取的京东Cookie
//直接用NobyDa的jd cookie
const cookie =  Key ? Key : $.getdata('CookieJD');
let jdNotify = $.getdata('jdMoneyTreeNotify');
let treeMsgTime = $.getdata('treeMsgTime') >= Notice ? 0 : $.getdata('treeMsgTime') || 0;

const JD_API_HOST = 'https://ms.jr.jd.com/gw/generic/uc/h5/m';
let userInfo = null, taskInfo = [], message = '', subTitle = '', fruitTotal = 0;
let gen = entrance();
gen.next();
function* entrance() {
  if (!cookie) {
    $.msg(name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', { "open-url": "https://bean.m.jd.com/" });
    $.done();
    return
  }
  yield user_info();
  yield signEveryDay();//每日签到
  yield dayWork();//做任务
  console.log('开始做浏览任务了')
  console.log(`浏览任务列表：：${JSON.stringify(taskInfo)}`);
  // for (let task of taskInfo) {
  //   if (task.mid && task.workStatus === 0) {
  //     console.log('开始做浏览任务');
  //     yield setUserLinkStatus(task.mid);
  //   } else if (task.mid && task.workStatus === 1){
  //     console.log(`开始领取浏览后的奖励:mid:${task.mid}`);
  //     let receiveAwardRes = await receiveAward(task.mid);
  //     console.log(`领取浏览任务奖励成功：${JSON.stringify(receiveAwardRes)}`)
  //   } else if (task.mid && task.workStatus === 2) {
  //     console.log('所有的浏览任务都做完了')
  //   }
  // }
  yield harvest(userInfo);//收获

  if (fruitTotal > 380) {
    //金果数量大于380，才可以卖出
    yield sell();
  }
  yield myWealth();
  // console.log(`----${treeMsgTime}`)
  msgControl();
  console.log('任务做完了');
  console.log(`运行脚本次数和设置的次数是否相等::${($.getdata('treeMsgTime') * 1) === Notice}`);
  console.log(`box订阅静默运行-是否打开::${jdNotify || jdNotify === 'true'}`);
  console.log(`是否弹窗::${(($.getdata('treeMsgTime') * 1) === Notice) && (!jdNotify || jdNotify === 'false')}`);
  if (!jdNotify || jdNotify === 'false') {
    // $.msg(name, subTitle, message);
    if (($.getdata('treeMsgTime') * 1) === Notice) {
      $.msg(name, subTitle, message);
      $.setdata('0', 'treeMsgTime');
    }
  }
  $.done();
}

function user_info() {
  console.log('初始化摇钱树个人信息');
  const params = {
    "sharePin":"",
    "shareType":1,
    "channelLV":"",
    "source":0,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  params.riskDeviceParam = JSON.stringify(params.riskDeviceParam);
  request('login', params).then((res) => {
    console.log(`登录信息:${JSON.stringify(res)}\n`);
    if (res && res.resultCode === 0) {
      console.log('resultCode为0')
      if (res.resultData.data) {
        console.log('res.resultData.data有值')
        userInfo = res.resultData.data;
        if (userInfo.realName) {
          console.log(`助力码sharePin为：：${userInfo.sharePin}`);
          subTitle = `${userInfo.nick}的${userInfo.treeInfo.treeName}`;
          // message += `【我的金果数量】${userInfo.treeInfo.fruit}\n`;
          // message += `【我的金币数量】${userInfo.treeInfo.coin}\n`;
          // message += `【距离${userInfo.treeInfo.level + 1}级摇钱树还差】${userInfo.treeInfo.progressLeft}\n`;
          gen.next();
        } else {
          $.msg(name, `【提示】请先去京东app参加摇钱树活动\n入口：我的->游戏与互动->查看更多`, '', {"open-url": "openApp.jdMobile://"});
          $.done();
          return
          gen.return();
        }
      }
    } else {
      console.log('走了else');
      if (res.resultCode === 3) {
        $.setdata('', 'CookieJD');//cookie失效，故清空cookie。
        $.msg(name, '【提示】京东cookie已失效,请重新登录获取', 'https://bean.m.jd.com/', { "open-url": "https://bean.m.jd.com/" });
        $.done();
        return
      }
      gen.return();
    }
  });
}

async function dayWork() {
  console.log(`开始做任务userInfo了\n`)
  const data = {
    "source":0,
    "linkMissionIds":["666","667"],
    "LinkMissionIdValues":[7,7],
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  };
  let response = await request('dayWork', data);
  console.log(`获取任务的信息:${JSON.stringify(response)}\n`)
  let canTask = [];
  taskInfo = [];
  if (response.resultCode === 0) {
    if (response.resultData.code === '200') {
      response.resultData.data.map((item) => {
        if (item.prizeType === 2) {
          canTask.push(item);
        }
        if (item.workType === 7 && item.prizeType === 0) {
          // missionId.push(item.mid);
          taskInfo.push(item);
        }
        // if (item.workType === 7 && item.prizeType === 0) {
        //   missionId2 = item.mid;
        // }
      })
    }
  }
  console.log(`canTask::${JSON.stringify(canTask)}\n`)
  console.log(`浏览任务列表taskInfo::${JSON.stringify(taskInfo)}\n`)
  for (let item of canTask) {
    if (item.workType === 1) {
      //  签到任务
      // let signRes = await sign();
      // console.log(`签到结果:${JSON.stringify(signRes)}`);
      if (item.workStatus === 0) {
        // const data = {"source":2,"workType":1,"opType":2};
        // let signRes = await request('doWork', data);
        let signRes = await sign();
        console.log(`三餐签到结果:${JSON.stringify(signRes)}`);
      } else if (item.workStatus === 2) {
        console.log(`三餐签到任务已经做过`)
      }
    } else if (item.workType === 2) {
      // 分享任务
      if (item.workStatus === 0) {
        // share();
        const data = {"source":0,"workType":2,"opType":1};
        //开始分享
        // let shareRes = await request('doWork', data);
        let shareRes = await share(data);
        console.log(`开始分享的动作:${JSON.stringify(shareRes)}`);
        const b = {"source":0,"workType":2,"opType":2};
        // let shareResJL = await request('doWork', b);
        let shareResJL = await share(b);
        console.log(`领取分享后的奖励:${JSON.stringify(shareResJL)}`)
      } else if (item.workStatus === 2) {
        console.log(`分享任务已经做过`)
      }
    }
  }
  for (let task of taskInfo) {
    if (task.mid && task.workStatus === 0) {
      console.log('开始做浏览任务');
      // yield setUserLinkStatus(task.mid);
      let aa = await setUserLinkStatus(task.mid);
      console.log(`aaa${JSON.stringify(aa)}`);
    } else if (task.mid && task.workStatus === 1){
      console.log(`workStatus === 1开始领取浏览后的奖励:mid:${task.mid}`);
      let receiveAwardRes = await receiveAward(task.mid);
      console.log(`领取浏览任务奖励成功：${JSON.stringify(receiveAwardRes)}`)
    } else if (task.mid && task.workStatus === 2) {
      console.log('所有的浏览任务都做完了')
    }
  }
  // console.log(`浏览任务列表：：${JSON.stringify(taskInfo)}`);
  // for (let task of taskInfo) {
  //   if (task.mid && task.workStatus === 0) {
  //     await setUserLinkStatus(task.mid);
  //   } else {
  //     console.log('所有的浏览任务都做完了')
  //   }
  // }
  gen.next();
}

function harvest(userInfo) {
  // console.log(`收获的操作:${JSON.stringify(userInfo)}\n`)
  if (!userInfo.userInfo && !userInfo.userToken) return
  const data = {
    "source": 2,
    "sharePin": "",
    "userId": userInfo.userInfo,
    "userToken": userInfo.userToken
  }
  // return new Promise((rs, rj) => {
  //   request('harvest', data).then((response) => {
  //     console.log(`收获金果结果:${JSON.stringify(response)}`);
  //     rs(response)
  //     // gen.next();
  //   })
  // })
  request('harvest', data).then((harvestRes) => {
    if (harvestRes.resultCode === 0 && harvestRes.resultData.code === '200') {
      let data = harvestRes.resultData.data;
      message += `【距离${data.treeInfo.level + 1}级摇钱树还差】${data.treeInfo.progressLeft}\n`;
      fruitTotal = data.treeInfo.fruit;
      gen.next();
    }
  })
}
//卖出金果，得到金币
function sell() {
  const params = {
    "source": 2,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  params.riskDeviceParam = JSON.stringify(params.riskDeviceParam);//这一步，不可省略，否则提交会报错（和login接口一样）
  // return new Promise((rs, rj) => {
  //   request('sell', params).then(response => {
  //     rs(response);
  //   })
  // })
  request('sell', params).then((sellRes) => {
    console.log(`卖出金果结果:${JSON.stringify(sellRes)}\n`)
    gen.next();
  })
}
//获取金币和金果数量
function myWealth() {
  const params = {
    "source": 2,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  params.riskDeviceParam = JSON.stringify(params.riskDeviceParam);//这一步，不可省略，否则提交会报错（和login接口一样）
  request('myWealth', params).then(res=> {
    if (res.resultCode === 0 && res.resultData.code === '200') {
      console.log(`金币数量和金果：：${JSON.stringify(res)}`);
      message += `【我的金果数量】${res.resultData.data.gaAmount}\n`;
      message += `【我的金币数量】${res.resultData.data.gcAmount}\n`;
      gen.next();
    }
  })
}
function sign() {
  console.log('开始三餐签到')
  const data = {"source":2,"workType":1,"opType":2};
  return new Promise((rs, rj) => {
    request('doWork', data).then(response => {
      rs(response);
    })
  })
}
function signIndex() {
  const params = {
    "source":0,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  return new Promise((rs, rj) => {
    request('signIndex', params).then(response => {
      rs(response);
    })
  })
}
async function signEveryDay() {
  let signIndexRes = await signIndex();
  console.log(`每日签到条件查询:${JSON.stringify(signIndexRes)}`);
  if (signIndexRes.resultCode === 0) {
    if (signIndexRes.resultData && signIndexRes.resultData.data.canSign == 2) {
      console.log('准备每日签到')
      let signOneRes = await signOne(signIndexRes.resultData.data.signDay);
      console.log(`第${signIndexRes.resultData.data.signDay}日签到结果:${JSON.stringify(signOneRes)}`);
      if (signIndexRes.resultData.data.signDay === 7) {
        let getSignAwardRes = await getSignAward();
        console.log(`店铺券（49-10）领取结果：${JSON.stringify(getSignAwardRes)}`)
        if (getSignAwardRes.resultCode === 0 && getSignAwardRes.data.code === 0) {
          message += `【7日签到奖励领取】${getSignAwardRes.datamessage}\n`
        }
      }
    } else {
      console.log('走了signOne的else')
    }
  }
  gen.next();
}
function signOne(signDay) {
  const params = {
    "source":0,
    "signDay": signDay,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  return new Promise((rs, rj) => {
    request('signOne', params).then(response => {
      rs(response);
    })
  })
}
// 领取七日签到后的奖励(店铺优惠券)
function getSignAward() {
  const params = {
    "source":2,
    "awardType": 2,
    "deviceRiskParam": 1,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  return new Promise((rs, rj) => {
    request('getSignAward', params).then(response => {
      rs(response);
    })
  })
}
// 浏览任务
async function setUserLinkStatus(missionId) {
  let resultCode = 0, code = 200, index = 0;
  do {
    const params = {
      "missionId": missionId,
      "pushStatus": 1,
      "keyValue": index,
      "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
    }
    let response = await request('setUserLinkStatus', params)
    console.log(`missionId为${missionId}：：第${index + 1}次浏览活动完成: ${JSON.stringify(response)}`);
    resultCode = response.resultCode;
    code = response.resultData.code;
    // if (resultCode === 0) {
    //   let sportRevardResult = await getSportReward();
    //   console.log(`领取遛狗奖励完成: ${JSON.stringify(sportRevardResult)}`);
    // }
    index++;
  } while (index < 7) //不知道结束的条件，目前写死循环7次吧
  console.log('浏览店铺任务结束');
  console.log('开始领取浏览后的奖励');
  let receiveAwardRes = await receiveAward(missionId);
  console.log(`领取浏览任务奖励成功：${JSON.stringify(receiveAwardRes)}`)
  return new Promise((resolve, reject) => {
    resolve(receiveAwardRes);
  })
  // gen.next();
}
// 领取浏览后的奖励
function receiveAward(mid) {
  if (!mid) return
  mid = mid + "";
  const params = {
    "source":0,
    "workType": 7,
    "opType": 2,
    "mid": mid,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  return new Promise((rs, rj) => {
    request('doWork', params).then(response => {
      rs(response);
    })
  })
}
function share(data) {
  if (data.opType === 1) {
    console.log(`开始做分享任务\n`)
  } else {
    console.log(`开始做领取分享后的奖励\n`)
  }
  return new Promise((rs, rj) => {
    request('doWork', data).then(response => {
      rs(response);
    })
  })
  // const data = 'reqData={"source":0,"workType":2,"opType":1}';
  // request('doWork', data).then(res => {
  //   console.log(`分享111:${JSON.stringify(res)}`)
  //   setTimeout(() => {
  //     const data2 = 'reqData={"source":0,"workType":2,"opType":2}';
  //     request('doWork', data2).then(res => {
  //       console.log(`分享222:${JSON.stringify(res)}`)
  //     })
  //   }, 2000)
  // })
  // await sleep(3);
}
function msgControl() {
  console.log('控制弹窗');
  console.log(treeMsgTime);
  // console.log(typeof (treeMsgTime));
  treeMsgTime++;
  // console.log(treeMsgTime);
  $.setdata(`${treeMsgTime}`, 'treeMsgTime');
  console.log(`${$.getdata('treeMsgTime')}`);
  // console.log(`${typeof (Number($hammer.read('treeMsgTime')))}`)
  // console.log(`${($hammer.read('treeMsgTime') * 1) === Notice}`)
  // if (($.getdata('treeMsgTime') * 1) === Notice) {
  //   $.msg(name, subTitle, message);
  //   $.setdata('0', 'treeMsgTime');
  // }
  // gen.next()
}

async function request(function_id, body = {}) {
  await $.wait(1000); //歇口气儿, 不然会报操作频繁
  return new Promise((resolve, reject) => {
    $.post(taskurl(function_id,body), (err, resp, data) => {
      if (err) {
        console.log("=== request error -s--");
        console.log("=== request error -e--");
      } else {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.log(e)
        } finally {
          resolve(data)
        }
      }
    })
  })
}

function taskurl(function_id, body) {
  return {
    url: JD_API_HOST + '/' + function_id + '?_=' + new Date().getTime()*1000,
    body: `reqData=${function_id === 'harvest' || function_id === 'login' || function_id === 'signIndex' || function_id === 'signOne' || function_id === 'setUserLinkStatus' || function_id === 'dayWork' || function_id === 'getSignAward' || function_id === 'sell' ? encodeURIComponent(JSON.stringify(body)) : JSON.stringify(body)}`,
    headers: {
      'Accept' : `application/json`,
      'Origin' : `https://uua.jr.jd.com`,
      'Accept-Encoding' : `gzip, deflate, br`,
      'Cookie' : cookie,
      'Content-Type' : `application/x-www-form-urlencoded;charset=UTF-8`,
      'Host' : `ms.jr.jd.com`,
      'Connection' : `keep-alive`,
      'User-Agent' : `jdapp;iPhone;9.0.0;13.4.1;e35caf0a69be42084e3c97eef56c3af7b0262d01;network/4g;ADID/F75E8AED-CB48-4EAC-A213-E8CE4018F214;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/1;model/iPhone11,8;addressid/2005183373;hasOCPay/0;appBuild/167237;supportBestPay/0;jdSupportDarkMode/0;pv/1287.19;apprpd/MyJD_GameMain;ref/https%3A%2F%2Fuua.jr.jd.com%2Fuc-fe-wxgrowing%2Fmoneytree%2Findex%2F%3Fchannel%3Dyxhd%26lng%3D113.325843%26lat%3D23.204628%26sid%3D2d98e88cf7d182f60d533476c2ce777w%26un_area%3D19_1601_50258_51885;psq/1;ads/;psn/e35caf0a69be42084e3c97eef56c3af7b0262d01|3485;jdv/0|kong|t_1000170135|tuiguang|notset|1593059927172|1593059927;adk/;app_device/IOS;pap/JA2015_311210|9.0.0|IOS 13.4.1;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      'Referer' : `https://uua.jr.jd.com/uc-fe-wxgrowing/moneytree/index/?channel=yxhd&lng=113.325896&lat=23.204600&sid=2d98e88cf7d182f60d533476c2ce777w&un_area=19_1601_50258_51885`,
      'Accept-Language' : `zh-cn`
    }
  }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}