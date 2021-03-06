declare let embedKontomatik: any;
import { KontomatikSocket } from "./KontomatikSocket"
import { AlertBox } from "./AlertBox"

export class Kontomatik {

    private static socket: KontomatikSocket;
    private static commands: { [id: string]: Command } = {};
    private static commandQueue: Command[] = [];
    private static currentCommand: Command = null;

    public static initWidget(options: KontomatikWidgetOptions) {
        embedKontomatik(Kontomatik.getInternalWidgetOptions(options));
    }

    public static initSocket(session: KontomatikSession) {
        Kontomatik.socket = new KontomatikSocket(session, Kontomatik.onMessage);
    }

    public static getOwnerDetails(callback: (xml: string) => void) {
        let command: Command = new ImportOwnerDetailsCommand();
        Kontomatik.enqueueCommand(command, callback);
    }

    public static getAccounts(callback: (xml: string) => void) {
        let command: Command = new ImportAccountsCommand();
        Kontomatik.enqueueCommand(command, callback);
    }

    public static getTransactions(iban: string, since: Date, callback: (xml: string) => void) {
        let command: ImportTransactionsCommand = new ImportTransactionsCommand();
        command.id += iban;
        command.iban = iban;
        command.since = since;
        Kontomatik.enqueueCommand(command, callback);
    }

    public static getFinHealthIndicator(callback: (xml: string) => void) {
        let command: Command = new FinHealthIndicatorCommand();
        Kontomatik.enqueueCommand(command, callback);
    }

    private static enqueueCommand(command: Command, callback: (xml: string) => void) {
        if (!Kontomatik.commands[command.id]) {
            command.callback = callback;
            Kontomatik.commands[command.id] = command;
            Kontomatik.commandQueue.push(command);
            if (Kontomatik.currentCommand == null) {
                Kontomatik.executeNextCommand();
            }
        }
    }

    private static executeNextCommand() {
        let command = Kontomatik.commandQueue.shift();
        if (command) {
            Kontomatik.currentCommand = command;
            Kontomatik.socket.send(command);
        }
    }

    private static onMessage(message: Object) {
        if (message["Error"]) {
            Kontomatik.handleError(message);
        } else {
            Kontomatik.handleCommandAnswer(message);
        }
    }

    private static handleCommandAnswer(message: Object) {
        let id = message["Id"];
        if (Kontomatik.commands[id]) {
            Kontomatik.commands[id].callback(message["Data"]);
            delete Kontomatik.commands[id];
            Kontomatik.currentCommand = null;
            Kontomatik.executeNextCommand();
        }
    }

    private static handleError(message: Object) {
        AlertBox.show(message["Error"],
            'Kontomatik API Error',
            '<a href="/" class="btn btn-primary" role="button">Restart</a>');
    }

    private static getInternalWidgetOptions(options: KontomatikWidgetOptions): InternalKontomatikWidgetOptions {
        let internalOptions = new InternalKontomatikWidgetOptions();
        internalOptions.client = options.client;
        internalOptions.divId = options.divId;
        internalOptions.target = options.target;
        internalOptions.externalOwnerId = options.externalOwnerId;
        internalOptions.onSuccess = Kontomatik.getInternalOnSuccess(options);
        return internalOptions;
    }

    private static getInternalOnSuccess(options: KontomatikWidgetOptions): any {
        return (target: string, sessionId: string, sessionIdSignature: string) => {
            let session = new KontomatikSession();
            session.sessionId = sessionId + ':' + sessionIdSignature;
            session.sessionIdSignature = sessionIdSignature;
            session.target = target;
            session.externalOwnerId = options.externalOwnerId;
            options.onSuccess(session);
        }
    }

    public static randomString(length) {
        let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
}

export class KontomatikWidgetOptions {
    client: string;
    divId: string = 'kontomatik';
    target: string;
    externalOwnerId: string = Kontomatik.randomString(20);
    onSuccess: (session: KontomatikSession) => void;
}

class InternalKontomatikWidgetOptions {
    client: string;
    divId: string;
    target: string;
    externalOwnerId: string;
    onSuccess: (target: string, sessionId: string, sessionIdSignature: string) => void;
}

export class KontomatikSession {
    target: string;
    sessionId: string;
    sessionIdSignature: string;
    externalOwnerId: string;
}

export class ImportOwnerDetailsCommand implements Command {
    id: string = "ImportOwnerDetailsCommand";
    callback: (xml: string) => void;
}

export class ImportTransactionsCommand implements Command {
    id: string = "ImportTransactionsCommand";
    iban: string;
    since: Date;
    callback: (xml: string) => void;
}

export class ImportAccountsCommand implements Command {
    id: string = "ImportAccountsCommand";
    callback: (xml: string) => void;
}

export class FinHealthIndicatorCommand implements Command {
    id: string = "FinHealthIndicatorCommand";
    callback: (xml: string) => void;
}

interface Command {
    id: string;
    callback: (xml: string) => void;
}
