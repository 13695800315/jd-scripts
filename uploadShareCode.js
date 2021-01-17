/*
上传分享码
此文件为Node.js专用。其他用户请忽略
*/
//东东农场 farm
let fruitShareCodes = ['1e8a0f8a455a45e1934b4c4864dbbcb1', 'c13196155af9403480283c6ae9749e54', '12c19c6108f040e5b6ef5f4e84635e0f', 'd367892546164761a52fca77c0a7ee2a', '9c9b8837f74d458299ae30f9ef775e42','5be5077ed752417dae239746664dfc8f'];
//东东工厂 ddfactory
let jdfactoryShareCods = ['P04z54XCjVWnYaS5n1RWT-rhSkU-iEooQ', 'P04z54XCjVWnYaS5m9cZ2Ws2i0bnN5PfNWNqmI', 'P04z54XCjVWnYaS5m9cZ2b52n1CxJoW3sP78H0', 'P04z54XCjVWnYaS5jEMDmT-2nlClt4WYO8TeNY', 'P04z54XCjVWnYaS5lDRodwvedOdP80'];
//东东萌宠 pet
let petShareCodes = ['MTE1NDUyMjEwMDAwMDAwMzY1MzM0NTE=', 'MTE1NDQ5MzYwMDAwMDAwMzY2Mzk2OTM=', 'MTE1NDQ5OTUwMDAwMDAwNDE4NDcyOTU=', 'MTAxODc2NTEzMjAwMDAwMDAyNjA0MzE5OQ=='];
//种豆得豆 bean
let plantBeanShareCodes = ['lhubofhlunfauk4ys646do6xdu5ac3f4ijdgqji', 'mlrdw3aw26j3whvc2wvzisch2ivzpctslsnck7i', 'olmijoxgmjutya6efkgamslxhyr6nvfhcpeuxbi', 'kazw7gh56wsircopyjpmb2csjrkizbe34qnfs6a', 'nb2abag2lj2geajba5pi4ngnvy','fn5sjpg5zdejm37z7rqjd22j5fzrinzdvcb7ydi'];
//京喜工厂 jxfactory
let dreamFactoryCodes = ['PC-yzyURlilMIiB2ftCAVw==', '2Ulj8cF7fqhTpQZy8nPu3Q==', '06bkoYiowVmQwdjcUntrpw==', 'H85I9QzT1i5k05O0BBE-XQ==', 'H_5Axz_akmiKpR1mty427w==','t2cdKwg2QPBzAqd5KMCNHg=='];
//领现金 jdcash
let cashCodes = ['a0JmM7_qM6JJtzeV', 'eU9Yabi1N60voj-AnXASgw', 'eU9Yau21Z_R39j_RnSdG0w'];
//疯狂的Joy jdcrazyjoy
let crazyJoyCodes = ['p6ds_iLSw23EDt21SPsDpA==', 'QrAI7deSXLS6wERHyLtoPat9zd5YaBeE', '1_cC2bMxdF26kSXQwavO86t9zd5YaBeE'];


const shareCodeArr = [{
    url: 'http://jd.turinglabs.net/api/v2/jd/farm/create/sharecode/',
    name: '东东农场',
    shareCode: fruitShareCodes
}, {
    url: 'http://jd.turinglabs.net/api/v2/jd/ddfactory/create/sharecode/',
    name: '东东工厂',
    shareCode: jdfactoryShareCods
}, {
    url: 'http://jd.turinglabs.net/api/v2/jd/pet/create/sharecode/',
    name: '东东萌宠',
    shareCode: petShareCodes
}, {
    url: 'http://jd.turinglabs.net/api/v2/jd/bean/create/sharecode/',
    name: '种豆得豆',
    shareCode: plantBeanShareCodes
}, {
    url: 'http://jd.turinglabs.net/api/v2/jd/jxfactory/create/sharecode/',
    name: '京喜工厂',
    shareCode: dreamFactoryCodes
}, {
    url: 'https://code.chiang.fun/api/v1/jd/jdcash/create/sharecode/',
    name: '领现金',
    shareCode: cashCodes
}, {
    url: 'https://code.chiang.fun/api/v1/jd/jdcrazyjoy/create/sharecode/',
    name: '疯狂的joy',
    shareCode: crazyJoyCodes
}];

