(function($) {
    $.fn.ArteToolbar = function(options) {
        if (options && typeof(options) === "object") {
            options = $.extend({}, $.Arte.Toolbar.Defaults, options);
        }

        this.each(function() {
            var toolbar;
            if (options && typeof(options) === "object") {
                $.extend(options, { element: $(this) });
                toolbar = new $.Arte.Toolbar(options);
                $(this).data("Toolbar", toolbar);
            }
        });
        return this;
    };


    $.Arte.Toolbar = function (options) {
        var me = this;
        var classes = $.Arte.Toolbar.configuration.classes;
        this.$el = options.element;
        function render() {
            me.$el.on({
                "click mousedown mouseup": function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
            $.each(buttons, function () {
                this.render(me.$el);
            });

            // Add a container for inline dialogs
            $("<div>").addClass(classes.dialog.container).appendTo(me.$el);
            $("<div>").addClass(classes.tooltip.container).appendTo(me.$el);
        }

        var buttons = [];
        this.add = function (button) {
            buttons.push(button);
        };

        this.selectionManager = new $.Arte.Toolbar.SelectionManager();

        // Initialize each of the button
        $.each(options.buttons, function (index, buttonName) {
            var config = $.Arte.Toolbar.configuration.buttons[buttonName];
            var button = new config.js(me, buttonName, config);
            me.add(button);
        });

        render();

        this.refresh = function () {
            var selectedField = me.selectionManager.getSelectedFields()[0];
            var state = (selectedField) ? selectedField.getState() : {};
            $.each(buttons, function () {
                    this.refresh(state);
                });
        };

        $("body").on({
            click: function () {
                me.selectionManager.clear();
                me.refresh();
            }
        });

        this.selectionManager.on({
            selectionchanged: me.refresh
        });

        this.selectionManager.initialize({ editor: options.editor });
        me.refresh();
    };
})(jQuery);
/// dependencies: Toolbar
(function ($) {
    $.Arte.Toolbar.Button = function (toolbar, buttonName, config) {
        this.element = null;
        this.commandName = config.commandName;
        var classes = $.Arte.Toolbar.configuration.classes;
        var buttonClasses = classes.button;
        
        this.isEnabled = function () {
            var selectedTextField = toolbar.selectionManager.getSelectedFields(this.supportedTypes);
            return selectedTextField && selectedTextField.length;
        };

        this.executeCommand = function (commandValue) {
            if (this.isEnabled()) {
                var commandAttrType = (config && config.commandAttrType) ?
                    config.commandAttrType :
                    $.Arte.Toolbar.configuration.commandAttrType;

                var value = commandValue || (config.commandValue ? config.commandValue[commandAttrType] : "");

                var commandOptions = {
                    commandName: config.commandName,
                    commandValue: value,
                    commandAttrType: commandAttrType
                };

                $.each(toolbar.selectionManager.getSelectedFields(), function () {
                    this[commandOptions.commandName].call(this, commandOptions);
                });
                toolbar.refresh();
            }
        };

        this.render = function (parent) {
            var me = this;

            var inner = $("<span>").addClass(buttonName).addClass(buttonClasses.inner);
            this.$el = $("<a>").attr("href", "#").addClass(buttonClasses.outer).html(inner);
            this.$el.on({
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

            this.$el.appendTo(parent);
        };
        var isApplied = function (state) {
            if (config.commandName === "textAlign") {
                var defaultValue = config.commandValue[$.Arte.Toolbar.configuration.commandAttrType];
                return state === defaultValue;
            }
            return state;
        };

        this.refresh = function (state) {
            if (this.isEnabled()) {
                this.$el.removeClass(buttonClasses.disabled);

                var op = isApplied(state[config.commandName]) ? "addClass" : "removeClass";
                this.$el[op](buttonClasses.selected);
            } else {
                this.$el.addClass(buttonClasses.disabled);
                this.$el.removeClass(buttonClasses.selected);
            }
        };

        this.showTooltip = function (mouseEvent) {
            if (this.$el.hasClass(buttonClasses.disabled)) {
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
            if (this.$el.hasClass(buttonClasses.disabled)) {
                return;
            }

            toolbar.$el.find("." + classes.tooltip.outer).hide();
        };
    };
})(jQuery);
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
(function ($) {
    $.Arte.Toolbar.ButtonWithDropDown = function (toolbar, buttonName, config) {
        var classes = $.Arte.Toolbar.configuration.classes;
        $.extend(this, new $.Arte.Toolbar.Button(toolbar, buttonName, config));
        this.render = function (parent) {
            var me = this;

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
            element.appendTo(parent);
            
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

        this.refresh = function (state) {
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
    // Button Configuration
    $.Arte.Toolbar.configuration = {
        buttons: {
            "bold": {
                js: buttonBase, // Button js to render and manage this button
                commandName: "bold", // Command to execute
                commandValue: { // command values for each command attribut type
                    "styleName": "bold",
                    "className": "arte-font-weight-bold"
                }
            },
            "italic": {
                js: buttonBase,
                commandName: "italic",
                commandValue: {
                    "styleName": "italic",
                    "className": "arte-font-style-italic"
                }
            },
            "underline": {
                js: buttonBase,
                commandName: "underline",
                commandValue: {
                    "styleName": "underline",
                    "className": "arte-text-decoration-underline"
                }
            },
            "blockquote": {
                js: buttonBase,
                commandName: "blockquote",
            },
            "textAlignLeft": {
                js: buttonBase,
                icon: "../content/Icons/icons/text_align_left.png",
                commandName: "textAlign",
                commandValue: {
                    "styleName": "left",
                    "className": "arte-text-align-left"
                },
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
                tooltip: "Text align right"
            },
            "h1": {
                js: buttonBase,
                commandName: "h1",
                icon: "../content/Icons/icons/text_heading_1.png"
            },
            "h2": {
                js: buttonBase,
                commandName: "h2",
                icon: "../content/Icons/icons/text_heading_2.png"
            },
            "h3": {
                js: buttonBase,
                commandName: "h3",
                icon: "../content/Icons/icons/text_heading_3.png"
            },
            "h4": {
                js: buttonBase,
                commandName: "h4",
                icon: "../content/Icons/icons/text_heading_4.png"
            },
            "h5": {
                js: buttonBase,
                commandName: "h5",
                icon: "../content/Icons/icons/text_heading_5.png"
            },
            "h6": {
                js: buttonBase,
                commandName: "h6",
                icon: "../content/Icons/icons/text_heading_6.png"
            },
            "subscript": {
                js: buttonBase,
                commandName: "subscript",
                icon: "../content/Icons/icons/text_subscript.png"
            },
            "superscript": {
                js: buttonBase,
                commandName: "superscript",
                icon: "../content/Icons/icons/text_superscript.png"
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
                tooltip: "Font size"
            },
            "fontFamily": {
                js: buttonWithDropDown,
                icon: null,
                commandName: "fontFamily",
                options: ["", "Arial", "curier new", "Georgia", "Times New Roman"],
                acceptsParams: true,
                tooltip: "Font family"
            },
            "color": {
                js: buttonWithDropDown,
                icon: null,
                commandName: "color",
                options: ["", "Black", "Blue", "Green", "Red"],
                acceptsParams: true,
            },
            "unorderedList": {
                js: buttonBase,
                commandName: "unorderedList",
                tooltip: "Unordered list"
            },
            "orderedList": {
                js: buttonBase,
                commandName: "orderedList",
                tooltip: "Ordered list"
            },
            "backgroundColor": {
                acceptsParams: true,
                js: buttonWithDropDown,
                commandName: "backgroundColor",
                options: ["", "Black", "Blue", "Green", "Red"],
                tooltip: "Background Color"
            },
            "undo": {
                js: buttonBase,
                commandName: "undo",
                tooltip: "Undo"
            },
            "redo": {
                js: buttonBase,
                commandName: "redo"
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
                tooltip: "Insert link"
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
                "insertLink":
                {
                    "button": "btn",
                    "label": "",
                    "input": ""
                }
            },
            "tooltip":
            {
                "container": "tooltip"
            }
        },
        // By default, this toolbar will apply rich text commands using styles
        commandAttrType: commandAttrType.styleName,
        commandConfig: {}
    };
})(jQuery);
(function ($) {
    $.Arte.Toolbar = $.Arte.Toolbar || {};
    $.Arte.Toolbar.SelectionManager = function () {
        return {
            selection: [],
            isValidSelection: function () {
                var userSelection = rangy.getSelection();
                var range = userSelection.getAllRanges()[0];
                if (range) {
                    var textFields = this.getSelectedFields();
                    return $.Arte.util.any(textFields, function (index, textField) {
                        return textField.$el.get(0) === range.startContainer || textField.$el.has(range.startContainer).get(0);
                    });
                }
                return false;
            },
            getSelectedFields: function (types) {
                if (types) {
                    return $.Arte.util.filterCollection(this.selection, function (index, textField) {
                        return $.Arte.util.any(types, function (i, type) {
                            return textField.editorType === type;
                        });
                    });
                }

                return this.selection;
            },
            initialize: function (options) {
                var me = this;
                var elements = options && options.editor ? $(options.editor) :
                    $("[" + $.Arte.configuration.textFieldIdentifier + "]");

                elements.each(function () {
                    $(this).on({
                        onfocus: function (e, data) {
                            me.selection.splice(0, me.selection.length);
                            me.selection.push(data.textArea);
                            $(me).trigger("selectionchanged", e);
                        },
                        onselectionchange: function (e) {
                            $(me).trigger("selectionchanged", e);
                        }
                    });
                });
            },
            clear: function () {
                this.selection.splice(0, this.selection.length);
            },
            on: function (type, handler) {
                $(this).on(type, handler);
            },
            off: function (type, handler) {
                $(this).off(type, handler);
            }
        };
    };
})(jQuery);