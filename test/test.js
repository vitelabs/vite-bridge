document.getElementById('agent').innerHTML = navigator.userAgent
document.getElementById('lang').innerHTML = navigator.language

import * as viteUtils from "@vite/vitejs-utils";
import * as viteABI from "@vite/vitejs-abi";
import viteBridge from "../src";
const methods = {
  "bridge.version": {
    params: false,
    autorun: true,
  },
  "app.info": {
    params: false,
    autorun: true,
  },
  "app.language": {
    params: false,
    autorun: true,
  },
  "app.setWebTitle": {
    params: {
      title: "vite"
    },
    autorun: true,
  },
  "app.share": {
    params: {
      url: "https://baidu.com"
    },
    autorun: false,
  },
  "app.scan": {
    params: false,
    autorun: false,
  },
  "wallet.currentAddress": {
    params: {
      data: "vite"
    },
    autorun: true,
  },
  "wallet.sendTxByURI": {
    params: {
      uri: "vite:vite_67a797f249753fa07cd76b07530e7a1f96d070a8ade463ebe5?tti=tti_5649544520544f4b454e6e40&amount=1&data="
    },
    autorun: false,
  },
  "pri.encryption": {
    params: {
      uri: "smt",
      test: "ffff"
    },
    autorun: true,
  },
  "app.setRRButton": {
    params: {
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAABxVBMVEWorbT7/Pyqr7bW2Nv8/Pz9/f2tsrj///+prrWrsLf7+/u9wcbt7u+7v8T+/v7o6eu3u8H+//+1ub/Y2t22usDJzNCprrSusrny8/Tf4eOssbevtLr39/j19vf3+Pi0uL79/f6ssbjp6uz3+Pn9/v709PXMz9O/wsfFyM3j5Obb3uH29/ezuL7T1tr5+vq2usHEx8vQ09a5vcKtsrnm6OrN0dTS1dnFyc3g4eTw8PLe3+Pd3+Lg4uXw8fOxtbyprbTW2Nzh4uWqr7WwtLvu7vDm5+nT1tnw8vPR1NjV19v4+fnKzdHR09e4vcLX2t3f4eTDxsvS1djb3eD4+Pni5Oa6vsTN0dXz9PTh4+arr7aytr3Gys+7wMTHy8/LztLCxcvM0NOzuL22u8DEx8ytsbjq6+z19fbBxcrr7e+4vML29veus7nDxszp6+zv8PLBxcn8/P3BxMni4+a+wca7v8XY2t61usDV2Nzc3uHCxsv6+vuxtrzGyc69wcfz8/TAxMnW2du5vMG/w8nc3uDAw8nS1Nja3N/t7/C5vMPe4ePu7/C5vMLN0NTU1try8vO8wMbY297P0tXx8fPQ09fEyM3n6Onn6OpLAguRAAACSElEQVR4AWJgJxKgKgT0UQ5csnNBAKzhTcbm2rZt297PfLZt+/e+LJLJXdVhV1dw1K6llWWnVVGszuWVJdepYftkPibyJ9tPDLNbFWRQWrOPh535ADjn5hdmZxfm55wApDqPhI4ogFI2nKcv8obLFICowxz6LgI87BYS3c8A/r6UCYvOAWqHOEaHCvxeZIT1QMojTsCTBur1sCkG8QviRP6JQ6zpILTkgnJenMKfCuRa9kMbUG0s7jz/n9ivj+yGqAb69kJXGm4YfjUEAKGEbuwRSLu0MAl0GTYXAOCxT3ddwGstLIUeQ/YBl9euPAFu6c7XA6UC1zpMCZ0ImtO4BlcNOQXrLr4DBYZT4anQCEPKkAXADzRltRguAA+Exk1wGtJihTC/wIYwyLbtvz3nLtzO2A20bBu2hIzvehzwZ8QWWvYNduUuzwtwz2R2oYxNcMvhC4Co2bjRsh0IyeE7eOuRTAgts4HqkPR7CEvCoYKNcuCl5IvCn4KSeANatqjAuDiTcVAKEa8gIPnVj+5iSQRgWiBmAL/Zf4av5tkPzGjhhApu809FocQ0Bt2gTmihaAaSps0alJvGJNAs9sKcRnAmTKsvH0xD4g9ozNkPRQVQ+5c4kcVaoEIchME6YLrypK7yX6AuqB+AmgagynO881QBDTWZ2/Pfb4B1zCJnljErEMoyX7NCL8CgTZM6WbZBAG+hfB/tJb0AA+6R/tHi4tH+kfsDAL0l9mMX1x/hGBH/STfc0RZAItDmEHJoMNTiVQFA9bYMSauffZJeCkWgRZ4AAAAASUVORK5CYII="
    },
    autorun: true,
  },
  "pri.open": {
    params: {
      url: "https://x.vite.net/walletQuota"
    },
    autorun: false,
  },
  "pri.receiveAirdrop": {
    params: {
      tokenId: "tti_5649544520544f4b454e6e40"
    },
    autorun: false,
  },
  "pri.saveVitexInviteCode": {
    params: {
      code: "23456"
    }
  },
  "pri.readVitexInviteCode": {
    params: false,
    autorun: true,
  }
}
const sub = [
  "shakeGesture",
  "nav.RRBtnClick",
  "page.onShow",
  "app.didBecomeActive"
];
const bridge = new viteBridge({
  readyCallback: () => {
    console.log("success-------ready 回调");
  },
  selfDefinedMethods: Object.keys(methods)
});

