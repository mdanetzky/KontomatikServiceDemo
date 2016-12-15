System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var AlertBox;
    return {
        setters: [],
        execute: function () {
            /// <reference path="./jquery/jquery.d.ts" />
            AlertBox = (function () {
                function AlertBox() {
                }
                AlertBox.show = function (message, title, buttons) {
                    if (title === void 0) { title = 'Alert'; }
                    if (buttons === void 0) { buttons = '<button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>'; }
                    AlertBox.ensureHtmlIsEmbedded();
                    $("#kontomatik-alert-title").html(title);
                    $("#kontomatik-alert-buttons").html(buttons);
                    $("#kontomatik-alert-body").html('<p style="word-wrap: break-word;">' + message + '</p>');
                    $("#kontomatik-alert-box").modal();
                };
                AlertBox.ensureHtmlIsEmbedded = function () {
                    if (!document.getElementById("kontomatik-alert-box")) {
                        $("body").append(AlertBox.html);
                    }
                };
                return AlertBox;
            }());
            AlertBox.html = "\n    <div id=\"kontomatik-alert-box\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\">\n\t\t<div class=\"modal-dialog\" role=\"document\">\n\t\t\t<div class=\"modal-content\">\n\t\t\t\t<div class=\"modal-header\">\n\t\t\t\t\t<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n\t\t\t\t\t<h4 id=\"kontomatik-alert-title\" class=\"modal-title\">Alert</h4>\n\t\t\t\t</div>\n\t\t\t\t<div id=\"kontomatik-alert-body\" class=\"modal-body\">\n\t\t\t\t\t<p>Default alert body</p>\n\t\t\t\t</div>\n\t\t\t\t<div id=\"kontomatik-alert-buttons\" class=\"modal-footer\"></div>\n\t\t\t</div>\n\t\t\t<!-- /.modal-content -->\n\t\t</div>\n\t\t<!-- /.modal-dialog -->\n\t</div>\n\t<!-- /.modal -->\n\t";
            exports_1("AlertBox", AlertBox);
        }
    };
});
//# sourceMappingURL=AlertBox.js.map