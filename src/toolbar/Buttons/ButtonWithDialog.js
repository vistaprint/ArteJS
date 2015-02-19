(function($) {
    $.Arte.Toolbar.ButtonWithDialog = function(toolbar, buttonName, config) {
        var me = this;
        $.Arte.Toolbar.Button.call(this, toolbar, buttonName, config);

        var dialogClasses = $.Arte.Toolbar.configuration.classes.dialog;

        this.executeCommand = function() {
            if (me.isEnabled()) {
                me.showPopup();
            }
        };

        this.getOkCancelControl = function() {
            var wrapper = $("<div>").addClass(dialogClasses.okCancel);
            $("<a>").attr("href", "#").addClass(dialogClasses.button + " ok").html("&#x2713").appendTo(wrapper);
            $("<a>").attr("href", "#").addClass(dialogClasses.button + " cancel").html("&#x2717").appendTo(wrapper);
            return wrapper;
        };

        this.showPopup = function() {
            var dialogContainer = $("." + dialogClasses.container);
            var contentWrapper = $("<div>").addClass(dialogClasses.contentWrapper).appendTo(dialogContainer);
            contentWrapper.append(me.getDialogContent());
            contentWrapper.append(me.getOkCancelControl());
            dialogContainer.on("mousedown ", function(e) {
                e.stopPropagation();
            });
            var savedSelection = rangy.saveSelection();

            me.addContent();

            contentWrapper.find(".ok").on("click", function() {
                rangy.restoreSelection(savedSelection);
                me.onOk();
                me.closePopup();
            });

            contentWrapper.find(".cancel").on("click", function() {
                rangy.restoreSelection(savedSelection);
                me.closePopup();
            });

            dialogContainer.show({
                duration: 200,
                complete: function() {
                    contentWrapper.css("margin-top", -1 * contentWrapper.height() / 2);
                }
            });
        };

        this.closePopup = function() {
            var dialogContainer = $("." + dialogClasses.container);
            dialogContainer.children().each(function() {
                this.remove();
            });
            dialogContainer.hide();
        };
        return me;
    };
})(jQuery);

(function() {
    $.Arte.Toolbar.InsertLink = function(toolbar, buttonName, config) {
        var dialogClasses = $.Arte.Toolbar.configuration.classes.dialog;
        var insertLinkClasses = dialogClasses.insertLink;

        $.Arte.Toolbar.ButtonWithDialog.call(this, toolbar, buttonName, config);

        var insertContent = function(contentToInsert) {
            $.each(toolbar.selectionManager.getSelectedEditors(), function() {
                this.insert.call(this, {
                    commandValue: contentToInsert
                });
            });
        };

        this.getDialogContent = function() {
            var textToShow = $("<div>").addClass(dialogClasses.insertLink.textToShow);
            $("<span>").html("Text to Show: ").addClass(dialogClasses.label).appendTo(textToShow);
            $("<input>").addClass(insertLinkClasses.input + " textToShow").attr({
                type: "text"
            }).appendTo(textToShow);

            var urlInput = $("<div>").addClass(dialogClasses.insertLink.urlInput);
            $("<span>").html("Url: ").addClass(dialogClasses.label).appendTo(urlInput);
            $("<input>").addClass(insertLinkClasses.input + " url").attr({
                type: "text"
            }).appendTo(urlInput);

            var dialogContent = $("<div>").addClass(dialogClasses.content).append(textToShow).append(urlInput);
            return dialogContent;
        };

        this.onOk = function() {
            var textToShow = $("." + dialogClasses.container + " ." + dialogClasses.insertLink.textToShow + " input").val();
            var url = $("." + dialogClasses.container + " ." + dialogClasses.insertLink.urlInput + " input").val();
            if (url) {
                var html = $("<a>").attr("href", url).html(textToShow || url);
                insertContent(html.get(0).outerHTML);
            }
        };

        this.addContent = function() {
            $("." + dialogClasses.container + " .textToShow").val(rangy.getSelection().toHtml());
        };

    };
})(jQuery);

(function() {
    $.Arte.Toolbar.InsertImage = function(toolbar, buttonName, config) {
        var dialogClasses = $.Arte.Toolbar.configuration.classes.dialog;
        var insertLinkClasses = dialogClasses.insertLink;
        $.Arte.Toolbar.ButtonWithDialog.call(this, toolbar, buttonName, config);

        var insertContent = function(contentToInsert) {
            $.each(toolbar.selectionManager.getSelectedEditors(), function() {
                this.insert.call(this, {
                    commandValue: contentToInsert
                });
            });
        };

        this.getDialogContent = function() {
            var dialogContent = $("<div>").addClass("input-prepend input-append");
            $("<span>").html("Text to Show: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " textToShow").attr({
                type: "text"
            }).appendTo(dialogContent).css({
                height: "auto"
            });
            $("<span>").html("Url: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " url").attr({
                type: "text"
            }).appendTo(dialogContent).css({
                height: "auto"
            });
            return dialogContent;
        };

        this.onOk = function() {
            var contentToInsert = $("." + dialogClasses.container + " .url").val();
            if (contentToInsert) {
                var html = $("<img>").attr("src", contentToInsert);
                insertContent(html.get(0).outerHTML);
            }
        };

        this.addContent = function() {
            $("." + dialogClasses.container + " .textToShow").val(rangy.getSelection().toHtml());
        };
    };
})(jQuery);
