declare let embedKontomatik: any;
import { KontomatikSocket } from "./KontomatikSocket"
import { AlertBox } from "./AlertBox"

export class Kontomatik {

    private static socket: KontomatikSocket;
    private static commands: { [id: string]: Command } = {};

    public static initWidget(options: KontomatikOptions) {
        embedKontomatik(Kontomatik.getInternalOptions(options));
    }

    public static initSocket(session: KontomatikSession) {
        Kontomatik.socket = new KontomatikSocket(session, Kontomatik.onMessage);
    }

    public static getOwnerDetails(callback: (xml: string) => void) {
        let command: Command = new ImportOwnerDetailsCommand();
        Kontomatik.executeCommand(command, callback);
    }

    public static getAccounts(callback: (xml: string) => void) {
        let command: Command = new ImportAccountsCommand();
        Kontomatik.executeCommand(command, callback);
    }

    public static getTransactions(iban: string, since: Date, callback: (xml: string) => void) {
        let command: ImportTransactionsCommand = new ImportTransactionsCommand();
        command.id += iban;
        command.iban = iban;
        command.since = since;
        Kontomatik.executeCommand(command, callback);
    }

    public static getFinHealthIndicator(callback: (xml: string) => void) {
        let command: Command = new FinHealthIndicatorCommand();
        Kontomatik.executeCommand(command, callback);
    }

    private static executeCommand(command: Command, callback: (xml: string) => void) {
        if (!Kontomatik.commands[command.id]) {
            command.callback = callback;
            Kontomatik.commands[command.id] = command;
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
        }
    }

    private static handleError(message: Object) {
        AlertBox.show(message["Error"],
            'Kontomatik API Error',
            '<a href="/" class="btn btn-primary" role="button">Restart</a>');
    }

    private static getInternalOptions(options: KontomatikOptions): InternalKontomatikOptions {
        let internalOptions = new InternalKontomatikOptions();
        internalOptions.client = options.client;
        internalOptions.divId = options.divId;
        internalOptions.target = options.target;
        internalOptions.client = options.client;
        internalOptions.onSuccess = Kontomatik.getInternalOnSuccess(options);
        return internalOptions;
    }
    
    private static getInternalOnSuccess(options: KontomatikOptions): any {
        return (target: string, sessionId: string, sessionIdSignature: string) => {
            let session = new KontomatikSession();
            session.sessionId = sessionId + ':' + sessionIdSignature;
            session.sessionIdSignature = sessionIdSignature;
            session.target = target;
            options.onSuccess(session);
        }
    }
}

export class KontomatikOptions {
    client: string;
    divId: string = 'kontomatik';
    target: string;
    onSuccess: (session: KontomatikSession) => void;
}

class InternalKontomatikOptions {
    client: string;
    divId: string;
    target: string;
    onSuccess: (target: string, sessionId: string, sessionIdSignature: string) => void;
}

export class KontomatikSession {
    target: string;
    sessionId: string;
    sessionIdSignature: string;
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