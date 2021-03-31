(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.ViteBridge = factory());
}(this, (function () { 'use strict';

    function androidCall(bridge, args, output, handler) {
        output.data = handler(...args);
        bridge.callHandler('_dsb.returnValue', output);
    }
    function androidCallAsync(bridge, arg, output, handler) {
        handler((data, complete) => {
            output.data = data;
            output.complete = (complete !== false);
            bridge.callHandler('_dsb.returnValue', output);
        }, ...arg);
    }
    let callbackId = 0;
    const SyncMethods = Symbol('syncMethods');
    const AsyncMethods = Symbol('asyncMethods');
    function androidInit() {
        const bridge = new AndroidBridge();
        if (window.hasOwnProperty(SyncMethods))
            return bridge;
        Object.defineProperty(window, SyncMethods, {
            value: {},
            enumerable: false,
            configurable: false,
            writable: false
        });
        Object.defineProperty(window, AsyncMethods, {
            value: {},
            enumerable: false,
            configurable: false,
            writable: false
        });
        const _close = window.close;
        window.close = () => {
            if (bridge.hasNativeMethod('_dsb.closePage')) {
                bridge.callHandler('_dsb.closePage');
            }
            else {
                _close.call(window);
            }
        };
        window._handleMessageFromNative = (message) => {
            const result = {
                id: message.callbackId,
                complete: true,
                data: null,
            };
            const args = JSON.parse(message.data);
            const func = window[SyncMethods][message.method];
            const asyncFunc = window[AsyncMethods][message.method];
            if (func) {
                androidCall(bridge, args, result, func);
            }
            else if (asyncFunc) {
                androidCallAsync(bridge, args, result, asyncFunc);
            }
        };
        bridge.registerHandler('_hasJavascriptMethod', method => {
            return typeof window[SyncMethods][method] === 'function' || typeof window[AsyncMethods][method] === 'function';
        }, false);
        return bridge;
    }
    class AndroidBridge {
        callHandler(method, args = null, callback) {
            const arg = {
                data: args === undefined ? null : args,
                _dscbstub: '',
            };
            if (typeof callback === 'function') {
                const cbName = `dscb${callbackId++}`;
                window[cbName] = callback;
                arg._dscbstub = cbName;
            }
            else {
                delete arg['_dscbstub'];
            }
            const argString = JSON.stringify(arg);
            let ret = '';
            if (window._dsbridge) {
                ret = window._dsbridge.call(method, argString);
            }
            else if (window._dswk ||
                navigator.userAgent.indexOf("_dsbridge") != -1) {
                ret = prompt(`_dsbridge=${method}`, argString);
            }
            return ret && JSON.parse(ret).data;
        }
        registerHandler(name, fun, asyn = true) {
            const host = asyn ? window[AsyncMethods] : window[SyncMethods];
            if (!window._dsInit) {
                window._dsInit = true;
                setTimeout(() => {
                    this.callHandler('_dsb.dsinit');
                }, 0);
            }
            host[name] = fun;
        }
        hasNativeMethod(name, type = 'all') {
            return this.callHandler("_dsb.hasNativeMethod", {
                name,
                type
            });
        }
    }

    const iosInit = () => {
        return new Promise(res => {
            const callback = () => res(window.WKWebViewJavascriptBridge);
            if (Array.isArray(window.WKWVJBCallbacks)) {
                window.WKWVJBCallbacks.push(callback);
            }
            else {
                window.WKWVJBCallbacks = [callback];
            }
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iOS_Native_InjectJavascript) {
                window.webkit.messageHandlers.iOS_Native_InjectJavascript.postMessage(null);
            }
        });
    };

    const userAgent = navigator.userAgent;
    const REG_VITE = /vite/i;
    const IS_APP = REG_VITE.test(userAgent);
    const REG_IOS = /(iPhone)|(iPad)|(iPod)/i;
    const IS_IOS = REG_IOS.test(userAgent);
    const REG_ANDROID = /android/i;
    const IS_ANDROID = REG_ANDROID.test(userAgent);
    class Bridge {
        constructor(inited) {
            this.bridge = null;
            this.listeners = {};
            this.ready = false;
            this.registerQueue = [];
            this.callQueue = [];
            this.inited = null;
            if (new.target !== Bridge) {
                throw new Error(`MUST use Bridge as constructor`);
            }
            this.inited = inited;
            this.init();
        }
        static get enabled() {
            return IS_APP;
        }
        init() {
            if (IS_APP) {
                if (IS_IOS) {
                    iosInit().then((bridge) => this.done(bridge));
                }
                else if (IS_ANDROID) {
                    const bridge = androidInit();
                    this.done(bridge);
                }
            }
        }
        done(bridge) {
            this.bridge = bridge;
            this.ready = true;
            this.callQueue.forEach(args => this.bridge.callHandler(...args));
            this.registerQueue.forEach(args => this.bridge.registerHandler(...args));
            if (typeof this.inited === 'function') {
                this.inited(this);
            }
        }
        call(method, params) {
            return new Promise((res, rej) => {
                if (!IS_APP) {
                    rej('vite bridge not supported');
                }
                const args = params === undefined ? "" : params;
                const callback = (response) => {
                    try {
                        const { code = 0, msg = "", data = null } = JSON.parse(response);
                        if (code === 0) {
                            res(data);
                        }
                        else {
                            rej({ code, msg, data });
                        }
                    }
                    catch (e) {
                        rej({ code: -1, msg: e.message, data: response });
                    }
                };
                if (this.ready) {
                    this.bridge.callHandler(method, args, callback);
                }
                else {
                    this.callQueue.push([method, args, callback]);
                }
            });
        }
        subscribe(event, handler) {
            if (!IS_APP) {
                return;
            }
            if (typeof handler !== 'function') {
                throw new Error('handler must be a function');
            }
            const handlers = this.listeners[event];
            if (!Array.isArray(handlers)) {
                this.listeners[event] = [handler];
                const _handler = (args) => this.listeners[event].forEach(cb => cb(args));
                if (this.ready) {
                    this.bridge.registerHandler(event, _handler);
                }
                else {
                    this.registerQueue.push([event, _handler]);
                }
                return;
            }
            const subscribed = handlers.includes(handler);
            if (subscribed) {
                return;
            }
            handlers.push(handler);
        }
        unSubscribe(event, handler) {
            if (!handler) {
                this.listeners[event] = [];
                return;
            }
            if (typeof handler !== 'function') {
                throw new Error('handler must be a function');
            }
            const handlers = this.listeners[event];
            if (Array.isArray(handlers)) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        }
        'bridge.version'() {
            return this.call('bridge.version');
        }
        'app.info'() {
            return this.call('app.info');
        }
        'app.language'() {
            return this.call('app.language');
        }
        'app.setWebTitle'(params) {
            return this.call('app.setWebTitle', params);
        }
        'app.share'(params) {
            return this.call('app.share', params);
        }
        'app.scan'() {
            return this.call('app.scan');
        }
        'app.setRRButton'(params) {
            return this.call('app.setRRButton', params);
        }
        'wallet.currentAddress'() {
            return this.call('wallet.currentAddress');
        }
        'wallet.sendTxByURI'(params) {
            return this.call('wallet.sendTxByURI', params);
        }
        'pri.encryption'(params) {
            return this.call('pri.encryption', params);
        }
        'pri.open'(params) {
            return this.call('pri.open', params);
        }
        'pri.sendTx'(params) {
            params.block.amount = params.block.amount || '0';
            params.block.tokenId = params.block.tokenId || 'tti_5649544520544f4b454e6e40';
            params.block.fee = params.block.fee || '0';
            if (typeof params.block.data === 'undefined') {
                delete params.block.data;
            }
            return this.call('pri.sendTx', params);
        }
        'pri.receiveAirdrop'(params) {
            return this.call('pri.receiveAirdrop', params);
        }
        'pri.saveVitexInviteCode'(params) {
            return this.call('pri.saveVitexInviteCode', params);
        }
        'pri.readVitexInviteCode'() {
            return this.call('pri.readVitexInviteCode');
        }
        'pri.addFavPair'(params) {
            return this.call('pri.addFavPair', params);
        }
        'pri.deleteFavPair'(params) {
            return this.call('pri.deleteFavPair', params);
        }
        'pri.getAllFavPairs'() {
            return this.call('pri.getAllFavPairs');
        }
        'pri.switchPair'() {
            return this.call('pri.switchPair');
        }
        'pri.transferAsset'(params) {
            return this.call('pri.transferAsset', params);
        }
    }

    return Bridge;

})));
