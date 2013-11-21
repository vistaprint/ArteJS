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
                //options: ["", 8, 10, 12, 15, 20],
                options: [
                    { display: "", value: "" },
                    { display: "Smaller", value: 8 },
                    { display: "Small", value: 10 },
                    { display: "Medium", value: 12 },
                    { display: "Large", value: 15 },
                    { display: "Larger", value: 20 }
                ],
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
            }
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

    (function () {
        // Create a reverse lookup from className to styleValue to be used while refreshing the toolbars 
        var classNameReverseLookup = $.Arte.Toolbar.configuration.ClassNameReverseLookup = {};
        $.each($.Arte.Toolbar.configuration.ClassNameLookup, function (styleName, classNameMapping) {
            var styleKey = classNameReverseLookup[styleName] = {};

            $.each(classNameMapping, function (styleValue, className) {
                styleKey[className] = styleValue;
            });
        });
    })();

})(jQuery);