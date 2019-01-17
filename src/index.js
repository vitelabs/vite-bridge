const builtInMethods = ['setWebTitle'];
const defaultTimeout = 10000;
export default class vitebridge {
    constructor({ readyCallback, selfDefinedMethods = builtInMethods, timeout = defaultTimeout } = { selfDefinedMethods: builtInMethods, timeout: defaultTimeout }) {
        const methods = new Set([...selfDefinedMethods, ...builtInMethods]);
        this._event = {};
        this._ready = false;
        this.registerHandlerCacheQueu = [];
        this.callHandleCacheQueu = [];
        //-------------- ios init------
        const _readyCallback = (_bridge) => {
            this._ready = true;
            this.callHandleCacheQueu.forEach(args => {
                this._originBridge.callHandler(...args)
            })
            this.registerHandlerCacheQueu.forEach(args => {
                this._originBridge.registerHandler(...args)
            })
            typeof readyCallback === "function" && readyCallback(_bridge)
        }
        window.WKWVJBCallbacks = window.WKWVJBCallbacks || [_readyCallback];
        window.webkit.messageHandlers.iOS_Native_InjectJavascript.postMessage(null);
        // -----------------
        methods.forEach(m => {
            this[m] = (arg) => {
                return new Promise((res, rej) => {
                    setTimeout(() => {
                        rej("time out");
                    }, timeout)
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
                    const callHandlerArgs = [m, arg === undefined ? "" : JSON.stringify(arg), callback]
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
    get _originBridge() {
        return window.WKWebViewJavascriptBridge
    }
    subscribe(eventName, cb) {
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
                    cb(JSON.parse(args))
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