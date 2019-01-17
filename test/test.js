import viteBridge from "../src";
const methods = ['appToken', 'appChannel', 'goLoginVC', 'goToshare', 'sendTranscation', 'fetchViteAddress'];
const sub = ['appStatus']
const bridge = new viteBridge(() => {
    console.log('success-------ready 回调');
}, methods);


function insertTpl(testKey) {
    const template = `<div class="tpl card ${testKey}">
        <div class="title badge badge-secondary" style="height:30px;margin:10px auto;">test for ${ testKey} </div>
        <div class="content" style="height:30px;margin:10px auto;border:1px solid #000;width:90%;"></div>
        <button class="btn btn-primary" type="button" style="height:30px;margin:10px auto;">test</button>
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
        bridge[m](arg).then(res => {
            console.log(`${m} response success!!!!${JSON.stringify(res)}`)
            contentEl.textContent = JSON.stringify(res);
        }, rej => {
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