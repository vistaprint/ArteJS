(function($) {
    $.fn.ArteToolbar = function(options) {
        if (options && typeof(options) === "object") {
            options = $.extend({}, $.Arte.Toolbar.Defaults, options);
        }
        var result = $();
        this.each(function() {
            var toolbar = $(this).data("ArteToolbar");
            if (options && typeof (options) === "string") {
                // Most likely this is a method call
                var methodName = options;
                if (this.constructor === $.Arte.Toolbar) {
                    toolbar = this;
                }

                if (!toolbar) {
                    throw "This is not a arte toolbar.";
                }

                var returnValue = toolbar[methodName].call(toolbar);
                result.push(returnValue);
            }
            else {
                if (!toolbar) {
                    $.extend(options, { element: $(this) });
                    toolbar = new $.Arte.Toolbar(options);
                    $(this).data("ArteToolbar", toolbar);
                }
                result.push(toolbar);
            }
        });
        return result;
    };


    $.Arte.Toolbar = function (options) {
        var me = this;
        
        me.$el = options.element;

        me.$el.on({
            "click mousedown mouseup": function (e) {
                e.stopPropagation();
                e.preventDefault();
            }
        });

        // Clear the selection if user clicks outside of the editor
        $("body").on({
            click: function () {
                me.selectionManager.clear();
                me.refresh();
            }
        });

        var buttons = [];
        // Initialize and render each of the button
        $.each(options.buttons, function (index, buttonName) {
            var config = $.Arte.Toolbar.configuration.buttons[buttonName];
            var button = new config.js(me, buttonName, config);
            button.render();

            buttons.push(button);
        });
        
        // Create the containers for the inline dialog and tooltip
        var classes = $.Arte.Toolbar.configuration.classes;
        $("<div>").addClass(classes.dialog.container).appendTo(me.$el);
        $("<div>").addClass(classes.tooltip.container).appendTo(me.$el);

        // public api
        this.refresh = function () {
            var selectedField = me.selectionManager.getSelectedEditors()[0];
            var state = (selectedField) ? selectedField.getState() : {};
            $.each(buttons, function () {
                this.refresh(state);
            });
        };

        this.destroy = function () {
            me.$el.removeData("ArteToolbar");

            $.each(buttons, function () {
                this.unrender();
            });
            $("." + classes.dialog.container).remove();
            $("." + classes.tooltip.container).remove();
            me.$el.off();
        };

        // Setup the selection manager
        me.selectionManager = new $.Arte.Toolbar.SelectionManager();
        me.selectionManager.initialize({ editor: options.editor });
        me.selectionManager.on({
            selectionchanged: me.refresh
        });

        me.refresh();
    };
})(jQuery);
/// dependencies: Toolbar
(function ($) {
    $.Arte.Toolbar.Button = function (toolbar, buttonName, config) {
        var me = this;
        me.element = null;
        me.commandName = config.commandName;
        var configuration = $.Arte.Toolbar.configuration;
        var classes = configuration.classes;
        var buttonClasses = classes.button;

        this.isApplicable = function ()
        {
            var editors = toolbar.selectionManager.getEditors(config.supportedTypes);
            return editors && editors.length;
        }

        this.isEnabled = function () {
            if (!configuration.requireEditorFocus) {
                return true;
            }
            
            var selectedEditors = toolbar.selectionManager.getSelectedEditors(config.supportedTypes);
            return (selectedEditors && selectedEditors.length);
        };

        this.executeCommand = function (commandValue) {
            if (this.isEnabled()) {
                var commandAttrType = (config && config.commandAttrType) ?
                    config.commandAttrType :
                    $.Arte.Toolbar.configuration.commandAttrType;

                var value = commandValue || (config.commandValue ? config.commandValue[commandAttrType] : "");

                if (!value && !config.supportsTagName && config.commandValue) {
                    commandAttrType = $.Arte.Toolbar.configuration.altCommandAttrType;
                    value = config.commandValue[commandAttrType];
                }

                var commandOptions = {
                    commandName: config.commandName,
                    commandValue: value,
                    commandAttrType: commandAttrType
                };

                var selectedEditors = toolbar.selectionManager.getSelectedEditors();
                if (!selectedEditors.length && !configuration.requireEditorFocus) {
                    selectedEditors = toolbar.selectionManager.getEditors();
                }

                $.each(selectedEditors, function () {
                    this[commandOptions.commandName].call(this, commandOptions);
                });
                toolbar.refresh();
            }
        };

        this.render = function () {
            var inner = $("<span>").addClass(buttonName).addClass(buttonClasses.inner);
            me.$el = $("<a>").attr("href", "#").addClass(buttonClasses.outer).html(inner);
            me.$el.on({
                mouseover: function (e) { me.showTooltip(e); },
                mouseout: function (e) { me.hideTooltip(e); },
                mousedown: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                },
                click: function (e) {
                    me.executeCommand.apply(me);
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            me.$el.appendTo(toolbar.$el);
        };

        this.unrender = function () {
            me.$el.off();
            me.$el.remove();
        };

        var isApplied = function (state) {
            if (config.commandName === "textAlign") {
                var defaultValue = config.commandValue[$.Arte.Toolbar.configuration.commandAttrType] ||
                    config.commandValue[$.Arte.Toolbar.configuration.altCommandAttrType];
                return state === defaultValue;
            }
            return state;
        };

        this.refresh = function (state) {
            if (this.isApplicable())
            {
                this.$el.show();
            } else
            {
                this.$el.hide();
                return;
            }

            if (this.isEnabled()) {
                me.$el.removeClass(buttonClasses.disabled);

                var op = isApplied(state[config.commandName]) ? "addClass" : "removeClass";
                me.$el[op](buttonClasses.selected);
            } else {
                me.$el.addClass(buttonClasses.disabled);
                me.$el.removeClass(buttonClasses.selected);
            }
        };

        this.showTooltip = function (mouseEvent) {
            if (me.$el.hasClass(buttonClasses.disabled)) {
                return;
            }

            var tooltip = toolbar.$el.find("." + classes.tooltip.container);
            tooltip.html(config.tooltip || this.commandName);

            // position the tooltip
            var elementOffset = toolbar.$el.offset();
            var x = mouseEvent.pageX - elementOffset.left + 15;
            var y = mouseEvent.pageY - elementOffset.top + 5;

            tooltip.css({ top: y, left: x });
            tooltip.show();
        };
        this.hideTooltip = function (mouseEvent) {
            if (me.$el.hasClass(buttonClasses.disabled)) {
                return;
            }

            toolbar.$el.find("." + classes.tooltip.container).hide();
        };
    };
})(jQuery);
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
            $.each(toolbar.selectionManager.getSelectedEditors(), function () {
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
            $.each(toolbar.selectionManager.getSelectedEditors(), function () {
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
(function ($) {
    $.Arte.Toolbar.ButtonWithDropDown = function (toolbar, buttonName, config) {
        var classes = $.Arte.Toolbar.configuration.classes;
        $.Arte.Toolbar.Button.call(this, toolbar, buttonName, config);
        var me = this;
        this.render = function (parent) {    
            var element = $("<select>").addClass(classes.select).addClass(this.name);

            $.each(config.options, function (index, option) {
                var display, value;
                if ($.isPlainObject(option)) {
                    display = option.display;
                    value = option.value;
                } else {
                    display = option;
                    value = typeof (option) === "string" ? option.toLowerCase() : option;
                }

                switch (buttonName) {
                    case "color":
                        // Browser apply colors differently (i.e. RGB, Hex etc.)
                        value = $("<div>").css("color", value).css("color");
                        break;
                    case "fontSize":
                        // Add, px to font size if it doesn't exist
                        if (!/px$/.test(value)) {
                            value += "px";
                        }
                        break;
                    case "fontFamily":
                        // Enforce adding quotes to multi-word font families or the one that start with number.
                        if (!value.match(/^\".+\"$/) && value.match(/^(?:\d.+|.+\s.+)$/)) {
                            value = "\'" + value + "\'";
                        }
                        break;
                }
                element.append($("<option>").attr("value", value).html(display));
            });
            element.appendTo(toolbar.$el);
            
            element.on({
                change: function () {
                    me.executeCommand.apply(me, [this.value]);
                },
                click: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                },
                mousedown: function (e) {
                    e.stopPropagation();
                },
                mouseover: function (e) { me.showTooltip(e); },
                mouseout: function (e) { me.hideTooltip(e); }
            });

            this.$el = element;
        };
        this.unrender = function () {
            me.$el.off();
            me.$el.remove();
        };

        this.refresh = function (state) {
            if (this.isApplicable()) {
                this.$el.show();
            } else {
                this.$el.hide();
                return;
            }

            var op = this.isEnabled() ? "removeAttr" : "attr";
            this.$el[op]("disabled", true);

            var value = state[config.commandName];
            this.$el.val(value);
        };
    };
})(jQuery);
/* File overview: configuration for the toolbar */
(function ($) {
    $.Arte.Toolbar = $.Arte.Toolbar || {};
    var buttonBase = $.Arte.Toolbar.Button;
    var buttonWithDropDown = $.Arte.Toolbar.ButtonWithDropDown;
    var commandAttrType = $.Arte.constants.commandAttrType;
    var editorTypes = $.Arte.constants.editorTypes;
    // Button Configuration
    $.Arte.Toolbar.configuration = {
        requireEditorFocus: true,
        // By default, this toolbar will apply rich text commands using styles
        commandAttrType: commandAttrType.styleName,
        // In case a command can't be applied using the commandAttrType, try applying the command using the altCommandAttrType
        altCommandAttrType: commandAttrType.styleName,
        buttons: {
            "bold": {
                js: buttonBase, // Button js to render and manage this button
                commandName: "bold", // Command to execute
                commandValue: { // command values for each command attribut type
                    "styleName": "bold",
                    "className": "arte-font-weight-bold"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                supportsTagName: true,
                tooltip: "Bold"
            },
            "italic": {
                js: buttonBase,
                commandName: "italic",
                commandValue: {
                    "styleName": "italic",
                    "className": "arte-font-style-italic"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                supportsTagName: true,
                tooltip: "Italic"
            },
            "underline": {
                js: buttonBase,
                commandName: "underline",
                commandValue: {
                    "styleName": "underline",
                    "className": "arte-text-decoration-underline"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                supportsTagName: true,
                tooltip: "Underline"
            },
            "blockquote": {
                js: buttonBase,
                commandName: "blockquote",
                supportedTypes: [editorTypes.richText],
                tooltip: "Blockquote"
            },
            "textAlignLeft": {
                js: buttonBase,
                icon: "../content/Icons/icons/text_align_left.png",
                commandName: "textAlign",
                commandValue: {
                    "styleName": "left",
                    "className": "arte-text-align-left"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Text align left"
            },
            "textAlignCenter": {
                js: buttonBase,
                icon: "../content/Icons/icons/text_align_center.png",
                commandName: "textAlign",
                commandValue: {
                    "styleName": "center",
                    "className": "arte-text-align-center"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Text align center"
            },
            "textAlignRight": {
                js: buttonBase,
                icon: "../content/Icons/icons/text_align_right.png",
                commandName: "textAlign",
                commandValue: {
                    "styleName": "right",
                    "className": "arte-text-align-right"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Text align right"
            },
            "h1": {
                js: buttonBase,
                commandName: "h1",
                icon: "../content/Icons/icons/text_heading_1.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H1"
            },
            "h2": {
                js: buttonBase,
                commandName: "h2",
                icon: "../content/Icons/icons/text_heading_2.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H2"
            },
            "h3": {
                js: buttonBase,
                commandName: "h3",
                icon: "../content/Icons/icons/text_heading_3.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H3"
            },
            "h4": {
                js: buttonBase,
                commandName: "h4",
                icon: "../content/Icons/icons/text_heading_4.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H4"
            },
            "h5": {
                js: buttonBase,
                commandName: "h5",
                icon: "../content/Icons/icons/text_heading_5.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H5"
            },
            "h6": {
                js: buttonBase,
                commandName: "h6",
                icon: "../content/Icons/icons/text_heading_6.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H6"
            },
            "subscript": {
                js: buttonBase,
                commandName: "subscript",
                icon: "../content/Icons/icons/text_subscript.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "Subscript"
            },
            "superscript": {
                js: buttonBase,
                commandName: "superscript",
                icon: "../content/Icons/icons/text_superscript.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "Superscript"
            },
            "fontSize": {
                js: buttonWithDropDown,
                icon: null,
                commandName: "fontSize",
                options: ["", 8, 10, 12, 15, 20],
                /*
                Alternate way of specifying the options where the display is different that the actual values
                options: [
                    { display: "", value: "" },
                    { display: "Smaller", value: 8 },
                    { display: "Small", value: 10 },
                    { display: "Medium", value: 12 },
                    { display: "Large", value: 15 },
                    { display: "Larger", value: 20 }
                ],
                Another way of specifying the options where the display is different that the actual values
                options: [
                    { display: "", value: "" },
                    { display: "Smaller", value: "arte-font-weight-8" },
                    { display: "Small", value: "arte-font-weight-10" },
                    { display: "Medium", value: "arte-font-weight-12" },
                    { display: "Large", value: "arte-font-weight-15" },
                    { display: "Larger", value: "arte-font-weight-20" }
                ],
                */
                acceptsParams: true,
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Font size"
            },
            "fontFamily": {
                js: buttonWithDropDown,
                icon: null,
                commandName: "fontFamily",
                options: ["", "Arial", "curier new", "Georgia", "Times New Roman"],
                acceptsParams: true,
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Font family"
            },
            "color": {
                js: buttonWithDropDown,
                icon: null,
                commandName: "color",
                options: ["", "Black", "Blue", "Green", "Red"],
                acceptsParams: true,
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Color"
            },
            "unorderedList": {
                js: buttonBase,
                commandName: "unorderedList",
                supportedTypes: [editorTypes.richText],
                tooltip: "Unordered list"
            },
            "orderedList": {
                js: buttonBase,
                commandName: "orderedList",
                supportedTypes: [editorTypes.richText],
                tooltip: "Ordered list"
            },
            "backgroundColor": {
                acceptsParams: true,
                js: buttonWithDropDown,
                commandName: "backgroundColor",
                options: ["", "Black", "Blue", "Green", "Red"],
                supportedTypes: [editorTypes.richText],
                tooltip: "Background Color"
            },
            "undo": {
                js: buttonBase,
                commandName: "undo",
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Undo"
            },
            "redo": {
                js: buttonBase,
                commandName: "redo",
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Redo"
            },
            "toolbarLineBreak": {
                // Inserts a line break into the toolbar.
                js: function () {
                    return {
                        render: function (parentElement) {
                            $("<div>").appendTo(parentElement);
                        },
                        refresh: function () {
                        }
                    };
                }
            },
            "insertLink": {
                commandName: "insert",
                js: $.Arte.Toolbar.InsertLink,
                supportedTypes: [editorTypes.richText],
                tooltip: "Insert link"
            },
            "insertImage": {
                commandName: "insert",
                js: $.Arte.Toolbar.InsertImage,
                supportedTypes: [editorTypes.richText],
                tooltip: "Insert Image"
            }
        },
        // Set of classes used to control the look-n-feel of the toolbar buttons
        classes: {
            "button": {
                "outer": "btn",
                "inner": "btn-inner",
                "disabled": "disabled",
                "selected": "selected"
            },
            "select": {
                "inner": "select"
            },
            "dialog": {
                "container": "inline-dialog",
                "button" : "btn",
                "insertLink":
                {
                    "button": "btn",
                    "label": "",
                    "input": ""
                },
                "insertImage":
                    {

                    }
            },
            "tooltip":
            {
                "container": "tooltip"
            }
        },
        commandConfig: {}
    };
})(jQuery);
(function ($) {
    $.Arte.Toolbar = $.Arte.Toolbar || {};
    $.Arte.Toolbar.SelectionManager = function() {
        var editors = $();
        var selectedEditors = [];

        var isValidSelection = function() {
            var userSelection = rangy.getSelection();
            var range = userSelection.getAllRanges()[0];
            if (range) {
                var textFields = this.getSelectedFields();
                return $.Arte.util.any(textFields, function(index, textField) {
                    return textField.$el.get(0) === range.startContainer || textField.$el.has(range.startContainer).get(0);
                });
            }
            return false;
        };

        this.getSelectedEditors = function(types) {
            if (types) {
                return $.Arte.util.filterCollection(selectedEditors, function (index, textField) {
                    return $.Arte.util.any(types, function(i, type) {
                        return textField.editorType === type;
                    });
                });
            }

            return selectedEditors;
        };

        this.getEditors = function (types) {
            if (types) {
                return $.Arte.util.filterCollection(editors, function (index, textField) {
                    return $.Arte.util.any(types, function (i, type) {
                        return textField.editorType === type;
                    });
                });
            }
            return editors;
        };

        this.initialize = function(options) {
            var me = this;
            var elements = options && options.editor ? $(options.editor) :
                $("[" + $.Arte.configuration.textFieldIdentifier + "]");

            editors = $.map(elements, function(element) {
                return $(element).Arte().get(0);
            });

            $.each(editors, function() {
                this.on({
                    onfocus: function(e, data) {
                        me.clear();
                        selectedEditors.push(data.textArea);
                        $(me).trigger("selectionchanged", e);
                    },
                    onselectionchange: function(e) {
                        $(me).trigger("selectionchanged", e);
                    }
                });
            });
        };

        this.clear = function() {
            selectedEditors.splice(0, selectedEditors.length);
        };
        this.on = function(type, handler) {
            $(this).on(type, handler);
        };
        this.off = function(type, handler) {
            $(this).off(type, handler);
        };
    };
})(jQuery);