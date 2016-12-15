/// <reference path="./jquery/jquery.d.ts" />
System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ButtonSize, ButtonColor, ActionButton;
    return {
        setters: [],
        execute: function () {/// <reference path="./jquery/jquery.d.ts" />
            (function (ButtonSize) {
                ButtonSize[ButtonSize["Normal"] = 0] = "Normal";
                ButtonSize[ButtonSize["Small"] = 1] = "Small";
            })(ButtonSize || (ButtonSize = {}));
            exports_1("ButtonSize", ButtonSize);
            (function (ButtonColor) {
                ButtonColor[ButtonColor["Primary"] = 0] = "Primary";
                ButtonColor[ButtonColor["Info"] = 1] = "Info";
                ButtonColor[ButtonColor["Success"] = 2] = "Success";
            })(ButtonColor || (ButtonColor = {}));
            exports_1("ButtonColor", ButtonColor);
            ActionButton = (function () {
                function ActionButton(caption, size) {
                    if (size === void 0) { size = ButtonSize.Normal; }
                    var buttonHtml = ActionButton.createButtonHtml(caption, size);
                    this.$button = $($.parseHTML(buttonHtml));
                }
                ActionButton.prototype.appendTo = function (selector) {
                    this.$button.appendTo(selector);
                };
                ActionButton.prototype.setCaption = function (caption) {
                    this.$button.text(caption);
                };
                ActionButton.prototype.setLoading = function () {
                    this.setAction(function () { });
                    var currentButtonWidth = this.$button.innerWidth();
                    this.$button.html('<i class="fa fa-refresh fa-spin"></i>');
                    this.setColor(ButtonColor.Info);
                };
                ActionButton.prototype.setColor = function (color) {
                    this.$button.removeClass("btn-primary btn-info btn-success");
                    this.$button.addClass(ActionButton.getColorClass(color));
                };
                ActionButton.prototype.setAction = function (action) {
                    this.$button.off("click");
                    this.$button.on("click", action);
                };
                ActionButton.prototype.get$ = function () {
                    return this.$button;
                };
                ActionButton.prototype.remove = function () {
                    this.$button.remove();
                };
                ActionButton.getColorClass = function (color) {
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
                };
                ActionButton.createButtonHtml = function (caption, size) {
                    if (size === void 0) { size = ButtonSize.Normal; }
                    if (size == ButtonSize.Normal) {
                        return ActionButton.createNormalButtonHtml(caption);
                    }
                    if (size == ButtonSize.Small) {
                        return ActionButton.createSmallButtonHtml(caption);
                    }
                };
                ActionButton.createNormalButtonHtml = function (caption) {
                    return ActionButton.createButtonHtmlFromTemplate(caption);
                };
                ActionButton.createSmallButtonHtml = function (caption) {
                    return ActionButton.createButtonHtmlFromTemplate(caption, "btn-sm");
                };
                ActionButton.createButtonHtmlFromTemplate = function (caption, sizeClass) {
                    if (sizeClass === void 0) { sizeClass = "btn-lg"; }
                    return "<button type=\"button\" class=\"btn btn-block btn-primary " + sizeClass + "\">" + caption + "</button>";
                };
                return ActionButton;
            }());
            exports_1("ActionButton", ActionButton);
        }
    };
});
//# sourceMappingURL=ActionButton.js.map