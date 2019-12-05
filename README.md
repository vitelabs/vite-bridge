# Vite Javascript Bridge

A javascript bridge between native & web, can be used in web page in [Vite App](http://vite.org/products#wallet).


v2.0.x require Vite App version **3.2.0** and above.

## Quick start
```js
import Bridge from '@vite/bridge'

const bridge = new Bridge()

bridge['wallet.currentAddress']().then(address => {
    console.log(`current address is ${address}`)
})
```


## Installation

With bundler, like: webpack, rollup.
```sh
# use npm
npm install @vite/bridge --save

# use yarn
yarn add @vite/bridge
```

Or you can include `dist/bridge.js` in HTML.
```html
<script src="/path/to/bridge.js"></script>
```

## Usage
```js
import Bridge from '@vite/bridge'

const bridge = new Bridge()

bridge['bridge.version']().then(data => {
    console.log(data)
})
```

If you include bridge.js in your HTML, Usage refer following code:
```html
<script>
    const bridge = new ViteBridge();
</script>
```

### Constructor options

Bridge constructor can receive options, which is very different between version 2.0.x and version 1.x

#### 2.0.x

You can pass in a function, will be invoked after bridge inited.
```js
const bridge = new Bridge(bridge => {
    // will be invoked after bridge inited
})
```

#### 1.x

You can pass in an options object.

- options.readyCallback

A function will be invoked after bridge inited

- options.selfDefinedMethods

A string array, each string is a method name which has been supported by Vite App, but not in ViteBridge internal methods list. So you can extend ViteBridge these methods.

Mostly you don't need this property.

```js
const bridge = new Bridge({
    readyCallback: bridge => {},
    selfDefinedMethods: [
        // strings
    ]
})
```


### Static properties

You can use static properties like `Bridge.enabled`

| Name | Type | Description | Comment |
| --- | --- | --- | --- |
| enabled | boolean | is in vite app | **added in version 2.0.0** |
| _support | Boolean | is supported | **deprecated in version 2.0.0** |
| _inIosContainer | Boolean | is in iOS system ｜ **deprecated in version 2.0.0** |
| _inAndroidContainer | Boolean | is in Android system ｜ **deprecated in version 2.0.0** |


### Instance Methods

There are some methods on Bridge instance. Each method return a promise, so you can invoke like:
```js
bridge[methodName](params).then(res => {
    console.log(`get result from native Vite App: ${JSON.stringify(res)}`)
}, err => {
    console.error(`failed to invoke ${methodName}: ${JSON.stringify(err)}`)
})
```

Available Methods list in following table.

Input param is passed in method, and Output param is return from native Vite App.

| Method name | Input param | Output param | Description | Comment |
| -- | -- | -- | -- | -- |
| bridge.version | void | types.BridgeVersion | get js bridge version | output like: ```{ "versionName": "1.1.0", "versionCode": 2}``` |
| app.info | void | types.AppInfo | get Vite App version | output like: ```{"platform":"ios", "versionName":"1.0.0", "versionCode":1024}``` platform is `ios` or `android` |
| app.language | void | `"zh"` or `"en"` | get Operation System language |  |
| app.setWebTitle | types.SetWebTitleInput | void | set webview title | input like: ```{ "title": "Vite Cool" }``` |
| app.share | types.ShareLinkInput | void | share a link | input like: ```{ url: "https://vite.org" }``` |
| app.setRRButton | types.SetRRButtonInput | void | show an icon (size: 56px * 56px, [base64 Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)) or customized text, no more than 4 chars, in right nav button | input like ```{"img": "data:image/png;base64, xxxx"}``` or ```{"text": "Vite"}``` |
| wallet.currentAddress | void | string | get current used vite address |  |
| wallet.sendTxByURI | types.SendTxInput | types.SendTxOutput | send a tx | see following example |
| app.scan | void | types.ScanOutput | scan a QR code by camera | **new in version 2.0.0**<br>output like: ```{"text": "Vite Cool"}``` |
| call | string, ...any | any | invoke a native method | **new in version 2.0.0** |

Use `call` if bridge missing some native method. for example: Vite App add new methods, but bridge haven't update, `call` is helpful.

#### example

Set webview title.
```js
bridge['app.setWebTitle']({
    "title": "Vite Cool"
}).then(() => {
    console.log(`success`)
}, ({ code, msg, data }) => {
    console.error(`failed to set webview title: [${code}] ${msg}, native response: ${data}`)
})
```
Error detail will be described in following section, just ignore for now.


Send a transaction by Vite Bridge.

The uri should be a [Vite URI](https://vite.wiki/vep/vep-6.html), can be generated by [@vite/vitejs](https://vite.wiki/api/vitejs/tool/utils.html#uristringify)
```js
import * as utils from "@vite/vitejs-utils";
import * as abi from "@vite/vitejs-abi";

// regular transfer
const sendTx = await bridge["wallet.sendTxByURI"]({
    address: currentWalletAddress,
    uri: utils.uriStringify({
        target_address: receiverAddress,    // receiver address
        params: {
            tti: 'tti_5649544520544f4b454e6e40',    // tokenId, usually is VITE
            amount: amount, // in VITE unit
        }
    })
})

// call contract method
const hexFunctionCall = abi.encodeFunctionCall(contractMethodABI, contractMethodParams);
const base64FunctionCall = utils._Buffer.from(hexFunctionCall, 'hex').toString('base64');
const sendTx = await bridge["wallet.sendTxByURI"]({
    address: currentWalletAddress,
    uri: utils.uriStringify({
        target_address: contractAddress,    // contract address
        function_name: contractMethodName,  // contract method name
        params: {
            tti: 'tti_5649544520544f4b454e6e40',    // tokenId
            amount: amount, // in VITE unit
            data: base64FunctionCall,
        }
    })
})
```

Call a method
```js
bridge.call('app.setWebTitle', {
    "title": "Vite Cool"
})
```

### subscribe events

Vite Bridge can subscribe following events trigged by user.

| Event name | Description |
| -- | -- |
| nav.RRBtnClick | the right button in navbar been clicked |
| page.onShow | page is show in the screen, or Vite App is switch to the frontground |
| shakeGesture | phone shaked |


#### subscribe

Subscribe an event
```js
bridge.subscribe(event_name, event_handler, once)
```
When the event trigged, the event handlers will be invoked in the order of subscribe.

The third param `once` is optional, default is false. If true, the event_handler will be invoked only once.

Example:
```js
bridge.subscribe('nav.RRBtnClick', () => {
    console.log(`navbar right button clicked`)
})

bridge.subscribe('page.onShow', () => {
    console.log(`resume animation`)
})

// you can subscribe an event multiple times, but not recommended.
bridge.subscribe('page.onShow', () => {
    console.log(`Welcome back`)
})
```

#### unsubscribe

Unsubscribe an event 
```js
bridge.unsubscribe(event_name, event_handler)
```

The second param `event_handler` is optional, if omited, bridge will unsubscribe all event_handlers on the specific event.

**caveat: the event_handler should equal with the one passed in subscribe**

Example
```js
const fn = () => {
    console.log(`Welcome back`)
}

bridge.subscribe('page.onShow', fn)

bridge.unsubscribe('page.onShow', fn)

// unsubscribe all event_handler on event page.onShow
bridge.unsubscribe('page.onShow')
```

Anonymous event_handler can't be unsubscribed
```js
bridge.subscribe('page.onShow', () => {
    console.log(`resume animation`)
})

// unsubscribe failed, because this anonymous event_handler is not the former one passed in subscribe
bridge.unsubscribe('page.onShow', () => {
    console.log(`resume animation`)
})
```

### Error

#### common error code
| Code | Description |
| --- | --- |
| 1	| unknown error |
| 2	| invalidate params	|
| 3	| network error |
| 4	| login error	|
| 5	| address in params not identical to current address |

#### wallet.sendTxByURI

`wallet.sendTxByURI` could throw following codes.

| Code | Description | Comment |
| --- | --- | --- |
| 4001 | duplicate transaction before last transaction finished | only can send next transaction after the previous one be handled |
| 4002 | cannot find related tokenId	| |
| 4003 | amount format error (should be translate to min unit)	| |
| 4004 | user suspend | |
