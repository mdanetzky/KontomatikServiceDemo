System.register(["./Kontomatik", "./ActionButton", "./AlertBox"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Kontomatik_1, ActionButton_1, AlertBox_1, KontomatikMain;
    return {
        setters: [
            function (Kontomatik_1_1) {
                Kontomatik_1 = Kontomatik_1_1;
            },
            function (ActionButton_1_1) {
                ActionButton_1 = ActionButton_1_1;
            },
            function (AlertBox_1_1) {
                AlertBox_1 = AlertBox_1_1;
            }
        ],
        execute: function () {
            /// <reference path="./jquery/jquery.d.ts" />
            KontomatikMain = (function () {
                function KontomatikMain() {
                }
                KontomatikMain.embedWidget = function () {
                    if (KontomatikMain.isWidgetPage()) {
                        KontomatikMain.kontomatikOpts.client = $('#kontomatik').attr('client');
                        KontomatikMain.kontomatikOpts.onSuccess = KontomatikMain.onSuccess;
                        Kontomatik_1.Kontomatik.initWidget(KontomatikMain.kontomatikOpts);
                    }
                };
                KontomatikMain.connectSocket = function () {
                    if (KontomatikMain.isResultPage()) {
                        Kontomatik_1.Kontomatik.initSocket(KontomatikMain.getSession());
                    }
                };
                KontomatikMain.setupButtons = function () {
                    if (KontomatikMain.isResultPage()) {
                        KontomatikMain.setupOwnerButton();
                        KontomatikMain.setupAccountsButton();
                        KontomatikMain.setupFinHealthIndicatorButton();
                    }
                };
                KontomatikMain.setupFinHealthIndicatorButton = function () {
                    var finHealthIndicatorButton = new ActionButton_1.ActionButton("Get Financial Health Indicator");
                    finHealthIndicatorButton.appendTo('#finhealth-div');
                    finHealthIndicatorButton.setAction(function () { return KontomatikMain.finHealthIndicatorClick(finHealthIndicatorButton); });
                };
                KontomatikMain.finHealthIndicatorClick = function (finHealthIndicatorButton) {
                    finHealthIndicatorButton.setAction(function () { });
                    finHealthIndicatorButton.setLoading();
                    Kontomatik_1.Kontomatik.getFinHealthIndicator(function (xml) { return KontomatikMain.receiveFinHealthIndicator(xml, finHealthIndicatorButton); });
                };
                KontomatikMain.receiveFinHealthIndicator = function (xml, finHealthIndicatorButton) {
                    finHealthIndicatorButton.setColor(ActionButton_1.ButtonColor.Success);
                    finHealthIndicatorButton.setCaption("Show Financial Health Indicator");
                    var formattedXml = KontomatikMain.formatXml(xml);
                    finHealthIndicatorButton.setAction(function () { return AlertBox_1.AlertBox.show(formattedXml, "Financial Health Indicator"); });
                };
                KontomatikMain.setupAccountsButton = function () {
                    var importAccountsButton = new ActionButton_1.ActionButton("Get Accounts");
                    importAccountsButton.appendTo('#accounts-div');
                    importAccountsButton.setAction(function () { return KontomatikMain.importAccountsClick(importAccountsButton); });
                };
                KontomatikMain.importAccountsClick = function (importAccountsButton) {
                    importAccountsButton.setAction(function () { });
                    importAccountsButton.setLoading();
                    Kontomatik_1.Kontomatik.getAccounts(function (xml) {
                        importAccountsButton.remove();
                        var $buttons = KontomatikMain.createAccountsButtons(xml);
                        $('#accounts-div').append($buttons);
                    });
                };
                KontomatikMain.setupOwnerButton = function () {
                    var importOwnersButton = new ActionButton_1.ActionButton("Get Owners");
                    importOwnersButton.appendTo('#owners-div');
                    importOwnersButton.setAction(function () { return KontomatikMain.importOwnersClick(importOwnersButton); });
                };
                KontomatikMain.importOwnersClick = function (importOwnersButton) {
                    importOwnersButton.setAction(function () { });
                    importOwnersButton.setLoading();
                    Kontomatik_1.Kontomatik.getOwnerDetails(function (xml) { return KontomatikMain.receiveOwnerDetails(xml, importOwnersButton); });
                };
                KontomatikMain.receiveOwnerDetails = function (xml, importOwnersButton) {
                    importOwnersButton.remove();
                    var $buttons = KontomatikMain.createOwnerButtons(xml);
                    $('#owners-div').append($buttons);
                };
                KontomatikMain.createAccountsButtons = function (xml) {
                    var $xml = $($.parseXML(xml));
                    var $buttons = [];
                    $xml.find('account').each(function (index, element) { return KontomatikMain.createAccountButtons(element, $buttons); });
                    return $buttons;
                };
                KontomatikMain.createAccountButtons = function (element, $buttons) {
                    var accountButton = KontomatikMain.createShowAccountButton(element);
                    var transactionsButton = new ActionButton_1.ActionButton("Get transactions", ActionButton_1.ButtonSize.Small);
                    var iban = $(element).find("iban").text();
                    transactionsButton.setAction(function () { return KontomatikMain.fetchTransactionsHandler(iban, transactionsButton); });
                    $buttons.push(accountButton.get$());
                    $buttons.push(transactionsButton.get$());
                    $buttons.push($($.parseHTML("<br>")));
                };
                KontomatikMain.fetchTransactionsHandler = function (iban, transactionsButton) {
                    transactionsButton.setAction(function () { });
                    transactionsButton.setLoading();
                    Kontomatik_1.Kontomatik.getTransactions(iban, new Date(2010, 1, 1), function (xml) {
                        return KontomatikMain.showTransactionsHandler(xml, transactionsButton);
                    });
                };
                KontomatikMain.showTransactionsHandler = function (xml, transactionsButton) {
                    transactionsButton.setColor(ActionButton_1.ButtonColor.Success);
                    transactionsButton.setCaption("Show transactions");
                    var formattedXml = KontomatikMain.formatXmlElement(xml);
                    transactionsButton.setAction(function () { return AlertBox_1.AlertBox.show(formattedXml, name); });
                };
                KontomatikMain.createShowAccountButton = function (element) {
                    var name = $(element).find("name").text();
                    var accountButton = new ActionButton_1.ActionButton("Show " + name);
                    accountButton.setColor(ActionButton_1.ButtonColor.Success);
                    var formattedXml = KontomatikMain.formatXmlElement(element);
                    accountButton.setAction(function () { return AlertBox_1.AlertBox.show(formattedXml, name); });
                    return accountButton;
                };
                KontomatikMain.createOwnerButtons = function (xml) {
                    var $xml = $($.parseXML(xml));
                    var $buttons = [];
                    $xml.find('owner').each(function (index, ownerElement) {
                        var $button = KontomatikMain.createOwnerDataButton(ownerElement);
                        $buttons.push($button);
                    });
                    return $buttons;
                };
                KontomatikMain.createOwnerDataButton = function (element) {
                    var name = $(element).find("name").text();
                    var button = new ActionButton_1.ActionButton('Show ' + name);
                    button.setColor(ActionButton_1.ButtonColor.Success);
                    var formattedXml = KontomatikMain.formatXmlElement(element);
                    button.setAction(function () { return AlertBox_1.AlertBox.show(formattedXml, name); });
                    return button.get$();
                };
                KontomatikMain.formatXmlElement = function (element) {
                    var xml = $(element).prop('outerHTML');
                    return KontomatikMain.formatXml(xml);
                };
                KontomatikMain.formatXml = function (xml) {
                    var beautifiedXml = vkbeautify.xml(xml);
                    return KontomatikMain.xmlToHtml(beautifiedXml);
                };
                KontomatikMain.xmlToHtml = function (xml) {
                    var div = document.createElement('div');
                    var text = document.createTextNode(xml);
                    div.appendChild(text);
                    return '<pre>' + div.innerHTML + '</pre>';
                };
                KontomatikMain.isResultPage = function () {
                    return !!document.getElementById("kontomatik-actions");
                };
                KontomatikMain.isWidgetPage = function () {
                    return !!document.getElementById("kontomatik");
                };
                KontomatikMain.onSuccess = function (session) {
                    var kontomatikForm = document.forms["kontomatikForm"];
                    kontomatikForm.SessionId.value = session.sessionId;
                    kontomatikForm.Target.value = session.target;
                    kontomatikForm.submit();
                };
                KontomatikMain.getSession = function () {
                    var session = new Kontomatik_1.KontomatikSession();
                    session.sessionId = $("#kontomatik-actions").attr("session-id");
                    return session;
                };
                return KontomatikMain;
            }());
            KontomatikMain.kontomatikOpts = new Kontomatik_1.KontomatikOptions();
            ;
            $(function () {
                KontomatikMain.embedWidget();
                KontomatikMain.connectSocket();
                KontomatikMain.setupButtons();
            });
        }
    };
});
//# sourceMappingURL=Main.js.map