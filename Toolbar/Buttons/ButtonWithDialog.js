(function($) {
    $.Arte.Toolbar.ButtonWithDialog = function(toolbar, buttonName, config) {
        $.extend(this, new $.Arte.Toolbar.Button(toolbar, buttonName, config));
        
        this.executeCommand = function() {
            this.showPopup();
        };
    };
})(jQuery);

(function() {
    $.Arte.Toolbar.InsertLink = function(toolbar, buttonName, config) {
        $.extend(this, new $.Arte.Toolbar.ButtonWithDialog(toolbar, buttonName, config));
        var insertDialogClassName = "insert-link";
        
        var insertContent = function(contentToInsert) {
            $.each(toolbar.selectionManager.getSelectedFields(), function() {
                this.insert.call(this, { commandValue: contentToInsert });
            });
        };
        
        var dialogContent;
        var getDialogContent = function() {
            dialogContent = $("<div>").addClass(insertDialogClassName).on("mousedown ", function(e) {
                e.stopPropagation();
            });

            var div = $("<div>").addClass("input-prepend input-append");
            $("<span>").html("Text to Show: ").addClass("add-on").appendTo(div);
            $("<input>").addClass("input-medium testToShow").attr({ type: "text" }).appendTo(div).css({ height: "auto" });
            $("<span>").html("Url: ").addClass("add-on").appendTo(div);
            $("<input>").addClass("input-medium").attr({ type: "text" }).appendTo(div).css({ height: "auto" });
            $("<a>").attr("href", "#").addClass("btn ok").html("&#x2713").appendTo(div);
            $("<a>").attr("href", "#").addClass("btn cancel").html("&#x2717").appendTo(div);
            dialogContent.append(div);

            return dialogContent;
        };

        this.showPopup = function() {
            var content = getDialogContent();
            $(".inline-dialog").append(content);

            var savedSelection = rangy.saveSelection();
            $("." + insertDialogClassName + " .testToShow").val(rangy.getSelection().toHtml());
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
             $(".inline-dialog").children().remove();   
        };

    };
})(jQuery);