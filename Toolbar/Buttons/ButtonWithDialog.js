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
        var dialogClasses = $.Arte.Toolbar.configuration.classes.dialog;
        var insertLinkClasses = dialogClasses.insertLink;
        $.extend(this, new $.Arte.Toolbar.ButtonWithDialog(toolbar, buttonName, config));
        //var insertDialogClassName = "insert-link";
        
        var insertContent = function(contentToInsert) {
            $.each(toolbar.selectionManager.getSelectedFields(), function() {
                this.insert.call(this, { commandValue: contentToInsert });
            });
        };
        
       // var dialogContent;
        var getDialogContent = function() {
          //  dialogContent = $("<div>").addClass(insertDialogClassName)

            var dialogContent = $("<div>").addClass("input-prepend input-append").on("mousedown ", function(e) {
                e.stopPropagation();
            });;
            $("<span>").html("Text to Show: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " textToShow").attr({ type: "text" }).appendTo(dialogContent).css({ height: "auto" });
            $("<span>").html("Url: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " url").attr({ type: "text" }).appendTo(dialogContent).css({ height: "auto" });
            $("<a>").attr("href", "#").addClass(insertLinkClasses.button + " ok").html("&#x2713").appendTo(dialogContent);
            $("<a>").attr("href", "#").addClass(insertLinkClasses.button + " cancel").html("&#x2717").appendTo(dialogContent);
            //dialogContent.append(div);

            return dialogContent;
        };

        this.showPopup = function() {
            $("." + dialogClasses.container).append(getDialogContent());

            var savedSelection = rangy.saveSelection();
            $("." + dialogClasses.container + " .textToShow").val(rangy.getSelection().toHtml());
            $("." + dialogClasses.container + " .ok").on("click", function() {
                rangy.restoreSelection(savedSelection);

                var selectedcontent = rangy.getSelection().toHtml();
                var contentToInsert = $("." + dialogClasses.container + " .url").val();
                if (contentToInsert) {
                    var html = $("<a>").attr("href", contentToInsert).html(selectedcontent || contentToInsert);
                    insertContent(html.get(0).outerHTML);
                }
                closePopup();
            });

            $("." + dialogClasses.container + " .cancel").on("click", function() {
                rangy.restoreSelection(savedSelection);
                closePopup();
            });

            $("." + dialogClasses.container).show();
        };
        
         var closePopup = function() {
            //$("." + insertDialogClassName + " input").val("");
             $("." + dialogClasses.container).children().remove();   
        };

    };
})(jQuery);


(function () {
    $.Arte.Toolbar.InsertImage = function (toolbar, buttonName, config) {
        var dialogClasses = $.Arte.Toolbar.configuration.classes.dialog;
        var insertLinkClasses = dialogClasses.insertLink;
        $.extend(this, new $.Arte.Toolbar.ButtonWithDialog(toolbar, buttonName, config));

        var insertContent = function (contentToInsert) {
            $.each(toolbar.selectionManager.getSelectedFields(), function () {
                this.insert.call(this, { commandValue: contentToInsert });
            });
        };

        // var dialogContent;
        var getDialogContent = function () {
            //  dialogContent = $("<div>").addClass(insertDialogClassName)

            var dialogContent = $("<div>").addClass("input-prepend input-append").on("mousedown ", function (e) {
                e.stopPropagation();
            });;
            $("<span>").html("Text to Show: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " textToShow").attr({ type: "text" }).appendTo(dialogContent).css({ height: "auto" });
            $("<span>").html("Url: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " url").attr({ type: "text" }).appendTo(dialogContent).css({ height: "auto" });
            $("<a>").attr("href", "#").addClass(insertLinkClasses.button + " ok").html("&#x2713").appendTo(dialogContent);
            $("<a>").attr("href", "#").addClass(insertLinkClasses.button + " cancel").html("&#x2717").appendTo(dialogContent);
            //dialogContent.append(div);

            return dialogContent;
        };

        this.showPopup = function () {
            $("." + dialogClasses.container).append(getDialogContent());

            var savedSelection = rangy.saveSelection();
            $("." + dialogClasses.container + " .textToShow").val(rangy.getSelection().toHtml());
            $("." + dialogClasses.container + " .ok").on("click", function () {
                rangy.restoreSelection(savedSelection);

                var selectedcontent = rangy.getSelection().toHtml();
                var contentToInsert = $("." + dialogClasses.container + " .url").val();
                if (contentToInsert) {
                    var html = $("<img>").attr("src", contentToInsert);
                    insertContent(html.get(0).outerHTML);
                }
                closePopup();
            });

            $("." + dialogClasses.container + " .cancel").on("click", function () {
                rangy.restoreSelection(savedSelection);
                closePopup();
            });

            $("." + dialogClasses.container).show();
        };

        var closePopup = function () {
            //$("." + insertDialogClassName + " input").val("");
            $("." + dialogClasses.container).children().remove();
        };

    };
})(jQuery);