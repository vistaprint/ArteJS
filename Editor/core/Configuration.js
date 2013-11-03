/*
* Various constants used throughout the editor
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
            inline: "inline",
            block: "block",
            complex: "complex", // OL/UL
            other: "other" // Insert, etc
        },

        /*
        * commandAttrType specifies how the command is applied.  For example, by using tagName, styleName or className
        */
        commandAttrType: {
            tagName: "tagName",
            styleName: "styleName",
            className: "className",
            other: "other"  // for example, insert command
        },

        /*
        * nodeType enumerates the element types that Arte interacts with
        */
        nodeType: {
            ELEMENT: 1,
            ATTRIBUTE: 2,
            TEXT: 3,
            COMMENT: 8
        },

        /*
        * tagName enumerates the tags used by Arte
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
        allowOpsOnCollapsedSelection: true,

        /*
        * ClassNameSpace is pre-pended to the name of the class. (for example: classNameSpace-font-weight-bold)
        */
        classNameSpace: "arte",

        /**
        * A set of tagNames to which a style/class can be styled.  If a tagName is not styleable, the styles/classes will be applied to all of its 
        * children or the parent depending on the markup.
        */
        styleableTags: {
            SPAN: 1,
            DIV: 1,
            P: 1,
            LI: 1,
            UL: 1,
            OL: 1
        },

        /**
        * During the cleanup phase, the elements with tagName specified with Key can be merged with the parent element specified by the values
        * For example, A SPAN can be merged with SPAN/DIV/P/LI while a LI can't be merged with anything
        */
        mergableTags: {
            SPAN: { SPAN: 1, DIV: 1, P: 1, LI: 1 },
            DIV: { DIV: 1, P: 1, LI: 1 },
            P: { DIV: 1, P: 1, LI: 1 },
            LI: {},
            OL: {},
            UL: {},
            B: { B: 1 },
            U: { U: 1 },
            I: { I: 1 },
            STRONG: { STRONG: 1 },
            SUB: { SUB: 1 },
            SUP: { SUP: 1 },
            H1: { H2: 1, H3: 1, H4: 1, H5: 1, H6: 1 },
            H2: { H1: 1, H3: 1, H4: 1, H5: 1, H6: 1 },
            H3: { H1: 1, H2: 1, H4: 1, H5: 1, H6: 1 },
            H4: { H1: 1, H2: 1, H3: 1, H5: 1, H6: 1 },
            H5: { H1: 1, H2: 1, H3: 1, H4: 1, H6: 1 },
            H6: { H1: 1, H2: 1, H3: 1, H4: 1, H5: 1 }
        },

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

        /**/
        defaultInlineTag: constants.tagName.SPAN,
        defaultBlockTag: constants.tagName.P
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
        * Interval at which to poll of value change of the rich text editor while the   editor is focused
        */
        pollIntervalInMs: 350,

        /*
        * Initial value of the text editor
        */
        value: "Please enter text ..."
    };

    var configuration = $.Arte.configuration;
    $.Arte.configuration.commands = {
        /* Tag based rich text commands */
        bold: {
            commandType: constants.commandType.inline,
            tagName: constants.tagName.B,
            styleName: "font-weight",
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-weight-[\\S]+"),
            defaultValue: {
                "styleName": "bold",
                "className": configuration.classNameSpace + "-font-weight-bold"
            },
            applierTagName: {
                "tagName": constants.tagName.B,
                "className": constants.tagName.SPAN,
                "styleName": constants.tagName.SPAN
            }
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
            }
        },
        underLine: {
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
            }
        },
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
        /* Style or class based rich text commands */
        //    fontWeight: {
        //        styleName: "font-weight",
        //        classNameRegex: new RegExp(Arte.configuration.classNameSpace + "-font-weight-[\\S]+"),
        //        tagName: Arte.constants.tagName.SPAN,
        //        commandType: Arte.constants.commandType.inline,
        //        defaultValue: {
        //            styleName: "bold",
        //            className: Arte.configuration.classNameSpace + "-font-weight-bold"
        //        }
        //    },
        //    fontStyle: {
        //        styleName: "font-style",
        //        classNameRegex: new RegExp(Arte.configuration.classNameSpace + "-font-style-italic"),
        //        tagName: Arte.constants.tagName.SPAN,
        //        commandType: Arte.constants.commandType.inline,
        //        defaultValue: {
        //            styleName: "italic",
        //            className: Arte.configuration.classNameSpace + "-font-style-italic"
        //        }
        //    },
        //    textDecoration: {
        //        styleName: "text-decoration",
        //        classNameRegex: new RegExp(Arte.configuration.classNameSpace + "-text-decoration-[\\S]+"),
        //        tagName: Arte.constants.tagName.SPAN,
        //        commandType: Arte.constants.commandType.inline,
        //        defaultValue: {
        //            styleName: "underline",
        //            className: Arte.configuration.classNameSpace + "-text-decoration-underline"
        //        }
        //    },
        fontSize: {
            styleName: "font-size",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-size-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline
        },
        fontFamily: {
            styleName: "font-family",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-family-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline
        },
        color: {
            styleName: "color",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-color-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline
        },
        backgroundColor: {
            styleName: "background-color",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-background-color-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline
        },
        textAlign: {
            styleName: "text-align",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-text-align-[\\S]+"),
            applierTagName: constants.tagName.P,
            commandType: constants.commandType.block
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

    /*
    * Given a set of command options, find the command configuration
    */
    $.Arte.configuration.commands.getCommandConfig = function(options)
    {
        var result = null;
        var commandAttrType = null;
        if (options && options.commandName)
        {
            return configuration.commands[options.commandName];
        }

        /* Infer the command from the properties in the options. */
        for (var command in configuration.commands)
        {
            var commandConfig = configuration.commands[command];

            if (options.className && commandConfig.classNameRegex && commandConfig.classNameRegex.test(options.className))
            {
                result = commandConfig;
                commandAttrType = constants.commandAttrType.className;
            }
            else if (options.styleName && options.styleName === commandConfig.styleName)
            {
                result = commandConfig;
                commandAttrType = constants.commandAttrType.styleName;
            }
            else if (options.tagName && !(options.className || options.styleName))
            {
                if ($.isPlainObject(commandConfig.tagName))
                {
                    var hasTag = util.any(commandConfig.tagName, function(key, value)
                    {
                        return value === options.tagName;
                    });
                    if (hasTag)
                    {
                        result = commandConfig;
                    }
                }
                else if (options.tagName === commandConfig.tagName)
                {
                    result = commandConfig;
                }
                commandAttrType = constants.commandAttrType.tagName;
            }
            if (result)
            {
                return $.extend({ commandAttrType: commandAttrType }, result);
            }
        }
        return null;
    };
})(jQuery);