/// <reference path="./jquery/jquery.d.ts" />
declare let vkbeautify: any;
import { Kontomatik, KontomatikWidgetOptions, KontomatikSession } from "./Kontomatik";
import { ActionButton, ButtonSize, ButtonColor } from "./ActionButton";
import { AlertBox } from "./AlertBox";

class KontomatikMain {

    private static kontomatikOpts: KontomatikWidgetOptions = new KontomatikWidgetOptions();

    public static embedWidget() {
        if (KontomatikMain.isWidgetPage()) {
            KontomatikMain.kontomatikOpts.client = $('#kontomatik').attr('client');
            KontomatikMain.kontomatikOpts.onSuccess = KontomatikMain.onSuccess;
            Kontomatik.initWidget(KontomatikMain.kontomatikOpts);
        }
    }

    public static connectSocket() {
        if (KontomatikMain.isResultPage()) {
            Kontomatik.initSocket(KontomatikMain.getSession());
        }
    }

    public static setupButtons() {
        if (KontomatikMain.isResultPage()) {
            KontomatikMain.setupOwnerButton();
            KontomatikMain.setupAccountsButton();
            KontomatikMain.setupFinHealthIndicatorButton();
        }
    }

    private static setupFinHealthIndicatorButton() {
       let finHealthIndicatorButton: ActionButton = new ActionButton("Get Financial Health Indicator");
        finHealthIndicatorButton.appendTo('#finhealth-div');
        finHealthIndicatorButton.setAction(() => KontomatikMain.finHealthIndicatorClick(finHealthIndicatorButton));
    }

    private static finHealthIndicatorClick(finHealthIndicatorButton: ActionButton) {
        finHealthIndicatorButton.setAction(() => { });
        finHealthIndicatorButton.setLoading();
        Kontomatik.getFinHealthIndicator((xml: string) => KontomatikMain.receiveFinHealthIndicator(xml, finHealthIndicatorButton));
    }

    private static receiveFinHealthIndicator(xml: string, finHealthIndicatorButton: ActionButton) {
        finHealthIndicatorButton.setColor(ButtonColor.Success);
        finHealthIndicatorButton.setCaption("Show Financial Health Indicator");
        let formattedXml = KontomatikMain.formatXml(xml);
        finHealthIndicatorButton.setAction(() => AlertBox.show(formattedXml, "Financial Health Indicator"));
    }

    private static setupAccountsButton() {
        let importAccountsButton: ActionButton = new ActionButton("Get Accounts");
        importAccountsButton.appendTo('#accounts-div');
        importAccountsButton.setAction(() => KontomatikMain.importAccountsClick(importAccountsButton));
    }

    private static importAccountsClick(importAccountsButton: ActionButton) {
        importAccountsButton.setAction(() => { });
        importAccountsButton.setLoading();
        Kontomatik.getAccounts((xml: string) => {
            importAccountsButton.remove();
            let $buttons = KontomatikMain.createAccountsButtons(xml);
            $('#accounts-div').append($buttons);
        });
    }

    private static setupOwnerButton() {
        let importOwnersButton: ActionButton = new ActionButton("Get Owners");
        importOwnersButton.appendTo('#owners-div');
        importOwnersButton.setAction(() => KontomatikMain.importOwnersClick(importOwnersButton));
    }

    private static importOwnersClick(importOwnersButton: ActionButton) {
        importOwnersButton.setAction(() => { });
        importOwnersButton.setLoading();
        Kontomatik.getOwnerDetails((xml: string) => KontomatikMain.receiveOwnerDetails(xml, importOwnersButton));
    }

    private static receiveOwnerDetails(xml: string, importOwnersButton: ActionButton) {
        importOwnersButton.remove();
        let $buttons = KontomatikMain.createOwnerButtons(xml);
        $('#owners-div').append($buttons);
    }

    private static createAccountsButtons(xml: string) {
        let $xml: JQuery = $($.parseXML(xml));
        let $buttons: JQuery[] = [];
        $xml.find('account').each((index, element) => KontomatikMain.createAccountButtons(element, $buttons));
        return $buttons;
    }

