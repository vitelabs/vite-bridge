import viteBridge from "../src";
const methods = ['bridge.version', 'app.info', 'app.language', 'app.setWebTitle', 'app.share', 'wallet.currentAddress', 'wallet.sendTxByURI', 'pri.encryption', 'app.setRRButton','pri.open','pri.receiveAirdrop'];
const sub = ['shakeGesture', 'nav.RRBtnClick','page.onShow','app.didBecomeActive']
const bridge = new viteBridge({
    readyCallback: () => {
        console.log('success-------ready 回调');
    }, selfDefinedMethods: methods
});
bridge["bridge.version"]().then(n=>{
    console.log('call for 1')
})
bridge["app.info"]().then(n=>{
    console.log('call for 2')
})
bridge["app.setWebTitle"]({ title: "dfadfa" }).then(n=>{
    console.log('call for 3')
})
let address=null;
bridge['wallet.currentAddress']().then(data=>{
    address=data;
})
const mockThis = { info: "i am mock 'thissss'" };
const argsMap = {
    'pri.receiveAirdrop':{tokenId:'tti_5649544520544f4b454e6e40'},
    'pri.open':{url:'https://x.vite.net/walletQuota'},
    'app.share': { url: "https://baidu.com" },
    'wallet.currentAddress': { data: "vite" },
    'app.setWebTitle': { title: "ddddsetWebTitlesetWebTitlesetWebTitled" },
    'wallet.sendTxByURI': { uri: "vite:vite_67a797f249753fa07cd76b07530e7a1f96d070a8ade463ebe5?tti=tti_5649544520544f4b454e6e40&amount=1&data=" },
    'pri.encryption': { uri: "smt", "test": "ffff" },
    'app.setRRButton': { img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAABxVBMVEWorbT7/Pyqr7bW2Nv8/Pz9/f2tsrj///+prrWrsLf7+/u9wcbt7u+7v8T+/v7o6eu3u8H+//+1ub/Y2t22usDJzNCprrSusrny8/Tf4eOssbevtLr39/j19vf3+Pi0uL79/f6ssbjp6uz3+Pn9/v709PXMz9O/wsfFyM3j5Obb3uH29/ezuL7T1tr5+vq2usHEx8vQ09a5vcKtsrnm6OrN0dTS1dnFyc3g4eTw8PLe3+Pd3+Lg4uXw8fOxtbyprbTW2Nzh4uWqr7WwtLvu7vDm5+nT1tnw8vPR1NjV19v4+fnKzdHR09e4vcLX2t3f4eTDxsvS1djb3eD4+Pni5Oa6vsTN0dXz9PTh4+arr7aytr3Gys+7wMTHy8/LztLCxcvM0NOzuL22u8DEx8ytsbjq6+z19fbBxcrr7e+4vML29veus7nDxszp6+zv8PLBxcn8/P3BxMni4+a+wca7v8XY2t61usDV2Nzc3uHCxsv6+vuxtrzGyc69wcfz8/TAxMnW2du5vMG/w8nc3uDAw8nS1Nja3N/t7/C5vMPe4ePu7/C5vMLN0NTU1try8vO8wMbY297P0tXx8fPQ09fEyM3n6Onn6OpLAguRAAACSElEQVR4AWJgJxKgKgT0UQ5csnNBAKzhTcbm2rZt297PfLZt+/e+LJLJXdVhV1dw1K6llWWnVVGszuWVJdepYftkPibyJ9tPDLNbFWRQWrOPh535ADjn5hdmZxfm55wApDqPhI4ogFI2nKcv8obLFICowxz6LgI87BYS3c8A/r6UCYvOAWqHOEaHCvxeZIT1QMojTsCTBur1sCkG8QviRP6JQ6zpILTkgnJenMKfCuRa9kMbUG0s7jz/n9ivj+yGqAb69kJXGm4YfjUEAKGEbuwRSLu0MAl0GTYXAOCxT3ddwGstLIUeQ/YBl9euPAFu6c7XA6UC1zpMCZ0ImtO4BlcNOQXrLr4DBYZT4anQCEPKkAXADzRltRguAA+Exk1wGtJihTC/wIYwyLbtvz3nLtzO2A20bBu2hIzvehzwZ8QWWvYNduUuzwtwz2R2oYxNcMvhC4Co2bjRsh0IyeE7eOuRTAgts4HqkPR7CEvCoYKNcuCl5IvCn4KSeANatqjAuDiTcVAKEa8gIPnVj+5iSQRgWiBmAL/Zf4av5tkPzGjhhApu809FocQ0Bt2gTmihaAaSps0alJvGJNAs9sKcRnAmTKsvH0xD4g9ozNkPRQVQ+5c4kcVaoEIchME6YLrypK7yX6AuqB+AmgagynO881QBDTWZ2/Pfb4B1zCJnljErEMoyX7NCL8CgTZM6WbZBAG+hfB/tJb0AA+6R/tHi4tH+kfsDAL0l9mMX1x/hGBH/STfc0RZAItDmEHJoMNTiVQFA9bYMSauffZJeCkWgRZ4AAAAASUVORK5CYII=" }

}
function insertTpl(testKey, isSub) {
    const template = `<div class="tpl card ${testKey.toLowerCase().replace('.', '-')}">
        <div class="container badge badge-secondary title" style="height:30px;margin:10px auto; align="left">test for ${ testKey} </div>
        ${isSub ? '' : '<textarea type=text class="ipt"></textarea>'}
        <div class="content" style="height:100px;margin:10px auto;border:1px solid #000;width:90%;"></div>
        ${isSub ? '' : '<button class="btn btn-secondary" type="button" style="margin:10px auto;">call</button>'}
    </div>`
    $("#app").append(template)
}
function attachClickEvent(testKey, clickEvent) {
    const ele = document.getElementsByClassName(testKey.toLowerCase().replace('.', '-'))[0];
    const contentEl = ele.getElementsByClassName("content")[0];
    const button = ele.getElementsByClassName('btn')[0]
    const inputEl = ele.getElementsByClassName('ipt')[0]

    button.addEventListener("click", () => {
        console.log(`trigger ${testKey}'s click event`);
        clickEvent(contentEl, inputEl);
    })
}

function attachSub(testKey, content) {
    const ele = document.getElementsByClassName(testKey.toLowerCase().replace('.', '-'))[0];
    const contentEl = ele.getElementsByClassName("content")[0];
    contentEl.textContent = contentEl.textContent + content;
}
methods.forEach(m => {
    insertTpl(m);
    let arg = argsMap[m];
    attachClickEvent(m, (contentEl, inputEl) => {
        try {
            arg = inputEl.value.trim() ? JSON.parse(inputEl.value.trim()) : arg
        } catch (e) {
            contentEl.textContent(JSON.stringify(e.message))
        }
        
        if(m==='wallet.sendTxByURI'){arg=Object.assign({address},arg||{})};
        if(!arg.address){contentEl.textContent('missing address params')};
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
    insertTpl(s, true);
    bridge.subscribe(s, function (reponse) {
        console.log('ffff')
        attachSub(s, `${s} event has triggerd,reponse is \n ${JSON.stringify(reponse)}`)
    })
})