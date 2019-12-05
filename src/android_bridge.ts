import { NativeBridge } from './index'

interface MessageFromNative {
    callbackId: number;
    data: string;
    method: string;
}

interface MessageToNative<T> {
    id: number;
    complete: boolean;
    data: T;
}

declare global {
    interface Window {
        _dsbridge: any;
        _dswk: boolean;
        _dsInit: boolean;
        _handleMessageFromNative: (message: MessageFromNative) => void;
    }
}

function androidCall<E extends any[], T>(
    bridge: AndroidBridge,
    args: E,
    output: MessageToNative<T>,
    handler: (...args: E) => T) {
    output.data = handler(...args)
    bridge.callHandler('_dsb.returnValue', output)
}

function androidCallAsync<E extends any[], T>(
    bridge: AndroidBridge,
    arg: E,
    output: MessageToNative<T>,
    handler: (cb: (data: T, complete: boolean) => void, ...args: E) => void) {
    handler((data: T, complete: boolean) => {
        output.data = data;
        output.complete = (complete !== false)
        bridge.callHandler('_dsb.returnValue', output)
    }, ...arg)
}

let callbackId = 0
const SyncMethods = Symbol('syncMethods')
const AsyncMethods = Symbol('asyncMethods')

export function androidInit(): NativeBridge {
    const bridge = new AndroidBridge();

    if (window.hasOwnProperty(SyncMethods)) return bridge;

    Object.defineProperty(window, SyncMethods, {
        value: {},
        enumerable: false,
        configurable: false,
        writable: false
    })

    Object.defineProperty(window, AsyncMethods, {
        value: {},
        enumerable: false,
        configurable: false,
        writable: false
    })

    const _close = window.close
    window.close = () => {
        if (bridge.hasNativeMethod('_dsb.closePage')) {
            bridge.callHandler('_dsb.closePage');
        } else {
            _close.call(window);
        }
    }
    window._handleMessageFromNative = <T>(message: MessageFromNative) => {
        const result: MessageToNative<T> = {
            id: message.callbackId,
            complete: true,
            data: null,
        }

        const args = JSON.parse(message.data)
        const func = window[SyncMethods][message.method];
        const asyncFunc = window[AsyncMethods][message.method];
        if (func) {
            androidCall(bridge, args, result, func)
        } else if (asyncFunc) {
            androidCallAsync(bridge, args, result, asyncFunc)
        }
    }

    bridge.registerHandler('_hasJavascriptMethod', method => {
        return typeof window[SyncMethods][method] === 'function' || typeof window[AsyncMethods][method] === 'function'
    }, false);

    return bridge
}

export class AndroidBridge implements NativeBridge {
    callHandler(method: string, args: any = null, callback?: (args: any) => void): any {
        const arg = {
            data: args === undefined ? null : args,
            _dscbstub: '',
        }

        if (typeof callback === 'function') {
            const cbName = `dscb${callbackId++}`
            window[cbName] = callback
            arg._dscbstub = cbName
        } else {
            delete arg['_dscbstub']
        }

        const argString = JSON.stringify(arg);

        let ret = ''
        if (window._dsbridge) {
            ret = window._dsbridge.call(method, argString)
        } else if (
            window._dswk ||
            navigator.userAgent.indexOf("_dsbridge") != -1
        ) {
            ret = prompt(`_dsbridge=${method}`, argString);
        }

        return ret && JSON.parse(ret).data
    }

    registerHandler(name: string, fun: (args: any) => void, asyn = true) {
        const host = asyn ? window[AsyncMethods] : window[SyncMethods];
        if (!window._dsInit) {
            window._dsInit = true;
            setTimeout(() => {
                this.callHandler('_dsb.dsinit');
            }, 0);
        }

        host[name] = fun;
    }

    hasNativeMethod(name: string, type = 'all') {
        return this.callHandler("_dsb.hasNativeMethod", {
            name,
            type
        });
    }
}
