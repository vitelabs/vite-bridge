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
- common error code :
1	未知错误
2	无效参数	
3	网络错误	
4	登录错误	
5	传入的 address 和当前 钱包选择的 address 不一致	

- wallet.sendTxByURI possible error code    
  
| error code | desc |
| --- | --- |
| 4001 | 上一次交易未完成，又提交一次交易 |
| 4002	| 未找到tokenId对应的 tokenInfo	|
| 4003	| amount 格式错误，比如不支持小数点的 token ，却加了小数点，通用的解释是将amount 转为最小单位的值后，还存在小数点	|
| 4004 |	用户中途放弃交易（身份校验放弃，POW 放弃等）|
| 任何负数错误码 |	直接用 message 展示就可以，客户端本地已经做了 |

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
