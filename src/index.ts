import * as types from './types'
import { androidInit } from './android_bridge'
import { iosInit } from './ios_bridge'

export interface BridgeOptions {
    readyCallback?: (bridge: Bridge) => void;
    selfDefinedMethods?: string[];
}

const userAgent = navigator.userAgent
const REG_VITE = /vite/i
const IS_APP = REG_VITE.test(userAgent)
const REG_IOS = /(iPhone)|(iPad)|(iPod)/i
const IS_IOS = REG_IOS.test(userAgent)
const REG_ANDROID = /android/i
const IS_ANDROID = REG_ANDROID.test(userAgent)

export interface NativeBridge {
    callHandler(method: string, args: any, callback: Handler): void;
    registerHandler(event: string, handler: Handler): void;
}

interface Handler {
    (args: any): void;
}
interface Listeners {
    [event: string]: Array<Handler>;
}

export default class Bridge {
    private bridge: NativeBridge = null;
    private listeners: Listeners = {};
    private ready = false;
    private registerQueue: Array<[string, Handler]> = [];
    private callQueue: Array<[string, any, Handler]> = [];
    private readonly inited = null;

    public constructor(inited?: (bridge: Bridge) => void) {
        if (new.target !== Bridge) {
            throw new Error(`MUST use Bridge as constructor`)
        }

        this.inited = inited
        this.init()
    }

    public static get enabled(): boolean {
        return IS_APP
    }

    private init(this: Bridge): void {
        if (IS_APP) {
            if (IS_IOS) {
                iosInit().then((bridge: NativeBridge) => this.done(bridge))
            } else if (IS_ANDROID) {
                const bridge = androidInit()
                this.done(bridge)
            }
        }
    }

    private done(this: Bridge, bridge: NativeBridge): void {
        this.bridge = bridge
        this.ready = true
        this.callQueue.forEach(args => this.bridge.callHandler(...args))
        this.registerQueue.forEach(args => this.bridge.registerHandler(...args))
        if (typeof this.inited === 'function') {
            this.inited(this)
        }
    }

    public call<E, T>(method: string, params?: E): Promise<T> {
        return new Promise<T>((res, rej) => {
            if (!IS_APP) {
                rej('vite bridge not supported');
            }

            const args = params === undefined ? "" : params

            const callback = (response: string) => {
                try {
                    const { code = 0, msg = "", data = null } = JSON.parse(response);
                    //timeout todo
                    if (code === 0) {
                        res(data);
                    } else {
                        rej({ code, msg, data });
                    }
                } catch (e) {
                    rej({ code: -1, msg: e.message, data: response })
                }
            }

            if (this.ready) {
                this.bridge.callHandler(method, args, callback)
            } else {
                this.callQueue.push([method, args, callback])
            }
        });
    }

    public subscribe(event: string, handler: Handler): void {
        if (!IS_APP) {
            return
        }
        if (typeof handler !== 'function') {
            throw new Error('handler must be a function')
        }

        const handlers = this.listeners[event]

        if (!Array.isArray(handlers)) {
            this.listeners[event] = [handler];
            const _handler = (args: any) => this.listeners[event].forEach(cb => cb(args));
            if (this.ready) {
                this.bridge.registerHandler(event, _handler)
            } else {
                this.registerQueue.push([event, _handler])
            }
            return
        }

        const subscribed = handlers.includes(handler)
        if (subscribed) {
            return
        }

        handlers.push(handler)
    }

    public unSubscribe(event: string, handler?: Handler): void {
        if (!handler) {
            this.listeners[event] = []
            return
        }

        if (typeof handler !== 'function') {
            throw new Error('handler must be a function')
        }

        const handlers = this.listeners[event]
        if (Array.isArray(handlers)) {
            const index = handlers.indexOf(handler)
            if (index > -1) {
                handlers.splice(index, 1)
            }
        }
    }

    public 'bridge.version'(): Promise<types.BridgeVersion> {
        return this.call<void, types.BridgeVersion>('bridge.version')
    }

    public 'app.info'(): Promise<types.AppInfo> {
        return this.call<void, types.AppInfo>('app.info')
    }

    public 'app.language'(): Promise<types.Lang> {
        return this.call<void, types.Lang>('app.language')
    }

    public 'app.setWebTitle'(params: types.SetWebTitleInput): Promise<void> {
        return this.call<types.SetWebTitleInput, void>('app.setWebTitle', params);
    }
    
    public 'app.share'(params: types.ShareLinkInput): Promise<void> {
        return this.call<types.ShareLinkInput, void>('app.share', params);
    }

    public 'app.scan'(): Promise<types.ScanOutput> {
        return this.call<void, types.ScanOutput>('app.scan')
    }

    public 'app.setRRButton'(params: types.SetRRButtonInput): Promise<void> {
        return this.call<types.SetRRButtonInput, void>('app.setRRButton', params);
    }

    public 'wallet.currentAddress'(): Promise<string> {
        return this.call<void, string>('wallet.currentAddress')
    }

    public 'wallet.sendTxByURI'(params: types.SendTxInput): Promise<types.SendTxOutput> {
        return this.call<types.SendTxInput, types.SendTxOutput>('wallet.sendTxByURI', params);
    }

    /**
     * @param params MUST be a JSONObject (javascript object not obey JSONObject syntax are invalid).
     *              Can not be a primitive type or an array.
     */
    public 'pri.encryption'(params: any): Promise<types.EncryptOutput> {
        return this.call<any, types.EncryptOutput>('pri.encryption', params);
    }

    public 'pri.open'(params: types.OpenInput): Promise<void> {
        return this.call<types.OpenInput, void>('pri.open', params)
    }

    public 'pri.sendTx'(params: types.PriSendTxInput): Promise<types.SendTxOutput> {
        params.block.amount = params.block.amount || '0'
        params.block.tokenId = params.block.tokenId || 'tti_5649544520544f4b454e6e40'
        params.block.fee = params.block.fee || '0'
        // delete this field, because empty string is error
        if (typeof params.block.data === 'undefined') {
            delete params.block.data
        }
        return this.call<types.PriSendTxInput, types.SendTxOutput>('pri.sendTx', params)
    }

    public 'pri.receiveAirdrop'(params: types.TokenId): Promise<void> {
        return this.call<types.TokenId, void>('pri.receiveAirdrop', params)
    }

    public 'pri.saveVitexInviteCode'(params: types.VitexInviteCode): Promise<void> {
        return this.call<types.VitexInviteCode, void>('pri.saveVitexInviteCode', params)
    }

    public 'pri.readVitexInviteCode'(): Promise<types.VitexInviteCode> {
        return this.call<void, types.VitexInviteCode>('pri.readVitexInviteCode')
    }

    public 'pri.addFavPair'(params: types.Pair): Promise<void> {
        return this.call<types.Pair, void>('pri.addFavPair', params)
    }

    public 'pri.deleteFavPair'(params: types.Pair): Promise<void> {
        return this.call<types.Pair, void>('pri.deleteFavPair', params)
    }

    public 'pri.getAllFavPairs'(): Promise<string[]> {
        return this.call<void, string[]>('pri.getAllFavPairs')
    }

    public 'pri.switchPair'(): Promise<types.Pair> {
        return this.call<void, types.Pair>('pri.switchPair')
    }

    public 'pri.transferAsset'(params: types.TokenId): Promise<any> {
        return this.call<types.TokenId, void>('pri.transferAsset', params)
    }
}
