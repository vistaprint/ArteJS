(function($) {
    $.Arte.Toolbar.ButtonWithDialog = function(toolbar, buttonName, config) {
        $.extend(this, new $.Arte.Toolbar.Button(toolbar, buttonName, config));
        var insertDialogClassName = "insert-dialog";
        var dialogContent;
        var getDialogContent = function() {
            if (!dialogContent) {
                dialogContent = $("<div>").addClass("insert-dialog").on("mousedown ", function(e) {
                    e.stopPropagation();
                });

                var div = $("<div>").addClass("input-prepend input-append");
                $("<span>").html("Content: ").addClass("add-on").appendTo(div);
                $("<input>").addClass("input-medium").attr({ type: "text" }).appendTo(div).css({ height: "auto" });
                $("<a>").attr("href", "#").addClass("btn ok").html("&#x2713").appendTo(div);
                $("<a>").attr("href", "#").addClass("btn cancel").html("&#x2717").appendTo(div);
                dialogContent.append(div);
            }
            return dialogContent;
        };

        var insertContent = function(contentToInsert) {
            $.each(toolbar.selectionManager.getSelectedFields(), function() {
                this.insert.call(this, { commandValue: contentToInsert });
            });
        };

        var showPopup = function() {
            var content = getDialogContent();
            $(".inline-dialog").append(content);

            var savedSelection = rangy.saveSelection();

            $("." + insertDialogClassName + " .ok").on("click", function() {
                rangy.restoreSelection(savedSelection);

                var selectedcontent = rangy.getSelection().toHtml();
                var contentToInsert = $("." + insertDialogClassName + " input").val();
                if (contentToInsert) {
                    var html = $("<a>").attr("href", contentToInsert).html(selectedcontent || contentToInsert);
                    insertContent(html.get(0).outerHTML);
                }
                closePopup();
            });

            $("." + insertDialogClassName + " .cancel").on("click", function() {
                rangy.restoreSelection(savedSelection);
                closePopup();
            });

            $(".inline-dialog").show();
        };

        var closePopup = function() {
            $("." + insertDialogClassName + " input").val("");
            $(".inline-dialog").html("");
        };

        this.executeCommand = function() {
            showPopup();
        };

        this.refresh = function() {
        };
    };
})(jQuery);