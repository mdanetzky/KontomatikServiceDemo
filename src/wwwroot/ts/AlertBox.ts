/// <reference path="./jquery/jquery.d.ts" />
export class AlertBox {

    static show(message: string, title: string = 'Alert',
        buttons: string = '<button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>') {
        AlertBox.ensureHtmlIsEmbedded();
        $("#kontomatik-alert-title").html(title);
        $("#kontomatik-alert-buttons").html(buttons);
        $("#kontomatik-alert-body").html('<p style="word-wrap: break-word;">' + message + '</p>');
        $("#kontomatik-alert-box").modal();
    }

    private static ensureHtmlIsEmbedded() {
        if (!document.getElementById("kontomatik-alert-box")) {
            $("body").append(AlertBox.html);
        }
    }

    private static html = `
    <div id="kontomatik-alert-box" class="modal fade" tabindex="-1" role="dialog">
		<div class="modal-dialog" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					<h4 id="kontomatik-alert-title" class="modal-title">Alert</h4>
				</div>
				<div id="kontomatik-alert-body" class="modal-body">
					<p>Default alert body</p>
				</div>
				<div id="kontomatik-alert-buttons" class="modal-footer"></div>
			</div>
			<!-- /.modal-content -->
		</div>
		<!-- /.modal-dialog -->
	</div>
	<!-- /.modal -->
	`;
}
