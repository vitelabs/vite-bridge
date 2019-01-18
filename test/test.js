import viteBridge from "../src";
const methods = ['bridge.version','app.info', 'app.language', 'app.setWebTitle', 'app.share', 'wallet.currentAddress', 'wallet.sendTxByURI'];
const sub = ['appStatus']
const bridge = new viteBridge({
    readyCallback: () => {
        console.log('success-------ready 回调');
    }, selfDefinedMethods: methods
});
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
    if (m === 'goToshare') {
        arg = { url: "https://baidu.com" }
    }
    if (m === 'sendTranscation') {
        arg = {
            "token": '{"tokenId":"tti_5649544520544f4b454e6e40","tokenName":"Vite Token","tokenSymbol":"VITE","decimals":18}',
            "toAddress": 'vite_53c1c34fe05835ac0becb0c4c6e0aaf67c356a935bc9a7d286',
            "amount": "100",
            "note": "test"
        }
    }
    if (m === 'fetchViteAddress') {
        arg = { data: "vite" }
    }
    if (m === 'setWebTitle') {
        arg = { title: "ddddd" }
    }
    attachClickEvent(m, (contentEl) => {
        const success = function (res) {
            console.log(`${m} response success!!!!${JSON.stringify(res)}`)
            console.log('test this context', this)
            contentEl.textContent = JSON.stringify(res);
        }
        bridge[m](arg).then(success.bind(mockThis), rej => {
            console.log(`${m} response fail!!!!${rej}`)
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