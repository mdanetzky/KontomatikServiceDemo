/// <reference path="./jquery/jquery.d.ts" />
import { KontomatikSession } from "./Kontomatik";
import { AlertBox } from "./AlertBox";

export class KontomatikSocket {

    private session: KontomatikSession;
    private socket: WebSocket;
    private onMessageCallback: (xml:string) => void;

    constructor(session: KontomatikSession, onMessage: (message: Object) => void) {
        this.onMessageCallback = onMessage;
        this.session = session;
        this.connect();
    }

    public send(data: Object) {
        if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
            AlertBox.show('WebSocket not connected', 'Error', '<a href="/" class="btn btn-primary" role="button">Restart</a>');
        }
        this.socket.send(JSON.stringify(data));
    }

    private connect() {
        this.socket = new WebSocket(this.websocketUrl());
        this.socket.onopen = (event) => { this.onOpen(event); };
        this.socket.onerror = (event) => { this.onError(event); };
        this.socket.onmessage = (event) => { this.onMessage(event); };
        $(window).unload(function () {
            if (this.socket && this.socket.readyState == WebSocket.OPEN) {
                this.socket.close();
            }
        });
    }

    private onMessage(event: any) {
        let data:string = JSON.parse(event.data);
        this.onMessageCallback(data);
    }

    private onOpen(event: any) {
        this.send(this.session);
    }

    private onError(event: any) {
        AlertBox.show(JSON.stringify(event), 'WebSocket Error', '<a href="/" class="btn btn-primary" role="button">Restart</a>');
    }

    private websocketUrl(): string {
        let documentUrl = document.location;
        let protocol = documentUrl.protocol == "https:" ? "wss://" : "ws://";
        return protocol + documentUrl.host + documentUrl.pathname;
    }
}