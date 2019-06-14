## A bridge between native & web  

### Quick start   

#### Installation  

Install using [npm](https://www.npmjs.org/):

```sh
npm install @vite/bridge
```

#### Hello world
```javascript
import Bridge from '@vite/bridge';
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
bridge[namespace.methodname](...args)
```
Currently, bridge supports async function call only.
Each calling will return a `Promise`,which resolve with the function data or reject whith object:
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
  
| error code | desc |
| --- | --- |
| 1	| unknown error | 
| 2	| invalidate params	|
| 3	| network error |	
| 4	| login error	|
| 5	| address in params not identical to current address|

- method wallet.sendTxByURI possible error code    
  
| error code | desc |
| --- | --- |
| 4001 | duplicate transaction before last transaction finished |
| 4002	| cannot find related tokenId	|
| 4003	| amount format error (should be translate to min unit)	|
| 4004 | user suspend|
| any minus | show the message , we have handled it |

methods :
| namespace | function name | params | return data|
| --- | --- | --- | --- |
| bridge | version | | {"versionName":"1.0.0","versionCode":1}|
| app | info | |{"platform":"ios"/"android","versionName":"1.0.0","versionCode":1024"env":"test" // production}|
| app | language | | "zh-Hans"/"en"
| app | setWebTitle | {title:"example title"} |
| app | share | {"url": "https://google.com" }|
| wallet | currentAddress | params | "vite_XXXXXXXXXX"|
| wallet | sendTxByURI | {"uri":"[string of vite uri schema](https://vite.wiki/api/vitejs/tool/utils.html#uristringify) "} | the block generated|
