/*
* This file lists the configuration and constants used by ArteJS
*/
(function($)
{
    $.Arte = $.Arte || {};

    $.Arte.constants = {
        /*
        * Types of text editors
        */
        editorTypes: {
            richText: "richText",
            plainText: "plainText"
        },

        /*
        * Rich text command type
        */
        commandType: {
            inline: "inline", // command is applied to the selection. e.g. fontWeight, fontStyle
            block: "block", // command is applied to the full block. e.g align, h1
            complex: "complex", // Composite command: OL/UL
            other: "other" // command handles how it is applied. e.g. insert
        },

        /*
        * enumeration of the element types that Arte interacts with
        */
        nodeType: {
            ELEMENT: 1,
            ATTRIBUTE: 2,
            TEXT: 3,
            COMMENT: 8
        },

        /*
        * enumeration of the tags used by Arte
        */
        tagName: {
            LI: "LI",
            OL: "OL",
            UL: "UL",
            BR: "BR",
            DIV: "DIV",
            SPAN: "SPAN",
            P: "P",
            B: "B",
            I: "I",
            U: "U",
            STRONG: "STRONG",
            SUB: "SUB",
            SUP: "SUP",
            BLOCKQUOTE: "BLOCKQUOTE",
            H1: "H1",
            H2: "H2",
            H3: "H3",
            H4: "H4",
            H5: "H5",
            H6: "H6"
        },
        /*
        * List of events raised by Arte
        */
        eventNames: {
            "oninput": "oninput",
            "onfocus": "onfocus",
            "onblur": "onblur",
            "onvaluechange": "onvaluechange",
            "onmousedown": "onmousedown",
            "onmouseup": "onmouseup",
            "onclick": "onclick",
            "onkeydown": "onkeydown",
            "onkeypress": "onkeypress",
            "onkeyup": "onkeyup",
            "onpaste": "onpaste",
            "onselectionchange": "onselectionchange",
            "onbeforecommand": "onbeforecommand",
            "oncommand": "oncommand",
            "oncreate": "oncreate",
            "ondestroy": "ondestroy"
        },

        /*
        * commandAttrType specifies how the command is applied.  For example, by using tagName, styleName or className
        */
        commandAttrType: {
            tagName: "tagName",
            styleName: "styleName",
            className: "className",
            other: "other"  // for example, insert command
        }
    };

    var constants = $.Arte.constants;
    /*
    * Various default configuration options for Arte
    */
    $.Arte.configuration = {
        /*
        * Whether to perform a rich text operation when there is no user selection (for example, the cursor is not inside the text field).
        */
        requireFocus: true,

        /*
        * ClassNameSpace is pre-pended to the name of the class. (for example: classNameSpace-font-weight-bold)
        */
        classNameSpace: "arte",

        /*
        * Default attribute to use when applying a rich text command.
        * Options: See Arte.constants.commandAttrType
        */
        commandAttrType: constants.commandAttrType.styleName,

        /*
        * An attributed added to the dom element to identify that dom element as rich text field
        */
        textFieldIdentifier: "rteTextField",

        /*
        * Class applied to the selection markers by rangy library
        */
        rangySelectionBoundaryClassName: "rangySelectionBoundary",

        /*
        * Default tags to use when applying a rich text command
        * These can be over-ridden in the command configuration for each command
        */
        defaultInlineTag: constants.tagName.SPAN,
        defaultBlockTag: constants.tagName.P,

        /*
        * Interval at which to poll of value change of the rich text editor while the   editor is focused
        */
        pollIntervalInMs: 350,

        handleUnsanctionedTagsOnGetValue: true
    };

    /*
    * Set of initial values applied to rich text editor during creation
    */
    $.Arte.configuration.initialValues = {
        /*
        * Set of initial styles applied to rich text editor
        */
        styles: {
            "min-height": "200px",
            "height": "inherit"
        },

        /*
        * Collection of classes applied to rich text editor
        */
        classes: [],

        /*
        * Initial value of the text editor
        */
        value: "Please enter text ..."
    };

    var configuration = $.Arte.configuration;

    /*
    * ArteJS command configuration
    * Command configuration specifies how a command can be applied and how can we identify if that command has been applied
    */
    $.Arte.configuration.commands = {
        /*
        * Bold command be applied using a tag (B), a style (font-weight=bold), or a class (arte-font-weight-bold)
        * command configuration specifies how to apply command in each case
        */
        bold: {
            // Bold command is inline; it can be applied to a selection
            commandType: constants.commandType.inline,
            // The following three properties are used to identify if bold command is applied
            tagName: constants.tagName.B,
            styleName: "font-weight",
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-weight-[\\S]+"),
            // Default value to use when none is specified.
            defaultValue: {
                "styleName": "bold",
                "className": configuration.classNameSpace + "-font-weight-bold"
            },
            // Tag to use for each type of command applier
            applierTagName: {
                "tagName": constants.tagName.B,
                "className": constants.tagName.SPAN,
                "styleName": constants.tagName.SPAN
            },
            supportsPlainText: true
        },
        italic: {
            tagName: constants.tagName.I,
            applierTagName: {
                "tagName": constants.tagName.I,
                "className": constants.tagName.SPAN,
                "styleName": constants.tagName.SPAN
            },
            styleName: "font-style",
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-style-italic"),
            commandType: constants.commandType.inline,
            defaultValue: {
                styleName: "italic",
                className: configuration.classNameSpace + "-font-style-italic"
            },
            supportsPlainText: true
        },
        underline: {
            tagName: constants.tagName.U,
            applierTagName: {
                "tagName": constants.tagName.U,
                "className": constants.tagName.SPAN,
                "styleName": constants.tagName.SPAN
            },
            styleName: "text-decoration",
            classNameRegex: new RegExp(configuration.classNameSpace + "-text-decoration-[\\S]+"),
            commandType: constants.commandType.inline,
            defaultValue: {
                styleName: "underline",
                className: configuration.classNameSpace + "-text-decoration-underline"
            },
            supportsPlainText: true
        },
        // A command that can only be applied using a tag name
        blockquote: {
            tagName: constants.tagName.BLOCKQUOTE,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h1: {
            tagName: constants.tagName.H1,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h2: {
            tagName: constants.tagName.H2,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h3: {
            tagName: constants.tagName.H3,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h4: {
            tagName: constants.tagName.H4,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h5: {
            tagName: constants.tagName.H5,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h6: {
            tagName: constants.tagName.H6,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        orderedList: {
            tagName: constants.tagName.OL,
            commandType: constants.commandType.complex,
            commandAttrType: constants.commandAttrType.tagName
        },
        unorderedList: {
            tagName: constants.tagName.UL,
            commandType: constants.commandType.complex,
            commandAttrType: constants.commandAttrType.tagName
        },
        subscript: {
            tagName: constants.tagName.SUB,
            commandType: constants.commandType.inline,
            commandAttrType: constants.commandAttrType.tagName
        },
        superscript: {
            tagName: constants.tagName.SUP,
            commandType: constants.commandType.inline,
            commandAttrType: constants.commandAttrType.tagName
        },
        _li: {
            tagName: constants.tagName.LI,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        insert: {
            tagName: constants.tagName.SPAN,
            commandType: constants.commandType.other,
            commandAttrType: constants.commandAttrType.other
        },
        // A command that accepts parameters, for example: the value to set as the font-size
        fontSize: {
            styleName: "font-size",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-size-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline,
            supportsPlainText: true
        },
        fontFamily: {
            styleName: "font-family",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-family-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline,
            supportsPlainText: true
        },
        color: {
            styleName: "color",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-color-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline,
            supportsPlainText: true
        },
        backgroundColor: {
            styleName: "background-color",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-background-color-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline,
            supportsPlainText: true
        },
        textAlign: {
            styleName: "text-align",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-text-align-[\\S]+"),
            applierTagName: constants.tagName.P,
            commandType: constants.commandType.block,
            supportsPlainText: true
        }
    };

    (function()
    {
        // Include the commandName in each command configuration
        $.each(configuration.commands, function(key, value)
        {
            value.commandName = key;
        });
    })();
})(jQuery);