System.register(["./KontomatikSocket", "./AlertBox"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var KontomatikSocket_1, AlertBox_1, Kontomatik, KontomatikOptions, InternalKontomatikOptions, KontomatikSession, ImportOwnerDetailsCommand, ImportTransactionsCommand, ImportAccountsCommand, FinHealthIndicatorCommand;
    return {
        setters: [
            function (KontomatikSocket_1_1) {
                KontomatikSocket_1 = KontomatikSocket_1_1;
            },
            function (AlertBox_1_1) {
                AlertBox_1 = AlertBox_1_1;
            }
        ],
        execute: function () {
            Kontomatik = (function () {
                function Kontomatik() {
                }
                Kontomatik.initWidget = function (options) {
                    embedKontomatik(Kontomatik.getInternalOptions(options));
                };
                Kontomatik.initSocket = function (session) {
                    Kontomatik.socket = new KontomatikSocket_1.KontomatikSocket(session, Kontomatik.onMessage);
                };
                Kontomatik.getOwnerDetails = function (callback) {
                    var command = new ImportOwnerDetailsCommand();
                    Kontomatik.executeCommand(command, callback);
                };
                Kontomatik.getAccounts = function (callback) {
                    var command = new ImportAccountsCommand();
                    Kontomatik.executeCommand(command, callback);
                };
                Kontomatik.getTransactions = function (iban, since, callback) {
                    var command = new ImportTransactionsCommand();
                    command.id += iban;
                    command.iban = iban;
                    command.since = since;
                    Kontomatik.executeCommand(command, callback);
                };
                Kontomatik.getFinHealthIndicator = function (callback) {
                    var command = new FinHealthIndicatorCommand();
                    Kontomatik.executeCommand(command, callback);
                };
                Kontomatik.executeCommand = function (command, callback) {
                    if (!Kontomatik.commands[command.id]) {
                        command.callback = callback;
                        Kontomatik.commands[command.id] = command;
                        Kontomatik.socket.send(command);
                    }
                };
                Kontomatik.onMessage = function (message) {
                    if (message["Error"]) {
                        Kontomatik.handleError(message);
                    }
                    else {
                        Kontomatik.handleCommandAnswer(message);
                    }
                };
                Kontomatik.handleCommandAnswer = function (message) {
                    var id = message["Id"];
                    if (Kontomatik.commands[id]) {
                        Kontomatik.commands[id].callback(message["Data"]);
                        delete Kontomatik.commands[id];
                    }
                };
                Kontomatik.handleError = function (message) {
                    AlertBox_1.AlertBox.show(message["Error"], 'Kontomatik API Error', '<a href="/" class="btn btn-primary" role="button">Restart</a>');
                };
                Kontomatik.getInternalOptions = function (options) {
                    var internalOptions = new InternalKontomatikOptions();
                    internalOptions.client = options.client;
                    internalOptions.divId = options.divId;
                    internalOptions.target = options.target;
                    internalOptions.client = options.client;
                    internalOptions.onSuccess = Kontomatik.getInternalOnSuccess(options);
                    return internalOptions;
                };
                Kontomatik.getInternalOnSuccess = function (options) {
                    return function (target, sessionId, sessionIdSignature) {
                        var session = new KontomatikSession();
                        session.sessionId = sessionId + ':' + sessionIdSignature;
                        session.sessionIdSignature = sessionIdSignature;
                        session.target = target;
                        options.onSuccess(session);
                    };
                };
                return Kontomatik;
            }());
            Kontomatik.commands = {};
            exports_1("Kontomatik", Kontomatik);
            KontomatikOptions = (function () {
                function KontomatikOptions() {
                    this.divId = 'kontomatik';
                }
                return KontomatikOptions;
            }());
            exports_1("KontomatikOptions", KontomatikOptions);
            InternalKontomatikOptions = (function () {
                function InternalKontomatikOptions() {
                }
                return InternalKontomatikOptions;
            }());
            KontomatikSession = (function () {
                function KontomatikSession() {
                }
                return KontomatikSession;
            }());
            exports_1("KontomatikSession", KontomatikSession);
            ImportOwnerDetailsCommand = (function () {
                function ImportOwnerDetailsCommand() {
                    this.id = "ImportOwnerDetailsCommand";
                }
                return ImportOwnerDetailsCommand;
            }());
            exports_1("ImportOwnerDetailsCommand", ImportOwnerDetailsCommand);
            ImportTransactionsCommand = (function () {
                function ImportTransactionsCommand() {
                    this.id = "ImportTransactionsCommand";
                }
                return ImportTransactionsCommand;
            }());
            exports_1("ImportTransactionsCommand", ImportTransactionsCommand);
            ImportAccountsCommand = (function () {
                function ImportAccountsCommand() {
                    this.id = "ImportAccountsCommand";
                }
                return ImportAccountsCommand;
            }());
            exports_1("ImportAccountsCommand", ImportAccountsCommand);
            FinHealthIndicatorCommand = (function () {
                function FinHealthIndicatorCommand() {
                    this.id = "FinHealthIndicatorCommand";
                }
                return FinHealthIndicatorCommand;
            }());
            exports_1("FinHealthIndicatorCommand", FinHealthIndicatorCommand);
        }
    };
});
//# sourceMappingURL=Kontomatik.js.map