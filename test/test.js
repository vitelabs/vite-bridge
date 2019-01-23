import viteBridge from "../src";
const methods = ['bridge.version','app.info', 'app.language', 'app.setWebTitle', 'app.share', 'wallet.currentAddress', 'wallet.sendTxByURI'];
const sub = ['appStatus']
const bridge = new viteBridge({
    readyCallback: () => {
        console.log('success-------ready 回调');
    }, selfDefinedMethods: methods
});
bridge["bridge.version"]()
bridge["app.info"]()
bridge["app.setWebTitle"]({title:"dfadfa"})
const mockThis = { info: "i am mock 'thissss'" };


function insertTpl(testKey) {
    const template = `<div class="tpl card ${testKey}">
        <div class="container badge badge-secondary" style="height:30px;margin:10px auto; align="left">test for ${ testKey} </div>
        <div class="content" style="height:100px;margin:10px auto;border:1px solid #000;width:90%;"></div>
        <button class="btn btn-secondary" type="button" style="height:30px;margin:10px auto;">call</button>
    </div>`
    $("#app").append(template)
}
function attachClickEvent(testKey, clickEvent) {
    const ele = document.getElementsByClassName(testKey)[0];
    const contentEl = ele.getElementsByClassName("content")[0];
    const button = ele.getElementsByClassName('btn')[0]
    button.addEventListener("click", () => {
        console.log(`trigger ${testKey}'s click event`);
        clickEvent(contentEl);
    })
}

function attachSub(testKey, content) {
    const ele = document.getElementsByClassName(testKey)[0];
    const contentEl = ele.getElementsByClassName("content")[0];
    contentEl.textContent = content;
}
methods.forEach(m => {
    insertTpl(m);
    let arg = undefined;
    if (m === 'app.share') {
        arg = { url: "https://baidu.com" }
    }
    if (m === 'wallet.currentAddress') {
        arg = { data: "vite" }
    }
    if (m === 'app.setWebTitle') {
        arg = { title: "ddddsetWebTitlesetWebTitlesetWebTitled" }
    }
    if(m==='wallet.sendTxByURI'){
        arg={uri:"vite:vite_d9ab2af338a40d532442c883a2c7a54068064f6a58252beabb/?tti=tti_5649544520544f4b454e6e40&amount=1&data="}
    }
    attachClickEvent(m, (contentEl) => {
        const success = function (res) {
            console.log(`${m} response success!!!!${JSON.stringify(res)}`)
            console.log('test this context', this)
            contentEl.textContent = JSON.stringify(res);
        }
        bridge[m](arg).then(success.bind(mockThis), rej => {
            console.log(`${m} response fail!!!!${rej}`);
            contentEl.textContent = JSON.stringify(rej);
        })
    })
})
sub.forEach(s => {
    insertTpl(s);
    bridge.subscribe(s, function (reponse) {
        console.log('ffff')
        attachSub(m, `${m} event has triggerd,reponse is \n ${JSON.stringify(reponse)}`)
    })
})