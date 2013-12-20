(function($) {
    $.Arte.Toolbar.ButtonWithDialog = function (toolbar, buttonName, config) {
        var me = this;
        $.Arte.Toolbar.Button.call(this, toolbar, buttonName, config);
        //$.extend(this, new $.Arte.Toolbar.Button(toolbar, buttonName, config));
        var dialogClasses = $.Arte.Toolbar.configuration.classes.dialog;
        //var me = this;
        this.executeCommand = function() {
            me.showPopup();
        };

        function getDialogContent() {
           var dialogContent = me.getDialogContent();
           $("<a>").attr("href", "#").addClass(dialogClasses.button + " ok").html("&#x2713").appendTo(dialogContent);
           $("<a>").attr("href", "#").addClass(dialogClasses.button + " cancel").html("&#x2717").appendTo(dialogContent);
            return dialogContent;
        }

        this.showPopup = function() {
            var dialogContainer = $("." + dialogClasses.container);
            dialogContainer.append(getDialogContent());
            dialogContainer.on("mousedown ", function (e) {
                e.stopPropagation();
            });
            var savedSelection = rangy.saveSelection();

            me.addContent();

            dialogContainer.find(".ok").on("click", function() {
                rangy.restoreSelection(savedSelection);
                me.onOk();
                me.closePopup();
            });

            dialogContainer.find(".cancel").on("click", function() {
                rangy.restoreSelection(savedSelection);
                me.closePopup();
            });
            
            dialogContainer.show();
        };

        this.closePopup = function() {
            $("." + dialogClasses.container).children().each(function() {
                this.remove();
            });
        };
        return me;
    };
})(jQuery);

(function() {
    $.Arte.Toolbar.InsertLink = function(toolbar, buttonName, config) {
        var dialogClasses = $.Arte.Toolbar.configuration.classes.dialog;
        var insertLinkClasses = dialogClasses.insertLink;
        var me = this;
        $.Arte.Toolbar.ButtonWithDialog.call(this, toolbar, buttonName, config);
        
        var insertContent = function(contentToInsert) {
            $.each(toolbar.selectionManager.getSelectedFields(), function() {
                this.insert.call(this, { commandValue: contentToInsert });
            });
        };
        
        this.getDialogContent = function() {
            var dialogContent = $("<div>").addClass("input-prepend input-append");
            $("<span>").html("Text to Show: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " textToShow").attr({ type: "text" }).appendTo(dialogContent).css({ height: "auto" });
            $("<span>").html("Url: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " url").attr({ type: "text" }).appendTo(dialogContent).css({ height: "auto" });
            return dialogContent;
        };

        this.onOk = function() {
            var selectedcontent = rangy.getSelection().toHtml();
            var contentToInsert = $("." + dialogClasses.container + " .url").val();
            if (contentToInsert) {
                var html = $("<a>").attr("href", contentToInsert).html(selectedcontent || contentToInsert);
                insertContent(html.get(0).outerHTML);
            }
        };

        this.addContent = function () {
            $("." + dialogClasses.container + " .textToShow").val(rangy.getSelection().toHtml());
        };

    };
})(jQuery);

(function () {
    $.Arte.Toolbar.InsertImage = function (toolbar, buttonName, config) {
        var dialogClasses = $.Arte.Toolbar.configuration.classes.dialog;
        var insertLinkClasses = dialogClasses.insertLink;
        $.Arte.Toolbar.ButtonWithDialog.call(this, toolbar, buttonName, config);

        var insertContent = function (contentToInsert) {
            $.each(toolbar.selectionManager.getSelectedFields(), function () {
                this.insert.call(this, { commandValue: contentToInsert });
            });
        };

        this.getDialogContent = function () {
            var dialogContent = $("<div>").addClass("input-prepend input-append");
            $("<span>").html("Text to Show: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " textToShow").attr({ type: "text" }).appendTo(dialogContent).css({ height: "auto" });
            $("<span>").html("Url: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " url").attr({ type: "text" }).appendTo(dialogContent).css({ height: "auto" });
            return dialogContent;
        };

        this.onOk = function() {
            var contentToInsert = $("." + dialogClasses.container + " .url").val();
            if (contentToInsert) {
                var html = $("<img>").attr("src", contentToInsert);
                insertContent(html.get(0).outerHTML);
            }
        };

        this.addContent = function () {
            $("." + dialogClasses.container + " .textToShow").val(rangy.getSelection().toHtml());
        };
    };
})(jQuery);