let address = null;
bridge["wallet.currentAddress"]().then(data => {
  address = data;
});

const mockThis = {
  info: "i am mock 'thissss'"
};

function marshalMethodName(methodName) {
  return methodName.toLowerCase().replace(".", "-")
}

const app = document.getElementById('app')

function insertTpl(name, params, autorun) {
  const tpl = document.createElement('div')
  tpl.classList.add('tpl')
  tpl.classList.add(marshalMethodName(name))

  const title = name ? `<h4>${name}</h4>` : '<input>'
  const param = params ? `<textarea class="param" rows="5">${JSON.stringify(params)}</textarea>` : ''
  tpl.innerHTML = `${title}
                  ${param}
                  <textarea class="content"></textarea>
                  ${(autorun && !params) ? '' : '<button type="button">call</button>'}`

  app.appendChild(tpl)
  return tpl;
}

function attachClickEvent(tpl, clickEvent, autorun) {
  const paramEl = tpl.querySelector('.param');
  const contentEl = tpl.querySelector(".content");

  const run = () => clickEvent(contentEl, paramEl)
  if (autorun) {
    run()
  }

  const button = tpl.querySelector("button");
  if (button) {
    button.addEventListener("click", run, false);
  }
}

function attachSub(ele, content) {
  const contentEl = ele.querySelector(".content");
  contentEl.textContent = contentEl.textContent + content;
}

for (const method in methods) {
  const config = methods[method];
  const tpl = insertTpl(method, config.params);

  attachClickEvent(tpl, (contentEl, paramEl) => {
    let arg = paramEl && paramEl.value.trim();
    try {
      arg = arg ? JSON.parse(arg) : arg;
    } catch (e) {
      contentEl.textContent = JSON.stringify(e.message);
    }

    if (method === "wallet.sendTxByURI") {
      arg = Object.assign({
        address
      }, arg || {});
      if (!arg.address) {
        contentEl.textContent("missing address");
        return;
      }
    }
    const success = function (res) {
      console.log(`${method} response success!!!!${JSON.stringify(res)}`);
      console.log("test this context", this);
      contentEl.textContent = JSON.stringify(res);
    };
    bridge[method](arg).then(success.bind(mockThis), rej => {
      console.log(`${method} response fail!!!!${rej}`);
      contentEl.textContent = JSON.stringify(rej);
    });
  }, config.autorun);
}

sub.forEach(s => {
  const ele = insertTpl(s, false);
  bridge.subscribe(s, function (reponse) {
    attachSub(
      ele,
      `${s} event has triggerd,reponse is \n ${JSON.stringify(reponse)}`
    );
  });
});

function attachAnyMethodClickEvent() {
  const ele = document.getElementById('any');
  const methodNameEl = document.getElementById('method_name')
  const inputEl = ele.querySelector(".params");
  const contentEl = ele.querySelector(".content");
  const button = ele.querySelector("button");

  button.addEventListener("click", () => {
    console.log(`trigger anyMethod's click event`);
    try {
      var methodName = methodNameEl.value.trim()
      var arg = JSON.parse(inputEl.value.trim());
    } catch (e) {
      contentEl.textContent = JSON.stringify(e.message);
    }
    const success = function (res) {
      console.log(` response success!!!!${JSON.stringify(res)}`);
      console.log("test this context", this);
      contentEl.textContent = JSON.stringify(res);
    };
    bridge.callAnyway(methodName, arg).then(success.bind(mockThis), rej => {
      console.log(` response fail!!!!${rej}`);
      contentEl.textContent = JSON.stringify(rej.message || rej);
    });
  });
}
attachAnyMethodClickEvent()

function testBug() {
  const tpl = document.getElementById('bug')
  const code = tpl.querySelector('textarea')
  const content = tpl.querySelector('.content')

  const button = tpl.querySelector('button')
  button.addEventListener('click', () => {
    bridge['pri.saveVitexInviteCode']({
      code: code.value,
    }).then(res => {
      console.log('save_code', JSON.stringify(res))
    }, err => {
      console.error('save_code', JSON.stringify(err))
    })

    const hexData = viteABI.encodeFunctionCall({
      type: "function",
      name: "BindInviteCode",
      inputs: [
        {
          name: "code",
          type: "uint32"
        }
      ]
    }, [code.value * 1]);
    const base64Data = viteUtils._Buffer
      .from(hexData, "hex")
      .toString("base64");
    bridge["pri.sendTx"]({
      block: {
        data: base64Data,
        amount: '0',
        tokenId: 'tti_5649544520544f4b454e6e40',
        toAddress: 'vite_0000000000000000000000000000000000000006e82b8ba657'
      }
    }).then(res => {
      content.textContent = JSON.stringify(res)
    }, err => {
      content.textContent = JSON.stringify(err)
    })
  }, false)
}
testBug()
