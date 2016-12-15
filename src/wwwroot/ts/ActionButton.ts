/// <reference path="./jquery/jquery.d.ts" />

export enum ButtonSize {
    Normal,
    Small
}

export enum ButtonColor {
    Primary,
    Info,
    Success
}

export class ActionButton {

    private $button: JQuery;

    constructor(caption: string, size: ButtonSize = ButtonSize.Normal) {
        let buttonHtml: string = ActionButton.createButtonHtml(caption, size);
        this.$button = $($.parseHTML(buttonHtml));
    }

    public appendTo(selector: string) {
        this.$button.appendTo(selector);
    }

    public setCaption(caption: string) {
        this.$button.text(caption);
    }

    public setLoading() {
        this.setAction(() => { });
        let currentButtonWidth: number = this.$button.innerWidth();
        this.$button.html('<i class="fa fa-refresh fa-spin"></i>');
        this.setColor(ButtonColor.Info);
    }

    public setColor(color: ButtonColor) {
        this.$button.removeClass("btn-primary btn-info btn-success");
        this.$button.addClass(ActionButton.getColorClass(color));
    }

    public setAction(action: () => any) {
        this.$button.off("click");
        this.$button.on("click", action);
    }

    public get$() {
        return this.$button;
    }

    public remove() {
        this.$button.remove();
    }

    private static getColorClass(color: ButtonColor): string {
        switch (color) {
            case ButtonColor.Primary:
                return "btn-primary";
            case ButtonColor.Info:
                return "btn-info";
            case ButtonColor.Success:
                return "btn-success";
            default:
                return "";
        }
    }

    private static createButtonHtml(caption: string, size: ButtonSize = ButtonSize.Normal): string {
        if (size == ButtonSize.Normal) {
            return ActionButton.createNormalButtonHtml(caption);
        }
        if (size == ButtonSize.Small) {
            return ActionButton.createSmallButtonHtml(caption);
        }
    }

    private static createNormalButtonHtml(caption: string): string {
        return ActionButton.createButtonHtmlFromTemplate(caption);
    }

    private static createSmallButtonHtml(caption: string): string {
        return ActionButton.createButtonHtmlFromTemplate(caption, "btn-sm");
    }

    private static createButtonHtmlFromTemplate(caption: string, sizeClass = "btn-lg"): string {
        return `<button type="button" class="btn btn-block btn-primary ${sizeClass}">${caption}</button>`;
    }
}
