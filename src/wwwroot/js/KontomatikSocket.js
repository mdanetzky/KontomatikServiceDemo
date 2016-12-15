System.register(["./AlertBox"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var AlertBox_1, KontomatikSocket;
    return {
        setters: [
            function (AlertBox_1_1) {
                AlertBox_1 = AlertBox_1_1;
            }
        ],
        execute: function () {
            KontomatikSocket = (function () {
                function KontomatikSocket(session, onMessage) {
                    this.onMessageCallback = onMessage;
                    this.session = session;
                    this.connect();
                }
                KontomatikSocket.prototype.send = function (data) {
                    if (!this.socket || this.socket.readyState != WebSocket.OPEN) {
                        AlertBox_1.AlertBox.show('WebSocket not connected', 'Error', '<a href="/" class="btn btn-primary" role="button">Restart</a>');
                    }
                    this.socket.send(JSON.stringify(data));
                };
                KontomatikSocket.prototype.connect = function () {
                    var _this = this;
                    this.socket = new WebSocket(this.websocketUrl());
                    this.socket.onopen = function (event) { _this.onOpen(event); };
                    this.socket.onerror = function (event) { _this.onError(event); };
                    this.socket.onmessage = function (event) { _this.onMessage(event); };
                    $(window).unload(function () {
                        if (this.socket && this.socket.readyState == WebSocket.OPEN) {
                            this.socket.close();
                        }
                    });
                };
                KontomatikSocket.prototype.onMessage = function (event) {
                    var data = JSON.parse(event.data);
                    this.onMessageCallback(data);
                };
                KontomatikSocket.prototype.onOpen = function (event) {
                    this.send(this.session);
                };
                KontomatikSocket.prototype.onError = function (event) {
                    AlertBox_1.AlertBox.show(JSON.stringify(event), 'WebSocket Error', '<a href="/" class="btn btn-primary" role="button">Restart</a>');
                };
                KontomatikSocket.prototype.websocketUrl = function () {
                    var documentUrl = document.location;
                    var protocol = documentUrl.protocol == "https:" ? "wss://" : "ws://";
                    return protocol + documentUrl.host + documentUrl.pathname;
                };
                return KontomatikSocket;
            }());
            exports_1("KontomatikSocket", KontomatikSocket);
        }
    };
});
//# sourceMappingURL=KontomatikSocket.js.map