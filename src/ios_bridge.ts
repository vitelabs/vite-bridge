import { NativeBridge } from './index'

declare global {
    interface Window {
        WKWebViewJavascriptBridge: NativeBridge;
        WKWVJBCallbacks?: Array<(bridge: NativeBridge) => void>;
        webkit?: {
            messageHandlers?: {
                iOS_Native_InjectJavascript?: {
                    postMessage(message: null): void;
                };
            };
        };
    }
}

export const iosInit: () => Promise<NativeBridge> = () => {
    return new Promise(res => {
        const callback = () => res(window.WKWebViewJavascriptBridge)

        if (Array.isArray(window.WKWVJBCallbacks)) {
            window.WKWVJBCallbacks.push(callback)
        } else {
            window.WKWVJBCallbacks = [callback]
        }

        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iOS_Native_InjectJavascript) {
            window.webkit.messageHandlers.iOS_Native_InjectJavascript.postMessage(null)
        }
    })
}
