(function($) {
    $.fn.ArteToolbar = function(options) {
        if (options && typeof(options) === "object") {
            options = $.extend({}, $.Arte.Toolbar.Defaults, options);
        }

        this.each(function() {
            var toolbar;
            if (options && typeof(options) === "object") {
                $.extend(options, { element: this });
                toolbar = new $.Arte.Toolbar(options);
                $(this).data("Toolbar", toolbar);
            }
        });
        return this;
    };


    $.Arte.Toolbar = function (options) {
        var me = this;

        function render() {
            $(options.element).on({
                "click mousedown mouseup": function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
            $.each(buttons, function () {
                this.render(options.element);
            });

            // Add a container for inline dialogs
            $("<div>").addClass("inline-dialog").appendTo(options.element);
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

        this.isEnabled = function () {
            var selectedTextField = toolbar.selectionManager.getSelectedFields(this.supportedTypes);
            return selectedTextField && selectedTextField.length;
        };

        this.executeCommand = function (commandValue) {
            if (this.isEnabled()) {
                var commandAttrType = (config && config.commandAttrType) ?
                    config.commandAttrType :
                    $.Arte.Toolbar.configuration.commandAttrType;

                var value = commandValue;
                if (config.acceptsParams) {
                    value = config.getValue(commandAttrType, value);
                } else {
                    value = config.commandValue ? config.commandValue[commandAttrType] : "";
                }
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

            var inner = $("<span>").addClass(buttonName + " toolbar-button");
            this.element = $("<a>").attr("href", "#").addClass("btn").html(inner);
            this.element.on({
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

            this.element.appendTo(parent);
        };
        var isApplied = function (state) {
            if (config.commandName === "textAlign") {
                var defaultValue = config.commandValue[$.Arte.Toolbar.configuration.commandAttrType];
                return state === defaultValue;
            }
            return state;
        };

        this.refresh = function (state) {
            var buttonStateClass = $.Arte.Toolbar.configuration.buttonStateClass;

            if (this.isEnabled()) {
                this.element.removeClass(buttonStateClass.disabled);

                var op = isApplied(state[config.commandName]) ? "addClass" : "removeClass";
                this.element[op](buttonStateClass.selected);
            } else {
                this.element.addClass(buttonStateClass.disabled);
            }
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
(function ($) {
    $.Arte.Toolbar.ButtonWithDropDown = function (toolbar, buttonName, config) {
        $.extend(this, new $.Arte.Toolbar.Button(toolbar, buttonName, config));
        this.render = function (parent) {
            var me = this;

            var element = $("<select>").addClass(".toolbar-button").addClass(this.name);

            $.each(config.options, function (index, option) {
                var value = typeof (option) === "string" ? option.toLowerCase() : option;

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
                element.append($("<option>").attr("value", value).html(option));
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
                }
            });

            this.element = element;
        };

        this.refresh = function (state) {
            var op = this.isEnabled() ? "removeAttr" : "attr";
            this.element[op]("disabled", true);

            var value = state[config.commandName];

            // Perform a reverse lookup from className to actual value
            if ($.Arte.Toolbar.configuration.commandAttrType === $.Arte.constants.commandAttrType.className) {
                value = $.Arte.Toolbar.configuration.ClassNameReverseLookup[config.commandName][value];
            }

            this.element.val(value);
        };
    };
})(jQuery);
(function ($) {

    $.Arte.Toolbar = $.Arte.Toolbar || {};
    var buttonBase = $.Arte.Toolbar.Button;
    var buttonWithDropDown = $.Arte.Toolbar.ButtonWithDropDown;
    var commandAttrType = $.Arte.constants.commandAttrType;
    $.Arte.Toolbar.configuration = {
        buttons: {
            "bold": {
                js: buttonBase,
                commandName: "bold",
                commandValue: {
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
                commandName: "blockquote"
            },
            "textAlignLeft": {
                js: buttonBase,
                icon: "../content/Icons/icons/text_align_left.png",
                commandName: "textAlign",
                commandValue: {
                    "styleName": "left",
                    "className": "arte-text-align-left"
                }
            },
            "textAlignCenter": {
                js: buttonBase,
                icon: "../content/Icons/icons/text_align_center.png",
                commandName: "textAlign",
                commandValue: {
                    "styleName": "center",
                    "className": "arte-text-align-center"
                }
            },
            "textAlignRight": {
                js: buttonBase,
                icon: "../content/Icons/icons/text_align_right.png",
                commandName: "textAlign",
                commandValue: {
                    "styleName": "right",
                    "className": "arte-text-align-right"
                }
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
                acceptsParams: true,
                getValue: function (type, value) {
                    if (type === commandAttrType.className) {
                        return $.Arte.Toolbar.configuration.ClassNameLookup.fontSize[value];
                    }
                    return value;
                }
            },
            "fontFamily": {
                js: buttonWithDropDown,
                icon: null,
                commandName: "fontFamily",
                options: ["", "Arial", "curier new", "Georgia", "Times New Roman"],
                acceptsParams: true,
                getValue: function (type, value) {
                    if (type === commandAttrType.className) {
                        return $.Arte.Toolbar.configuration.ClassNameLookup.fontFamily[value];
                    }
                    return value;
                }
            },
            "color": {
                js: buttonWithDropDown,
                icon: null,
                commandName: "color",
                options: ["", "Black", "Blue", "Green", "Red"],
                acceptsParams: true,
                getValue: function (type, value) {
                    if (type === commandAttrType.className) {
                        return $.Arte.Toolbar.configuration.ClassNameLookup.color[value];
                    }
                    return value;
                }
            },
            "unorderedList": {
                js: buttonBase,
                commandName: "unorderedList"
            },
            "orderedList": {
                js: buttonBase,
                commandName: "orderedList"
            },
            "backgroundColor": {
                acceptsParams: true,
                js: buttonWithDropDown,
                commandName: "backgroundColor",
                options: ["", "Black", "Blue", "Green", "Red"],
                getValue: function (type, value) {
                    if (type === commandAttrType.className) {
                        return $.Arte.Toolbar.configuration.ClassNameLookup.backgroundColor[value];
                    }
                    return value;
                }
            },
            "undo": {
                js: buttonBase,
                commandName: "undo"
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
                js: $.Arte.Toolbar.InsertLink
            }
        },
        buttonStateClass: {   
            "disabled": "disabled",
            "selected": "selected"
        },
        commandAttrType: commandAttrType.styleName,
        commandConfig: {}
    };

    // In case we are using classNames to apply styles, the following mapping
    // maps user selected values to a className 
    $.Arte.Toolbar.configuration.ClassNameLookup = {
        fontWeight: {
            bold: "arte-font-weight-bold"
        },
        fontSize: {
            8: "arte-font-size-8",
            10: "arte-font-size-10",
            12: "arte-font-size-12",
            15: "arte-font-size-15",
            20: "arte-font-size-20"
        },
        color: {
            red: "arte-font-color-red",
            blue: "arte-font-color-blue",
            black: "arte-font-color-black",
            green: "arte-font-color-green"
        },
        fontFamily: {
            "times new roman": "arte-font-family-times-new-roman",
            "curier new": "arte-font-family-curier-new",
            "arial": "arte-font-family-arial",
            "georgia": "arte-font-family-georgia"
        },
        textAlign: {
            "left": "arte-text-align-left",
            "center": "arte-text-align-center",
            "right": "arte-text-align-right"
        },
        backgroundColor: {
            red: "arte-background-color-red",
            blue: "arte-background-color-blue",
            black: "arte-background-color-black",
            green: "arte-background-color-green"

        }
    };

    (function() {
        // Create a reverse lookup from className to styleValue to be used while refreshing the toolbars 
        var classNameReverseLookup = $.Arte.Toolbar.configuration.ClassNameReverseLookup = {};
        $.each($.Arte.Toolbar.configuration.ClassNameLookup, function(styleName, classNameMapping) {
            var styleKey = classNameReverseLookup[styleName] = {};

            $.each(classNameMapping, function(styleValue, className) {
                styleKey[className] = styleValue;
            });
        });
    })();

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