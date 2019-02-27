## A bridge between native & web  

### Quick start   

#### Installition  

Install using [npm](https://www.npmjs.org/):

```sh
npm install @vite/bridge
```

#### Hello world
```javascript
import Bridge from '@vite/brodge';
const bridge=new Bridge(options);
bridge['bridge.version']().then(
    data=>{
        console.log(data)
    }
)
//output   X.XX
```

options  
| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | contrustor arguments |
| [opts.readyCallback] | <code>Function</code> | would be called when bridge ready |
| [opts.selfDefinedMethods] | <code>String[]</code> | extend the method  which native has supported and bridge hasn't supported yet.|

#### Static properties:
 | Name | Type | Description |
 | --- | --- | --- |
 | _support | Boolean | is supported |
 | _inIosContainer | Boolean | 
 | _inAndroidContainer | Boolean |

#### Instance Methods
- A native methods shoud be called like this:
```javascript
bridge[methodname](...args)
```
Currently, bridge supports async function call only.
Each calling will return an `Promise`,which resolve with the function data or reject whith object:
```javascript
{ 
  code:0,// error code 
  msg:"",// error msg
  data:""// fucntion returned data 
}

```
- or use `ubscribe/unSubscribe` to receive/unreceive event from native
```javascript 
bridge.subscribe(eventName, cb)
bridge.unSubscribe(eventName, cb)
```
 | Params | Type | Description |
 | --- | --- | --- |
 | eventName | String |  |
 | cb | Function | event handler| 

#### Detail method and event can be found here:
error code :
1	未知错误
2	无效参数	
3	网络错误	
4	登录错误	
5	传入的 address 和当前 钱包选择的 address 不一致	

methods :
| namespace | function name | params | return data|
| --- | --- | --- | --- |
| bridge | version | | {"versionName":"1.0.0","versionCode":1}|
| app | info | |{"platform":"ios"/"android","versionName":"1.0.0","versionCode":1024"env":"test" // production}|
| app | language | | "zh-Hans"/"en"
| app | setWebTitle | {title:"example title"} |
| app | share | {"url": "https://google.com" }|
| wallet | currentAddress | params | "vite_XXXXXXXXXX"|
| wallet | sendTxByURI | {"uri":"an string of vite uri schema "} | the block generated|









app.share

viteBridge.call("app.share",{"url": "ddddd" },function(JsResult){

})

分享url	{url: "http://www.baidu.com" }	


wallet 方法

wallet.currentAddress

viteBridge.call("wallet.currentAddress",function(JsResult){

})

返回当前 vite 地址信息	
成功：

"vite_fa1d81d93bcc36f234f7bccf1403924a0834609f4b2e9856ad"

失败：

未登录

viteBridge.call("wallet.sendTxByURI",{ "uri": "vite:vite_ac683307d0f03e9526b33d7a0b175ae0573c622a1d43931a8e/?tti=tti_5649544520544f4b454e6e40&amount=20" },function(JsResult){

})

入参为 uri，格式参考Vite URI

对指定的 uri 生成 相应的 block 使用私钥签名，调用 sendRawTx 方法



成功：

返回生成的block

失败：

1.未登录

2.传入的 address 和当前 钱包选择的 address 不一致

3.其他 rpc 返回的错误

4.发送 交易。等返回



本接口的业务错误码

4001	上一次交易未完成，又提交一次交易	
4002	未找到tokenId对应的 tokenInfo	
4003	amount 格式错误，比如不支持小数点的 token ，却加了小数点，通用的解释是将 amount 转为最小单位的值后，还存在小数点	
4004	用户中途放弃交易（身份校验放弃，POW 放弃等）	
任何负数错误码	直接用 message 展示就可以，客户端本地已经做了	