    private static createAccountButtons(element: any, $buttons: Array<JQuery>) {
        let accountButton: ActionButton = KontomatikMain.createShowAccountButton(element);
        let transactionsButton: ActionButton = new ActionButton("Get transactions", ButtonSize.Small);
        let iban: string = $(element).find("iban").text();
        transactionsButton.setAction(() => KontomatikMain.fetchTransactionsHandler(iban, transactionsButton));
        $buttons.push(accountButton.get$());
        $buttons.push(transactionsButton.get$());
        $buttons.push($($.parseHTML("<br>")));
    }

    private static fetchTransactionsHandler(iban: string, transactionsButton: ActionButton) {
        transactionsButton.setAction(() => { });
        transactionsButton.setLoading();
        Kontomatik.getTransactions(iban, new Date(2010, 1, 1), (xml: string) =>
            KontomatikMain.showTransactionsHandler(xml, transactionsButton));
    }

    private static showTransactionsHandler(xml: string, transactionsButton: ActionButton) {
        transactionsButton.setColor(ButtonColor.Success);
        transactionsButton.setCaption("Show transactions");
        let formattedXml = KontomatikMain.formatXmlElement(xml);
        transactionsButton.setAction(() => AlertBox.show(formattedXml, name));
    }

    private static createShowAccountButton(element: any): ActionButton {
        let name: string = $(element).find("name").text();
        let accountButton: ActionButton = new ActionButton("Show " + name);
        accountButton.setColor(ButtonColor.Success);
        let formattedXml: string = KontomatikMain.formatXmlElement(element);
        accountButton.setAction(() => AlertBox.show(formattedXml, name));
        return accountButton;
    }

    private static createOwnerButtons(xml: string) {
        let $xml: JQuery = $($.parseXML(xml));
        let $buttons: Array<JQuery> = [];
        $xml.find('owner').each((index, ownerElement) => {
            let $button: JQuery = KontomatikMain.createOwnerDataButton(ownerElement);
            $buttons.push($button);
        });
        return $buttons;
    }

    private static createOwnerDataButton(element: any): JQuery {
        let name: string = $(element).find("name").text();
        let button: ActionButton = new ActionButton('Show ' + name);
        button.setColor(ButtonColor.Success);
        let formattedXml: string = KontomatikMain.formatXmlElement(element);
        button.setAction(() => AlertBox.show(formattedXml, name));
        return button.get$();
    }

    private static formatXmlElement(element: any): string {
        let xml: string = $(element).prop('outerHTML');
        return KontomatikMain.formatXml(xml);
    }

    private static formatXml(xml: string): string {
        let beautifiedXml: string = vkbeautify.xml(xml);
        return KontomatikMain.xmlToHtml(beautifiedXml);
    }

    private static xmlToHtml(xml: string): string {
        let div = document.createElement('div');
        let text = document.createTextNode(xml);
        div.appendChild(text);
        return '<pre>' + div.innerHTML + '</pre>';
    }

    private static isResultPage(): boolean {
        return !!document.getElementById("kontomatik-actions");
    }

    private static isWidgetPage(): boolean {
        return !!document.getElementById("kontomatik");
    }

    private static onSuccess(session: KontomatikSession) {
        let kontomatikForm = document.forms["kontomatikForm"];
        kontomatikForm.SessionId.value = session.sessionId;
        kontomatikForm.Target.value = session.target;
        kontomatikForm.ExternalOwnerId.value = session.externalOwnerId;
        kontomatikForm.submit();
    }

    private static getSession(): KontomatikSession {
        let session: KontomatikSession = new KontomatikSession();
        session.sessionId = $("#kontomatik-actions").attr("session-id");
        session.externalOwnerId = $("#kontomatik-actions").attr("external-owner-id");
        return session;
    }
};

$(function () {
    KontomatikMain.embedWidget();
    KontomatikMain.connectSocket();
    KontomatikMain.setupButtons();
});
