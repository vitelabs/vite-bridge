const builtInMethods = ['bridge.version','app.info', 'app.language', 'app.setWebTitle', 'app.share', 'wallet.currentAddress', 'wallet.sendTxByURI','pri.encryption', 'app.setRRButton'];
const initIos = function () {
    return new Promise((res, rej) => {
        const _readyCallback = (_bridge) => {
            res(_bridge)
        }
        window.WKWVJBCallbacks = window.WKWVJBCallbacks || [_readyCallback];
        window.webkit && window.webkit.messageHandlers.iOS_Native_InjectJavascript.postMessage(null);
    })

}
const initAndroid = function () {
    return new Promise((res, rej) => {
        const bridge = {
            default: this,// for typescript
            call: function (method, args, cb) {
                var ret = '';
                if (typeof args == 'function') {
                    cb = args;
                    args = {};
                }
                var arg = { data: args === undefined ? null : args }
                if (typeof cb == 'function') {
                    var cbName = 'dscb' + window.dscb++;
                    window[cbName] = cb;
                    arg['_dscbstub'] = cbName;
                }
                arg = JSON.stringify(arg)

                //if in webview that dsBridge provided, call!
                if (window._dsbridge) {
                    ret = window._dsbridge.call(method, arg)
                } else if (window._dswk || navigator.userAgent.indexOf("_dsbridge") != -1) {
                    ret = prompt("_dsbridge=" + method, arg);
                }

                return JSON.parse(ret || '{}').data
            },
            register: function (name, fun, asyn) {
                var q = asyn ? window._dsaf : window._dsf
                if (!window._dsInit) {
                    window._dsInit = true;
                    //notify native that js apis register successfully on next event loop
                    setTimeout(function () {
                        bridge.call("_dsb.dsinit");
                    }, 0)
                }
                if (typeof fun == "object") {
                    q._obs[name] = fun;
                } else {
                    q[name] = fun
                }
            },
            registerAsyn: function (name, fun) {
                this.register(name, fun, true);
            },
            registerHandler: function (name, fun) {
                return bridge.register(name, fun, true);
            },
            callHandler: function (...args) {
                return bridge.call(...args)
            },
            hasNativeMethod: function (name, type) {
                return this.call("_dsb.hasNativeMethod", { name: name, type: type || "all" });
            },
            disableJavascriptDialogBlock: function (disable) {
                this.call("_dsb.disableJavascriptDialogBlock", {
                    disable: disable !== false
                })
            }
        };

        !function () {
            if (window._dsf) return;
            var _close = window.close;
            var ob = {
                //保存JS同步方法
                _dsf: {
                    _obs: {}
                },
                //保存JS异步方法
                _dsaf: {
                    _obs: {}
                },
                dscb: 0,
                viteBridge: bridge,
                dsBridge: bridge,
                close: function () {
                    if (bridge.hasNativeMethod('_dsb.closePage')) {
                        bridge.call("_dsb.closePage")
                    } else {
                        _close.call(window)
                    }
                },
                _handleMessageFromNative: function (info) {
                    var arg = JSON.parse(info.data);
                    var ret = {
                        id: info.callbackId,
                        complete: true
                    }
                    var f = this._dsf[info.method];
                    var af = this._dsaf[info.method]
                    var callSyn = function (f, ob) {
                        ret.data = f.apply(ob, arg)
                        bridge.call("_dsb.returnValue", ret)
                    }
                    var callAsyn = function (f, ob) {
                        arg.push(function (data, complete) {
                            ret.data = data;
                            ret.complete = complete !== false;
                            bridge.call("_dsb.returnValue", ret)
                        })
                        f.apply(ob, arg)
                    }
                    if (f) {
                        callSyn(f, this._dsf);
                    } else if (af) {
                        callAsyn(af, this._dsaf);
                    } else {
                        //with namespace
                        var name = info.method.split('.');
                        if (name.length < 2) return;
                        var method = name.pop();
                        var namespace = name.join('.')
                        var obs = this._dsf._obs;
                        var ob = obs[namespace] || {};
                        var m = ob[method];
                        if (m && typeof m == "function") {
                            callSyn(m, ob);
                            return;
                        }
                        obs = this._dsaf._obs;
                        ob = obs[namespace] || {};
                        m = ob[method];
                        if (m && typeof m == "function") {
                            callAsyn(m, ob);
                            return;
                        }
                    }
                }
            }
            for (var attr in ob) {
                window[attr] = ob[attr]
            }
            bridge.register("_hasJavascriptMethod", function (method, tag) {
                var name = method.split('.')
                if (name.length < 2) {
                    return !!(_dsf[name] || _dsaf[name])
                } else {
                    // with namespace
                    var method = name.pop()
                    var namespace = name.join('.')
                    var ob = _dsf._obs[namespace] || _dsaf._obs[namespace]
                    return ob && !!ob[method]
                }
            })
            window.AndroidDSBridge = bridge;
            res(bridge)
        }();
    })

}
export default class vitebridge {
    constructor({ readyCallback, selfDefinedMethods = builtInMethods } = { selfDefinedMethods: builtInMethods }) {
        const methods = new Set([...selfDefinedMethods, ...builtInMethods]);
        this._event = {};
        this._ready = false;
        this.registerHandlerCacheQueu = [];
        this.callHandleCacheQueu = [];
        const _ready = (_bridge) => {
            this._ready = true;
            this.callHandleCacheQueu.forEach(args => {
                console.log('callllll ',args)
                _bridge.callHandler(...args)
            })
            this.registerHandlerCacheQueu.forEach(args => {
                _bridge.registerHandler(...args)
            })
            typeof readyCallback === "function" && readyCallback(_bridge);
        }

        
        //-------------- ios init------
        if (vitebridge._inIosContainer) {
            initIos().then(res => {
                _ready(res)
            })
        }
        // -----------------



        // -----------------android init---------
        if (vitebridge._inAndroidContainer) {
            initAndroid().then(res => {
                _ready(res)
            })
        }
        //--------------------------


        methods.forEach(m => {
            this[m] = (arg) => {
                return new Promise((res, rej) => {
                    if (!vitebridge._support) {
                        rej("not support")
                    }
                    const callback = (function (res, rej) {
                        return function (responseArgs) {
                            const { code = 0, msg = "", data = null } = JSON.parse(responseArgs);
                            //timeout todo
                            if (code === 0) {
                                res(data)
                            } else {
                                rej({ code, msg, data })
                            }
                        }
                    })(res, rej)
                    const callHandlerArgs = [m, arg === undefined ? "" : arg, callback]
                    if (!this._ready) {
                        console.log(`call ${m} when not ready,${JSON.stringify(callHandlerArgs)}`)
                        this.callHandleCacheQueu.push(callHandlerArgs)
                    } else {
                        console.log(`call ${m} when ready,${JSON.stringify(callHandlerArgs)}`)
                        this._originBridge.callHandler(...callHandlerArgs)
                    }

                })


            }
        })
    }
    static get _support() {
        return vitebridge._inAndroidContainer || vitebridge._inIosContainer;
    }
    static get _inIosContainer() {
        return !!window.webkit
    }
    static get _inAndroidContainer() {
        return !!(window._dsbridge||window._dsf||navigator.userAgent.indexOf("_dsbridge") != -1)
    }
    get _originBridge() {
        if (vitebridge._inIosContainer) {
            return window.WKWebViewJavascriptBridge
        }
        if (vitebridge._inAndroidContainer) {
            return window.AndroidDSBridge
        }
        return null;
    }
    subscribe(eventName, cb) {
        if (!vitebridge._support) {
            console.error('bridge not supported');
            return;
        }
        if (typeof cb !== "function") {
            throw new Error("callback must be a function")
        }
        const registered = !!this._event[eventName]
        !registered && (this._event[eventName] = []);
        if (this._event[eventName].some(f => {
            return f === cb;
        })) return;
        this._event[eventName].push(cb);
        if (!registered) {
            const registerHandlerArgs = [eventName, (args) => {
                this._event[eventName].forEach(cb => {
                    console.log('emitter', eventName, args)
                    cb(args)
                })
            }]
            if (this._ready) {
                this._originBridge.registerHandler(...registerHandlerArgs)
            } else {
                this.registerHandlerCacheQueu.push(registerHandlerArgs)
            }

        }

    }
    unSubscribe(eventName, cb) {
        if (typeof cb !== "function") {
            throw new Error("callback must be a function")
        }
        const registered = !!this._event[eventName]
        if (!registered) return;
        this._event[eventName].splice(this._event[eventName].indexOf(cb), 1);

    }
}