const $ = new Env('上传分享码');
const notify = $.isNode() ? require('./sendNotify') : '';
var statistic = { total: 0, success: 0, fail: 0, exist: 0, noRes: 0, codeErr: 0, errCollection: [] }

!(async () => {
    $.msg($.name, '上传活动分享码到互助池中');
    await uploadShareCode();
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })


async function uploadShareCode() {
    if ($.isNode()) {
        for (let i = 0; i < shareCodeArr.length; i++) {
            const el = shareCodeArr[i];
            for (let j = 0; j < el.shareCode.length; j++) {
                const ele = el.shareCode[j];
                if (ele) {
                    const res = await taskUrl(el.url.replace('sharecode', ele));
                    //await statistics(res, el.name, ele)
                    if (res) {
                        $.log(`⭕【${el.name}】分享码【${ele}】上传结果：${JSON.stringify(res)}\n`);
                    } else {
                        $.log(`❌【${el.name}】分享码【${ele}】上传失败。result:${JSON.stringify(res)}\n`);
                    }
                }
            }
        }
        //await notify.sendNotify(`上传互助码`, JSON.stringify(statistic));

    }
}

async function taskUrl(url) {
    return new Promise(resolve => {
        $.get({ url: url, timeout: 10000 }, (err, resp, data) => {            
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                    }
                }
            } catch (e) {
                console.log(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function statistics(res, name, code) {
    statistic.total++;
    if (res) {
        if (res.code === 200) {
            statistic.success++;
        } else if (res.code === 400) {
            if (res.message.indexOf('existed') != -1) {
                statistic.exist++;
            } else if (res.message == 'code error') {
                statistic.codeErr++;
            }
            else {
                statistic.fail++;
            }
            if (statistic.errCollection.indexOf(res.message) == -1) {
                statistic.errCollection.push(res.message)
            }
        }
    } else {
        statistic.noRes++;
    }
}

function Env(t, s) { return new class { constructor(t, s) { this.name = t, this.data = null, this.dataFile = "box.dat", this.logs = [], this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, s), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } getScript(t) { return new Promise(s => { $.get({ url: t }, (t, e, i) => s(i)) }) } runScript(t, s) { return new Promise(e => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); o = o ? 1 * o : 20, o = s && s.timeout ? s.timeout : o; const [h, a] = i.split("@"), r = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": h, Accept: "*/*" } }; $.post(r, (t, s, i) => e(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (o = Object(o)[t], void 0 === o) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}, t)[s[s.length - 1]] = e, t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? "null" === h ? null : h || "{}" : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), e = this.setval(JSON.stringify(s), i) } catch (s) { const h = {}; this.lodash_set(h, o, t), e = this.setval(JSON.stringify(h), i) } } else e = $.setval(t, s); return e } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, s) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : this.isNode() ? (this.data = this.loaddata(), this.data[s] = t, this.writedata(), !0) : this.data && this.data[s] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, s = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, e, i) => { !t && e && (e.body = i, e.statusCode = e.status), s(t, e, i) }) : this.isQuanX() ? $task.fetch(t).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, s) => { try { const e = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(e, null), s.cookieJar = this.ckjar } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t))) } post(t, s = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) $httpClient.post(t, (t, e, i) => { !t && e && (e.body = i, e.statusCode = e.status), s(t, e, i) }); else if (this.isQuanX()) t.method = "POST", $task.fetch(t).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: e, ...i } = t; this.got.post(e, i).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)) } } time(t) { let s = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = t => !t || !this.isLoon() && this.isSurge() ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o)), this.logs.push("", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="), this.logs.push(s), e && this.logs.push(e), i && this.logs.push(i) } log(...t) { t.length > 0 ? this.logs = [...this.logs, ...t] : console.log(this.logs.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? $.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : $.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(s => setTimeout(s, t)) } done(t = {}) { const s = (new Date).getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, s) }
