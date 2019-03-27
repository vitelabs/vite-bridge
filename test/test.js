import viteBridge from "../src";
const methods = ['bridge.version','app.info', 'app.language', 'app.setWebTitle', 'app.share', 'wallet.currentAddress', 'wallet.sendTxByURI','pri.encryption','app.setRRButton'];
const sub = ['shakeGesture','nav.RRBtnClick']
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
    contentEl.textContent = contentEl.textContent+content;
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
    if(m==='pri.encryption'){
        arg={uri:"smt","test":"ffff"}
    }
    if(m==='app.setRRButton'){
        arg={img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAAAXNSR0IArs4c6QAABRlJREFUeAHtnMtrU0EUxk8e3fhsC9qatmnq+4lFhW6EggtR3CuI6MK/y4UiBd2L4kIQdCGoWHw/m6ZpbC209VFFm+T6fdOJRHPbq1WSEzknnNzcme8kc3+duZN7cqciZkbACBgBI2AEjIARMAJGwAgYASNgBIyAETACRsAIGAEjoIZAEAQxupoGLdEQtY0EwBVo93H4YXiXP4ZxbK/DL8disc++zDZRBACzH34bXoQHZe98DWMZ6/qj3qcR9ep6KEDtA4gL8F0Tk1MyMpqX6ZlZx6a9rVX6eruls2Md9x/DT6On3neVSp5UAQXM1eByA37gwcMn8uJVVorFosTjcYerXC5LMpmUrZsz0r9nJ8vuwg8B6kcnUPC00FIFDfFNOIHtgcLEOwezVCpJIpEQAHPO1ywjaGqohTNGjWkDeoxkstkxma/qmdW02FtZR403F1PZafRWDVAM9yRgpOeLJZmefS8JP8zDALGOGmoZ42PDpHUvUwMUR87zeSwQPIIgEgQ1fFTiIgPqJFADFOfJeRzzVAsmnTWrVwknoMWMddRQyxgfu5i8ruVqgPqjvsJu2pdJSyKZCO2p7Jmso4Za2JWFjY5nbUAvAsvTdPcGyaS73UmAs7ob3gDJ16TIOmqohTNGjfk/spr2EB5n7XPwjmcv30hurCBzcwtXmStXrpB0T0q2b9nIBk/Cz2K4q+qhbJg6A9RB+BN4UCqXg7nPX5zztTfWDaprOBqkrodWIAEYry9Pw4/CU768gO1V+AX0zClfZps/JQC4q+h/Gmd6I2AEmpIAhnuS3gyN1zwprQXAk/Aj8OqM/TXsD2FSeo+t2e8QQG8cgN+HO/v6bT6gVxnrBn7nveqtUddDPajzALFtvDAh2dy4zCCzRGtrXYurpC7pSnVy9zn8DHrqHe5oMVVAAZPD/CZ8770Hj+TVm1F3uVmdsWeSefPGXtnfv5sMh+GDmoa/tmt5njP35guT8npkFBknJEJ+ydizjHXUUAtnjBrTBvQIM5yjubxLHsfjtQOIZUwsU+Ozppy01JgaoBjuLaDSUwSsmdnZyIw9NdQyxseqgKoGqAoa/6ARaoBiYmHGfiyJ5HFba6sgs7To4bGOGmoZ42MX1dezQg1Qf9DXeNbsRQK5BbA4Af1qLGMdNf4Myy/6akwb0CGQGe5Odcimvl7c4BBzX5twjnRZe2bsWcY6aqiFM0aN1U6jDW4a4PEK6Dy8Kb/YNxhf+McTKtwuPcPxLK8UQC05sjx00VGA2zTpu+ijMYURMAIRBDDkm+ZHOnVfmypsAdF+Rq7A+NstYA7C7UaHvwXJeIBs6ltxVA15wGwH01vwHXfuDWPBwpiUS+Wf7rGPJ+JYuNAjA/uZW3Y3ix1EcmSaOxpM27X8KUDZkcu/xW9JeXRXqcnYs4x11FALZ4wa0wb0GPNLI9mclJA8Rs+rAcUy1lHjc1F2j30NJRRguDNjv44LEj58/PRjmIdp+aMdNdQyxseGSetepqmHssNhQefCEpooEuypfDDGe1RIXerVAAUgdrcck8ft+P09KmNPDbWM8bF1ARb1IWqA+oa6u5EzmR7ASoYuXOCCBdZRUx1T2Wn0VhvQSwByN9W53i0/rKycwznyR8aeZVyaSA21cMaosdpptMFNA7ymXjzbYHzhHw+otrw7HM3ySwHV/gHB8vEtHQm4TfMvMpY+Eqs1AkbACBgBI2AEjIARMAJGwAgYASNgBIyAETACRsAI/D8EvgNMqMUUyUyMNAAAAABJRU5ErkJggg=="}
    }
    if(m==='app.setRRButton'){
        arg={title: "dfsasdfafasdfasfasfa"}
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
        attachSub(s, `${s} event has triggerd,reponse is \n ${JSON.stringify(reponse)}`)
    })
})