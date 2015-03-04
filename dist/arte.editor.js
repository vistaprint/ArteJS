/**
 * @fileoverview jQuery wrapper around the Rich text editor
 * Usage:
 *  1) $(selector).Arte()
 *     Converts the matched elements into rich text editor using default options or returns and existing instance
 *  2) $(selector).Arte({ options });
 *     Converts the matched elements into rich text editor using the options supplied or returns and existing instance
 *  3) $(selector).Arte(command, arguments)
 *     Execute a rich text command with arguments
 */
(function($) {
    $.Arte = $.Arte || {};
    $.fn.Arte = function(options, args) {
        var result = [];
        rangy.init();
        this.each(function() {
            var $this = $(this);
            var editor = $this.data("Arte");
            if (options && typeof(options) === "string") {
                // Most likely this is a method call
                var methodName = options;
                if (this.constructor === $.Arte.TextArea) {
                    editor = this;
                }

                if (!editor) {
                    throw "This is not a rich text field.";
                }

                var returnValue = editor[methodName].call(editor, args);
                result.push(returnValue);
            } else {
                // If $this is not a rich text editor, construct the editor
                if (!editor) {
                    options = options || {};
                    options.element = this;
                    editor = new $.Arte.TextArea(options);
                    $this.data("Arte", editor);
                }
                result.push(editor);
            }
        });
        return $(result);
    };
})(jQuery);

/// dependencies: Arte.js
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.TextArea = function(options) {
        var me = this;
        var configuration = $.Arte.configuration;
        var constants = $.Arte.constants;

        // Backwards compatibility. Use _container instead.
        me.$element = $(options.element);
        me.element = me.$element.get(0);
        // The _container that contains the editable $el. It"s needed to deal with getting $el"s outer value.
        me._container = me.element;

        // Create a mix-in of the user provided values and configuration defined default values
        var initialValues = $.extend({}, configuration.initialValues, options);

        var eventNames = constants.eventNames;
        this.editorType = options.editorType || constants.editorTypes.richText;

        //Store the outer value for comparison of value changes
        this._currentOuterValue = "";

        //Timer used to check for changes to the value, selection, and focus of the textarea
        var pollTimer = null;

        var handleValueChange = function() {
            var newOuterValue = me._container.innerHTML;
            var oldOuterValue = me._currentOuterValue;

            if (newOuterValue !== oldOuterValue) {
                var contents = me.$el.contents();
                if ($.Arte.dom.hasUnsanctionedElements(contents)) {
                    var savedSelection;
                    if (isFocused) {
                        savedSelection = rangy.saveSelection();
                    }
                    $.Arte.dom.handleUnsanctionedElements(contents);
                    if (isFocused) {
                        rangy.restoreSelection(savedSelection);
                    }
                }
                me._currentOuterValue = me._container.innerHTML;
                me.triggerEvent(eventNames.onvaluechange, {
                    newValue: me.value(),
                    src: "internal"
                });
            }
        };

        // Uses polling to trigger value change as user can change the value of the text field in multiple ways.
        // for example (keyboard, IME input, paste, multi-stroke keyboard, and context menu).
        var startPollingForValueChange = function() {
            if (!pollTimer) {
                pollTimer = setInterval(handleValueChange, configuration.pollIntervalInMs);
            }
        };

        // Construct a dom element to host richtext editor
        if (!me.element.hasChildNodes()) {
            if (me.editorType === constants.editorTypes.richText) {
                me.el = document.createElement("div");
                me.el.setAttribute("contenteditable", "true");
            } else {
                me.el = document.createElement("textarea");
                me.el.style.height = "100%";
                me.el.style.width = "100%";
                me.el.style.padding = 0;
                me.el.style.border = 0;
            }
            me._container.appendChild(me.el);
            me.$el = $(me.el);
            // Use an existing DIV or TEXTAREA if it already exists
        } else {
            me.el = me._container.childNodes[0];
            if (me.el.tagName === "DIV") {
                me.el.setAttribute("contenteditable", "true");
            } else if (me.el.tagName !== "TEXTAREA") {
                throw new Error("Cannot make element editable");
            }
            me.$el = $(me.el);
        }

        me.$el.css(initialValues.styles);
        me.el.setAttribute("class", initialValues.classes.join(" "));
        me._container.setAttribute(configuration.textFieldIdentifier, "1");

        /*
         * Whether the element has the focus
         */
        var isFocused = false;

        /*
         * Listen for the dom events on the text area or the content editable element.
         */
        me.$el.on({
            keydown: function(e) {
                me.triggerEvent(eventNames.onkeydown, {
                    originalEvent: e
                });
                e.stopPropagation();
            },
            keyup: function(e) {
                me.triggerEvent(eventNames.onkeyup, {
                    originalEvent: e
                });
                e.stopPropagation();
            },
            keypress: function(e) {
                me.triggerEvent(eventNames.onkeypress, {
                    originalEvent: e
                });
                e.stopPropagation();
            },
            focus: function(e) {
                if (!isFocused) {
                    isFocused = true;
                    me.triggerEvent(eventNames.onfocus, {
                        originalEvent: e
                    });
                }
                startPollingForValueChange();
                e.stopPropagation();
            },
            blur: function(e) {
                handleValueChange(); // Flush any changes that occurred between the last poll and now.
                isFocused = false;
                me.triggerEvent(eventNames.onselectionchange);
                me.triggerEvent(eventNames.onblur, {
                    originalEvent: e
                });

                // Clear the value changed poll timer
                if (pollTimer) {
                    clearInterval(pollTimer);
                    pollTimer = null;
                }
                e.stopPropagation();
            },
            mouseup: function(e) {
                me.triggerEvent(eventNames.onselectionchange);
                me.triggerEvent(eventNames.onmouseup, {
                    originalEvent: e
                });
            },
            mousedown: function(e) {
                me.triggerEvent(eventNames.onmousedown, {
                    originalEvent: e
                });
            },
            click: function(e) {
                me.triggerEvent(eventNames.onclick, {
                    originalEvent: e
                });
            },
            paste: function(e) {
                setTimeout(function() {
                    me.triggerEvent(eventNames.onpaste, {
                        originalEvent: e
                    });
                }, 50);
            }
        });
        $.Arte.pluginManager.init(me);

        me.value(initialValues.value);

        $(me._container).on(options.on);
        me.triggerEvent(eventNames.oncreate);
    };

    $.extend($.Arte.TextArea.prototype, {
        // Get innerHtml of the contentEditable element
        "value": function(value) {
            var constants = $.Arte.constants;
            var prop = this.editorType === constants.editorTypes.richText ? "innerHTML" : "value";
            var currentValue = this.el[prop];

            if (typeof(value) === "undefined") {
                return currentValue;
            }

            if (currentValue === value) {
                return;
            }

            this.el[prop] = value;
            this._currentOuterValue = this._container.innerHTML;
            this.triggerEvent(constants.eventNames.onvaluechange, {
                newValue: value,
                src: "external"
            });
        },
        // Get outerHtml of the contentEditable element
        "outerValue": function(value) {
            if (typeof(value) === "undefined") {
                var clone = this.$element.clone();
                clone.children().removeAttr("contenteditable");
                return clone.html();
            }

            var newElement = $(value)[0];
            this.el.setAttribute("style", newElement.getAttribute("style") || "");
            this.el.setAttribute("class", newElement.getAttribute("class") || "");
            this.value(newElement.innerHTML);
        },
        "focus": function() {
            var me = this;
            var focusHandler = function() {
                me.$el.off("focus", focusHandler);
                $.Arte.util.moveCursorToEndOfElement(me.$el.get(0));
                me.triggerEvent($.Arte.constants.eventNames.onselectionchange);
            };
            me.$el.on("focus", focusHandler);
            me.$el.focus();
        },
        "triggerEvent": function(name, data) {
            this.$element.trigger(name, $.extend(data, {
                textArea: this
            }));
        },
        "destroy": function(options) {
            // Converts the rich text editor to non-editable state and remove rich text state information
            this.$element.removeData("Arte");
            this.$element.removeAttr($.Arte.configuration.textFieldIdentifier);
            this.$element.off();

            this.$el.off();
            this.$el.removeAttr("contentEditable");
            this.triggerEvent($.Arte.constants.eventNames.ondestroy);

            if (options && options.removeContent) {
                this.$element.empty();
            }
        },
        /**
         *  on/off methods to support attaching events handler using a rich text instance
         */
        on: function(type, handler) {
            this.$element.on(type, handler);
        },
        off: function(type, handler) {
            this.$element.off(type, handler);
        }
    });
})(jQuery);

/*
* This file lists the configuration and constants used by ArteJS
*/
(function($) {
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

    (function() {
        // Include the commandName in each command configuration
        $.each(configuration.commands, function(key, value) {
            value.commandName = key;
        });
    })();
})(jQuery);

/**
 * @fileoverview manages the plugins for Arte
 */
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.pluginManager = {
        plugins: {},
        /**
         * Register a plugin
         * @param {string} name of the plugin
         * @param {function} constructor function of the plugin
         */
        register: function(name, plugin) {
            this.plugins[name] = plugin;
        },
        /*
         * Initializes the plugin
         * @param {Arte} an instance of Arte
         */
        init: function(richTextEditor) {
            richTextEditor.pluginInstances = richTextEditor.pluginInstances || [];
            for (var pluginName in this.plugins) {
                var pluginInstanse = new this.plugins[pluginName]();
                pluginInstanse.init(richTextEditor);
                richTextEditor.pluginInstances.push(pluginInstanse);
            }
        }
    };
})(jQuery);

/// @dependencies: Arte.js, TextArea.js
/**
 * @fileoverview extends Arte prototype to add rich text commands
 */
(function() {
    var constants = $.Arte.constants;
    var configuration = $.Arte.configuration;
    /**
     * Reference to commandAttrType enumeration
     */
    var commandAttr = constants.commandAttrType;
    /**
     * Determine the command attribute using the options
     */
    var commandAttrType = function(commandName, options) {
        // commandAttrType is selected based on the following precedence
        // 1) As defined in the options
        // 2) Infer from the options
        // 3) Use default
        var commandConfig = configuration.commands[commandName];
        if (commandConfig.commandAttrType) {
            return commandConfig.commandAttrType;
        }

        var attrType = configuration.commandAttrType;
        if (!options) {
            return attrType;
        }

        if (options.commandAttrType) {
            attrType = options.commandAttrType;
        } else {
            if (options.styleName) {
                attrType = commandAttr.styleName;
            } else if (options.className) {
                attrType = commandAttr.className;
            } else if (options.tagName) {
                attrType = commandAttr.tagName;
            }
        }
        return attrType;
    };

    /*
     * Executes a rich text command
     */
    var exec = function(commandName, options) {
        var commandOptions = constructCommandOptions.call(this, commandName, options);

        commandOptions.execute = true;
        this.triggerEvent(constants.eventNames.onbeforecommand, commandOptions);

        if (!commandOptions.execute) { // The client requested the cancelation of this command
            return;
        }

        delete commandOptions.execute;
        $.Arte.RichTextCommandApplier.createAndExecute(commandOptions);
        this.triggerEvent(constants.eventNames.oncommand, commandOptions);
    };

    var getCommandValueOrDefault = function(commandName, attrType, options) {
        if (options && attrType === commandAttr.styleName && options.styleValue) {
            return options.styleValue;
        } else if (options && (attrType === commandAttr.className) && options.className) {
            return options.className;
        } else if (options && options.commandValue) {
            return options.commandValue;
        }

        if (typeof(options) === "string") { // Command value is passed as string.
            return options;
        }

        // If commandValue is not defined, try getting the default value for the command
        var defaultValue = configuration.commands[commandName].defaultValue;
        if (defaultValue) {
            return defaultValue[attrType];
        }
    };

    var getTagNameOrDefault = function(commandName, attrType, options) {
        if (options && options.tagName) {
            return options.tagName;
        }

        var commandConfig = configuration.commands[commandName];
        if (commandConfig.applierTagName) {
            // ApplierTagNames can be configured based on the commandAttrType
            return $.isPlainObject(commandConfig.applierTagName) ? commandConfig.applierTagName[attrType] : commandConfig.applierTagName;
        }

        if (commandConfig.tagName) {
            return commandConfig.tagName;
        }

        // Use the default block/inline tags
        return commandConfig.commandType === constants.commandType.inline ?
            configuration.defaultInlineTag : configuration.defaultBlockTag;
    };

    var constructCommandOptions = function(commandName, options) {
        var attr = commandAttrType(commandName, options);
        var commandConfig = configuration.commands[commandName];

        var commandOptions = {
            textArea: this,
            commandAttrType: attr,
            commandName: commandName,
            tagName: commandConfig.tagName,
            applierTagName: getTagNameOrDefault(commandName, attr, options)
        };

        var commandValue = getCommandValueOrDefault(commandName, attr, options);
        switch (attr) {
            case constants.commandAttrType.className:
                commandOptions.classNameRegex = commandConfig.classNameRegex;
                commandOptions.className = commandValue;
                break;
            case constants.commandAttrType.styleName:
                commandOptions.styleName = commandConfig.styleName;
                commandOptions.styleValue = commandValue;
                break;
        }

        return $.extend(options, commandOptions);
    };

    $.extend($.Arte.TextArea.prototype, {
        "bold": function(options) {
            exec.apply(this, ["bold", options]);
        },
        "italic": function(options) {
            exec.apply(this, ["italic", options]);
        },
        "underline": function(options) {
            exec.apply(this, ["underline", options]);
        },
        "blockquote": function() {
            exec.apply(this, ["blockquote"]);
        },
        "h1": function() {
            exec.apply(this, ["h1"]);
        },
        "h2": function() {
            exec.apply(this, ["h2"]);
        },
        "h3": function() {
            exec.apply(this, ["h3"]);
        },
        "h4": function() {
            exec.apply(this, ["h4"]);
        },
        "h5": function() {
            exec.apply(this, ["h5"]);
        },
        "h6": function() {
            exec.apply(this, ["h6"]);
        },
        "subscript": function() {
            exec.apply(this, ["subscript"]);
        },
        "superscript": function() {
            exec.apply(this, ["superscript"]);
        },
        "fontSize": function(options) {
            exec.apply(this, ["fontSize", options]);
        },
        "fontFamily": function(options) {
            exec.apply(this, ["fontFamily", options]);
        },
        "color": function(options) {
            exec.apply(this, ["color", options]);
        },
        "backgroundColor": function(options) {
            exec.apply(this, ["backgroundColor", options]);
        },
        "unorderedList": function(options) {
            exec.apply(this, ["unorderedList", options]);
        },
        "orderedList": function(options) {
            exec.apply(this, ["orderedList", options]);
        },
        "textAlign": function(options) {
            exec.apply(this, ["textAlign", options]);
        },
        // Apply the styles/classes to the content editable element
        "toggleStyleOnElement": function(options) {
            var element = options.element || this.$el;
            if (options && options.styleName) {
                var styles = $.Arte.dom.getStyles(element);
                if (options.styleValue === styles[options.styleName]) {
                    options.styleValue = "";
                }
                element.css(options.styleName, options.styleValue);
            }

            if (options && options.className) {
                var op = (element.hasClass(options.className)) ? "removeClass" : "addClass";
                element[op](options.className);
            }
        }
    });
})();

/**
 * @fileoverview: Various utility functions
 */
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.util = {
        /*
         * Ensure that if there is a user selection, it is inside of the selected element.
         */
        isSelectionInElement: function(jElement) {
            var selection = rangy.getSelection();
            var range = selection.getAllRanges()[0];
            return range &&
                (range.startContainer === jElement.get(0) || jElement.has(range.startContainer).length !== 0);
        },
        /*
         * Move cursor to the end of the input element
         * @param {htmlElement} element
         */
        moveCursorToEndOfElement: function(element) {
            var range = new rangy.createRangyRange();
            range.selectNodeContents(element);
            range.collapse();

            var selection = rangy.getSelection();
            selection.setSingleRange(range);
        },

        /*
         * Evaluates if all elements in the collection match the condition specified in the callback function
         * @param {Array|Object} collection of objects to evaluate
         * @param {function} callback a function that returns true/false for each object
         * @return {boolean} whether the callback returns true for all objects in the collection
         */
        all: function(collection, callback) {
            var result = true;
            $.each(collection, function(key, value) {
                result = callback(key, value);
                return !!result;
            });
            return result;
        },
        /*
         * Evaluates if any elements in the collection match the condition specified in the callback function
         * @param {Array|Object} collection of objects to evaluate
         * @param {function} callback a function that returns true/false for each object
         * @return {boolean} whether the callback returns true for any objects in the collection
         */
        any: function(collection, callback) {
            var result = true;
            $.each(collection, function(key, value) {
                result = callback(key, value);
                return !result; // stop evaluation
            });
            return result;
        },
        /*
         * Filter a collection based on the result of the callback function
         * @param {Array|Object} collection of objects to evaluate
         * @param {function} callback a function that returns true/false for each object
         * @return {Array} a collection of values that satisfy the condition in callback function
         */
        filterCollection: function(collection, callback) {
            var result = [];
            $.each(collection, function(key, value) {
                if (callback(key, value)) {
                    result.push(collection.length ? value : key);
                }
            });
            return result;
        },
        /**
         * Returns selected text nodes
         */
        getSelectedTextNodes: function(allowCollapsedSelection) {
            var selectedNodes = $();
            var range;
            // Is there a user selection
            var userSelection = rangy.getSelection();
            var isSelectionInElement = $.Arte.util.isSelectionInElement(this.$el);

            // User selection is collapsed or the selection is not valid (i.e. something outside of the text field is selected)
            if (userSelection.isCollapsed || !isSelectionInElement) {
                if (allowCollapsedSelection && isSelectionInElement) {
                    // Get the parent of the node with the cursor
                    range = userSelection.getRangeAt(0);
                    selectedNodes.push(range.startContainer);
                    return selectedNodes;
                }

                // In case we don"t have a valid selection,
                range = rangy.createRangyRange();
                range.selectNodeContents(this.$el.get(0));
                selectedNodes = rangy.util.getTextNodes(range);
            } else if (isSelectionInElement) {
                // We have a valid selection
                range = userSelection.getAllRanges()[0];
                selectedNodes = rangy.util.getTextNodes(range);
            }
            return selectedNodes;
        },
        /*
         * Identify the ArteJS command configuration from className, styleName or tagName
         */
        getCommandConfig: function(options) {
            var result = null;
            var commandAttrType = null;
            var configuration = $.Arte.configuration;
            var constants = $.Arte.constants;
            var verifyTag = function(key, value) {
                return value === options.tagName;
            };

            if (options && options.commandName) {
                return configuration.commands[options.commandName];
            }

            /* Infer the command from the properties in the options. */
            for (var command in configuration.commands) {
                var commandConfig = configuration.commands[command];

                if (options.className && commandConfig.classNameRegex && commandConfig.classNameRegex.test(options.className)) {
                    result = commandConfig;
                    commandAttrType = constants.commandAttrType.className;
                } else if (options.styleName && options.styleName === commandConfig.styleName) {
                    result = commandConfig;
                    commandAttrType = constants.commandAttrType.styleName;
                } else if (options.tagName && !(options.className || options.styleName)) {
                    if ($.isPlainObject(commandConfig.tagName)) {
                        if ($.Arte.util.any(commandConfig.tagName, verifyTag)) {
                            result = commandConfig;
                        }
                    } else if (options.tagName === commandConfig.tagName) {
                        result = commandConfig;
                    }
                    commandAttrType = constants.commandAttrType.tagName;
                }
                if (result) {
                    return $.extend({
                        commandAttrType: commandAttrType
                    }, result);
                }
            }
            return null;
        }
    };
})(jQuery);

/**
 * @FileOverview: Dom clean up routines
 * depends on: jQuery-dom-traversal, jQuery-dom-manipulation
 */

(function($) {
    $.Arte = $.Arte || {};
    $.Arte.dom = $.Arte.dom || {};

    // Cache references
    var dom = $.Arte.dom;
    var configuration = $.Arte.configuration;
    var constants = $.Arte.constants;
    var util = $.Arte.util;

    $.extend(configuration, {
        /**
         * A set of tagNames to which a style/class can be styled.
         * If a tagName is not styleable, the styles/classes will be applied to all of its
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
        supportedTags: {
            "P": 1,
            "UL": 1,
            "OL": 1,
            "LI": 1,
            "SPAN": 1,
            "BR": 1 // Chrome add BR to keep a space
        }
    });

    $.extend(configuration, {
        cleanup: {
            options: {
                removeNonPrintableCharacters: true,
                removeEmptyElements: true,
                removeRedundantMarkup: true,
                mergeAdjacentLists: true
            },

            invalidTagHandlers: {
                "B": {
                    applierTagName: "span",
                    styleName: "font-weight",
                    styleValue: "bold"
                },
                "I": {
                    applierTagName: "span",
                    styleName: "font-style",
                    styleValue: "italic"
                },
                "U": {
                    applierTagName: "span",
                    styleName: "text-decoration",
                    styleValue: "underline"
                },
                "DIV": {
                    applierTagName: "P"
                }
            },

            /**
             * During the cleanup phase, the elements with tagName specified with Key can be merged
             * with the parent element specified by the values.
             * For example, A SPAN can be merged with SPAN/DIV/P/LI while a LI can't be merged with anything
             */
            mergableTags: {
                SPAN: {
                    SPAN: 1,
                    DIV: 1,
                    P: 1,
                    LI: 1
                },
                DIV: {
                    DIV: 1,
                    P: 1,
                    LI: 1
                },
                P: {
                    DIV: 1,
                    P: 1,
                    LI: 1
                },
                LI: {},
                OL: {},
                UL: {},
                B: {
                    B: 1
                },
                U: {
                    U: 1
                },
                I: {
                    I: 1
                },
                STRONG: {
                    STRONG: 1
                },
                SUB: {
                    SUB: 1
                },
                SUP: {
                    SUP: 1
                },
                H1: {
                    H2: 1,
                    H3: 1,
                    H4: 1,
                    H5: 1,
                    H6: 1
                },
                H2: {
                    H1: 1,
                    H3: 1,
                    H4: 1,
                    H5: 1,
                    H6: 1
                },
                H3: {
                    H1: 1,
                    H2: 1,
                    H4: 1,
                    H5: 1,
                    H6: 1
                },
                H4: {
                    H1: 1,
                    H2: 1,
                    H3: 1,
                    H5: 1,
                    H6: 1
                },
                H5: {
                    H1: 1,
                    H2: 1,
                    H3: 1,
                    H4: 1,
                    H6: 1
                },
                H6: {
                    H1: 1,
                    H2: 1,
                    H3: 1,
                    H4: 1,
                    H5: 1
                }
            },

            /**
             * Collection of invalid characters and character ranges
             */
            invalidCharacterRegex: [
                "\u0000-\u001F", // Control Characters
                "\u0080-\u009F", // Latin-Supplement many control characters in this range
                "\u2000-\u200F", // Invisible Puntuation
                "\uE000-\uF8FF" // Private use
            ]
        }
    });

    var cleanupConfig = configuration.cleanup;

    var mergeLists = function(tagName, lists) {
        var filter = function(index, node) {
            return !$(node).is(":emptyTextOrRangySpan");
        };
        // Start from the last element in the list and start merging backward
        while (lists.length) {
            var currentList = $(lists[lists.length - 1]);
            lists.splice(lists.length - 1, 1);
            var prevNode = dom.prevSiblingIncludingTextNodes(currentList, filter);

            // If the previous element has same list tagName, merge both of these elements
            if (prevNode && prevNode.prop("tagName") === tagName) {
                // Move the current node's li children to previous node
                currentList.children().appendTo(prevNode);
                currentList.remove();
            }
        }
    };

    /**
     * Merge adjacent lists within the set of matched element
     * For example <ul><li>1</li><ul><ul><li>2</li></ul> => <ul><li>1</li><li>2</li></ul>
     */
    var mergeAdjacentLists = function(jNodes) {
        jNodes.each(function() {
            mergeLists(constants.tagName.OL, $(this).find(constants.tagName.OL));
            mergeLists(constants.tagName.UL, $(this).find(constants.tagName.UL));
        });
    };

    var seekDirection = {
        Next: 0,
        Prev: 1
    };
    /**
     * Get a next/prev mergable sibling such the sibling is an element with same tagName, styles, classes and is not block
     * @param {jElement} jQuery element to find the sibling of
     * @param {seekDirection} direction to navigate (Prev/Next)
     * @param {function}  function to provide filtering if finding next/prev elements
     * @return {jElement} next/prev element that is mergable
     */
    var getMergableSibling = function(jElement, direction, filter) {
        var result = $();
        var op = direction == seekDirection.Next ? "nextSiblingIncludingTextNodes" : "prevSiblingIncludingTextNodes";
        var adjacentElement = dom[op](jElement, filter);

        // check if the sibling element is mergable
        if (adjacentElement.length &&
                // Has an element sibling
                adjacentElement.is(":element") &&
                // Not a block element
                !adjacentElement.is(":block") &&
                // has same tag
                jElement.prop("tagName") === adjacentElement.prop("tagName") &&
                // has same style and class
                dom.hasSameStyleAndClass(jElement, adjacentElement)) {
            result.push(adjacentElement[0]);
        }
        return result;
    };

    /**
     * Get previous mergable sibling
     * @param {jNode} jQuery element to find the sibling of
     * @param {function}  function to provide filtering if finding next/prev elements
     * @return {jNode} next/prev element that is mergable
     */
    var prevMergableSibling = function(jElement, filter) {
        return getMergableSibling(jElement, seekDirection.Prev, filter);
    };

    /**
     * Get all of the non-empty and non-rangyspan nodes
     * @param {jNode} jQuery element to find the sibling of
     */
    var getContentNodes = function(jElement) {
        return jElement.contents().filter(function(index, node) {
            return !$(node).is(":emptyTextOrRangySpan");
        });
    };

    /*
     * bubbles the style from the children to the parent if possible
     * Example 1: <div><span style="color: black"> ABC </span></div> => <div style="color: black"><span>ABC</span></div>
     * Normalize the styles: Check if we can push the styles of this child node to the parent ($this).
     * Following are three cases to evaluate:
     * 1. if jElement has only once child, simply push all the styles up to the parent
     * 2. if jElement has multiple children and all children has same style, we should push those styles to the parent
     * 3. if any of the JElement's parents have the same style or class applied, remove it from jElement
     * @param {jElement} jElement
     */
    var bubbleStylesFromChildren = function(jElement, options) {
        var contentNodes = getContentNodes(jElement);

        // If we can't apply styles to jElement, don't process further
        if (!configuration.styleableTags[jElement.prop("tagName")]) {
            return false;
        }

        var candidateNodes = contentNodes.filter(function() {
            return $(this).is(":element"); // Only evaluate non-text
        });

        candidateNodes.each(function() {
            var $this = $(this);
            var styles = dom.getStyles($this);
            var classes = dom.getClasses($this);

            if (contentNodes.length === 1) {
                // jElement has only single child, simply apply the push all the styles to $this
                $.each(styles, function(styleName, styleValue) {
                    jElement.css(styleName, styleValue);
                    $this.css(styleName, "");
                });

                $.each(classes, function(index, className) {
                    var commandConfig = util.getCommandConfig({
                        className: className
                    });
                    if (commandConfig && commandConfig.classNameRegex) {
                        dom.removeClassWithPattern(jElement, commandConfig.classNameRegex);
                    }
                    jElement.addClass(className);
                    contentNodes.removeClass(className);
                });
            } else {
                // jElement has 1+ children,
                $.each(styles, function(styleName, styleValue) {
                    var commandConfig = util.getCommandConfig({
                        styleName: styleName
                    });
                    var styleOptions = {
                        commandName: commandConfig.commandName,
                        styleName: styleName,
                        styleValue: styleValue,
                        topEditableParent: options.topEditableParent
                    };
                    // If all of the children have a style value applied, push it to the node
                    if (dom.closestWithCommandValue(contentNodes, styleOptions).length === contentNodes.length) {
                        // All of the nodes have the styles applied
                        jElement.css(styleName, styleValue);
                        contentNodes.css(styleName, "");
                    }
                });
                $.each(classes, function(index, className) {
                    // If all of the contentNodes have a class, push it to the parent and remove it from all contentNodes
                    if (dom.allHaveClass(contentNodes, className)) {
                        var commandConfig = util.getCommandConfig({
                            className: className
                        });
                        if (commandConfig.classNameRegex) {
                            dom.removeClassWithPattern(jElement, commandConfig.classNameRegex);
                        }
                        jElement.addClass(className);
                        contentNodes.removeClass(className);
                    }
                });
            }
        });
    };

    /*
     * Merge the non-block element children of jElement
     * If two siblings have same class and styles merge them
     */
    var mergeChildren = function(jElement) {
        var contentNodes = getContentNodes(jElement);
        for (var i = 1; i < contentNodes.length; i++) {
            var $current = $(contentNodes[i]);
            if (!$current.is(":element") || $current.is(":block")) {
                continue;
            }

            var prev = prevMergableSibling($current);
            if (prev.get(0)) {
                prev.append($current.contents());
                $current.remove();
            }
        }
    };

    /**
     * Remove the redundant child markup.
     * 1) Non-block children => remove the markup if all the styles/classes are applied
     * 2) A single block child => remove the markup if the parent and child tags can be merged
     * 3) Mix of block/non-block children => remove the markup of non-block children all the styles/classes are applied
     * 4) otherwise no-op
     */
    var mergeChildrenWithSelf = function(node, options) {
        var contentNodes = getContentNodes(node);
        var candidateNodes = contentNodes.filter(function() {
            //Find out which nodes are candidates for evaluation to merge up with the parent
            // don't evaluate the text nodes or the block nodes with siblings
            var $this = $(this);
            var mergableTags = cleanupConfig.mergableTags[$this.prop("tagName")];

            return $this.is(":element") &&
                (!$this.is(":block") || contentNodes.length === 1) && // The only block child
                mergableTags && mergableTags[node.prop("tagName")]; // Merge only whitelisted element types
        });

        candidateNodes.each(function() {
            // Try to merge the child and parent;
            var $this = $(this);
            var styles = dom.getStyles($this);
            var classes = dom.getClasses($this);

            // check if the content nodes's style are applied by some parent
            // if so, we can simply unwrap the child
            var allStylesApplied = util.all(styles, function(styleName, styleValue) {
                var commandConfig = util.getCommandConfig({
                    styleName: styleName
                });
                var parentWithStyle = dom.closestWithCommand($this.parent(), {
                    commandName: commandConfig.commandName,
                    styleName: styleName
                });
                return parentWithStyle.get(0) && (dom.getStyles(parentWithStyle)[styleName] === styleValue);
            });

            var parents = $this.parentsUntil(options.topEditableParent.parentNode);
            var allClassesApplied = util.all(classes, function(index, className) {
                return parents.hasClass(className);
            });

            if (allStylesApplied && allClassesApplied) {
                $this.contents().first().unwrap();
                return;
            }
        });
    };

    /***/
    var removeRedundantStylesfromParent = function(jElement, options) {
        var contentNodes = getContentNodes(jElement);
        // If parent has a style that is applied to all of the children, remove it
        var styles = dom.getStyles(jElement);
        $.each(styles, function(styleName, styleValue) {
            var removeStyle = util.all(contentNodes, function(index, contentNode) {
                return dom.getStyles($(contentNode))[styleName];
            }) || dom.closestWithCommandValue(jElement.parent(), {
                styleName: styleName,
                styleValue: styleValue,
                topEditableParent: options.topEditableParent
            }).length > 0;

            if (removeStyle) {
                jElement.css(styleName, "");
            }
        });

        // If parent has a class that is applied to all of th children, remove it
        var classes = dom.getClasses(jElement);
        $.each(classes, function(index, className) {
            var commandConfig = util.getCommandConfig({
                className: className
            });
            var allNodesHaveClass = commandConfig && commandConfig.classNameRegex && util.all(contentNodes, function(index, contentNode) {
                return dom.hasClassWithPattern($(contentNode), commandConfig.classNameRegex);
            }) || jElement.parents().hasClass(className);
            if (allNodesHaveClass) {
                jElement.removeClass(className);
            }
        });
    };

    /**
     * Cleanup Dom recursively (depth first) using the following steps for each element
     * 1) Move styles from the children to the parent element
     * 2) Remove redundant styles from the element
     * 3) Merge the children
     * 4) Unwrap the children
     */
    var removeRedundantMarkup = function(jNodes, options) {
        jNodes.each(function() {
            // Do not merge with the content editable element or the text nodes with the parent
            var $this = $(this);
            if (!$this.is(":element")) {
                return;
            }

            var nodes = getContentNodes($this);
            removeRedundantMarkup(nodes, options);

            // Step 1: Push the styles towards the top
            bubbleStylesFromChildren($this, options);

            // Step 2: If the parent has a style that is explicitly applied to all of its children, remove the style from the parent
            removeRedundantStylesfromParent($this, options);

            // Step 3: Try to merge all of the siblings
            mergeChildren($this, options);

            // Step 4: Check if we can merge any of the children with the parent node by removing the redundant html
            mergeChildrenWithSelf($this, options);
        });
    };

    var processEmptyElement = function(jNode) {
        var parent = jNode.parent();
        if (jNode.is(":block") &&
            dom.nextSiblingIncludingTextNodes(jNode).length &&
            dom.prevSiblingIncludingTextNodes(jNode).length) {
            // If a div has next and prev, empty div is acting like a line break
            // add a line break.
            jNode.before("<br />");
        }
        jNode.remove();
        if (parent.is(":empty")) {
            processEmptyElement(parent);
        }
    };

    /*
     * Clean up: Recursively remove the empty elements until there are not empty elements left
     * For example: <div> <div> <div> </div> </div> </div>
     */
    var removeEmptyElements = function(jNodes) {
        // Exclude the <br/> and rangy selection marker spans
        var emptyElements = jNodes.find(":empty").not("br").not(":rangySpan");
        emptyElements.each(function() {
            processEmptyElement($(this));
        });
    };

    /**
     * If rangy selection marker span is the only child of some element, remove that element
     */
    var handleRangySelectionMarkers = function(jNodes) {
        jNodes.find("." + configuration.rangySelectionBoundaryClassName).each(function() {
            if ($(this).parent().contents().length === 1) {
                $(this).unwrap();
            }
        });
    };

    /**
     * Remove the empty characters from the HTML dom.
     */
    var invalidCharacterRegex;
    var removeNonPrintableCharacters = function(options) {
        var html = options.topEditableParent.innerHTML;
        invalidCharacterRegex = invalidCharacterRegex || new RegExp("[" + cleanupConfig.invalidCharacterRegex.join("") + "]", "g");
        options.topEditableParent.innerHTML = html.replace(invalidCharacterRegex, "");
    };

    /**
     * Remove any redundant markup
     */
    var cleanup = function(jNodes, options) {
        options = $.extend({}, cleanupConfig.options, options);
        if (!options.topEditableParent) {
            options.topEditableParent = dom.getTopEditableParent(jNodes).get(0);
        }
        handleRangySelectionMarkers(jNodes);
        if (options.removeNonPrintableCharacters) {
            removeNonPrintableCharacters(options);
        }
        if (options.removeEmptyElements) {
            removeEmptyElements(jNodes);
        }
        if (options.mergeAdjacentLists) {
            mergeAdjacentLists(jNodes);
        }
        if (options.removeRedundantMarkup) {
            removeRedundantMarkup(jNodes, options);
        }
    };

    /*
     * Check if there are any unsanctioned tags
     */
    var hasUnsanctionedElements = function(jNodes) {
        for (var i = 0; i < jNodes.length; i++) {
            var node = jNodes[i];
            if (node.nodeType == $.Arte.constants.nodeType.TEXT) {
                continue;
            }
            if (!configuration.supportedTags[node.tagName]) {
                return true;
            }
            if (hasUnsanctionedElements($(node).contents())) {
                return true;
            }
        }
        return false;
    };

    /*
     * Remove all unsanctioned tags
     */
    var handleUnsanctionedElements = function(jNodes) {
        jNodes.each(function() {
            if (this.nodeType == $.Arte.constants.nodeType.TEXT) {
                return;
            }

            var $this = $(this);
            handleUnsanctionedElements($this.contents());

            var tagName = this.tagName;
            if (configuration.supportedTags[tagName]) { // Current tag is supported; do nothing
                return;
            }

            // Unsupported tags, construct a replacement node
            var invalidTagHandlerConfig = cleanupConfig.invalidTagHandlers[tagName] || {
                tagName: "P" /* Just wrap the content in a P tag*/
            };
            var newNode = $.Arte.dom.createContainer(invalidTagHandlerConfig).html($this.html());
            $this.replaceWith(newNode);
        });
    };

    // Public API
    dom.hasUnsanctionedElements = hasUnsanctionedElements;
    dom.handleUnsanctionedElements = handleUnsanctionedElements;
    dom.cleanup = cleanup;

})(jQuery);

/**
 * @fileoverview: Various dom manipulation function used by Arte
 */
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.dom = $.Arte.dom || {};
    var dom = $.Arte.dom;
    var configuration = $.Arte.configuration;
    var constants = $.Arte.constants;

    /**
     * wrap elements/nodes
     * In addition, if there is a rangySelectionBoundary span before or after the nodes to wrap,
     * include them in the wrap container
     */
    $.extend(dom, {
        wrapWithOptions: function(jNodes, options) {
            var wrapContainer = $();
            if (jNodes.length > 0) {
                wrapContainer = dom.createContainer(options);
                var rangyStartTag = dom.prevSiblingIncludingTextNodes(jNodes.first());
                if (rangyStartTag.hasClass(configuration.rangySelectionBoundaryClassName)) {
                    wrapContainer.append(rangyStartTag);
                }
                var rangyEndTag = dom.nextSiblingIncludingTextNodes(jNodes.last());

                jNodes.first().before(wrapContainer);
                jNodes.each(function() {
                    wrapContainer.append(this);
                });

                if (rangyEndTag.hasClass(configuration.rangySelectionBoundaryClassName)) {
                    wrapContainer.append(rangyEndTag);
                }
            }
            return wrapContainer;
        },

        /*
         * unwrap the elements/nodes
         * Unwrap each element in the jQuery selection and add br tag at the end if specified.
         */
        unwrapWithOptions: function(jNodes, options) {
            var children = $();

            jNodes.each(function() {
                var $this = $(this);

                // While unwrapping a block element, don't lose the line breaks before or after
                // For example: unwrapping the div in abc<div>elementToUnwrap</div>otherContent
                // should result in abc<br/>elementToUnwrap<br/>otherContent to maintain visual
                // consistency

                var filter = function(index, node) {
                    return !$(node).is(":emptyTextOrRangySpan");
                };

                if ($this.is(":block")) {
                    var prevNode = dom.prevSiblingIncludingTextNodes($this, filter);
                    if (prevNode.length && !prevNode.is(":block") && options && options.insertBr) {
                        $this.before($("<br />"));
                    }

                    // We need to insert a <br/> after this node if the current node has next node that is not block.
                    var nextNode = dom.nextSiblingIncludingTextNodes($this, filter);
                    if (nextNode.length && !nextNode.is(":block") && options && options.insertBr) {
                        $this.after($("<br />"));
                    }
                }

                var contents = $(this).contents();

                // If this node has any styles, we should maintain them
                if (options && options.maintainStyles) {
                    var newContainer = dom.wrapWithOptions(contents, {
                        applierTagName: "span",
                        attr: {
                            style: $this.attr("style")
                        }
                    });
                    newContainer.unwrap();
                    children = children.add(newContainer);
                } else {
                    contents.first().unwrap();
                    children = children.add(contents);
                }
            });

            return children;
        },

        /**
         * Surround a set of nodes with a block element.  If a block parent exist, apply the styles
         * to the existing block if there are attributes, or update the tagName of the block parent.
         */
        wrapWithBlock: function(jNodes, blockOptions) {
            // Get a block Parent for this range.
            var blockParent = dom.closestWithAtMostOneBlockChild(jNodes, blockOptions.topEditableParent);
            var tagName = blockParent.prop("tagName");
            var nodesToWrap;
            // Does not have a block parent with desired tagName or the block parent is LI
            // LI is a special case as we never want to wrap a LI with anything (except )
            if (!blockParent.first().is(":block") || // top parent is not a block element
                blockOptions.applierTagName === constants.tagName.LI || // want to wrap the nodes with LI
                !configuration.styleableTags[tagName]) {
                nodesToWrap = blockParent;
            } else if (tagName === blockOptions.applierTagName ||
                (configuration.styleableTags[tagName] && configuration.styleableTags[blockOptions.applierTagName])) {
                if (blockOptions.styleName) {
                    blockParent.css(blockOptions.styleName, blockOptions.styleValue);
                } else if (blockOptions.className) {
                    blockParent.addClass(blockOptions.className);
                } else {
                    // e.g. wrapping a LI with a OL.
                    nodesToWrap = blockParent;
                }
            } else {
                nodesToWrap = jNodes;
            }

            var container = nodesToWrap ? dom.wrapWithOptions(nodesToWrap, blockOptions) : blockParent;

            // In case there is a immediate sibling of line break, remove that
            var br = container.next();
            if (br.length && br.prop("tagName") == constants.tagName.BR) {
                br.remove();
            }
            return container;
        },

        /*
         * block unsurround
         */
        unwrapBlock: function(jNodes, blockOptions) {
            var blockParent = dom.closestWithCommand(jNodes, blockOptions);
            if (!blockParent.length) {
                return jNodes;
            }

            // In this case the blockParent has multiple styles or is the contentEditable, only remove the styles
            if (!$.isEmptyObject(dom.getStyles(blockParent)) ||
                    dom.getClasses(blockParent).length > 0 ||
                    blockParent.attr("contentEditable")) {
                if (blockOptions.styleName) {
                    return blockParent.css(blockOptions.styleName, "");
                } else if (blockOptions.className) {
                    return blockParent.removeClass(blockOptions.className);
                }
            } else {
                return dom.unwrapWithOptions(blockParent, {
                    "insertBr": true
                });
            }
        },

        /**
         * Create a dom element with options
         * @param {object} a set of dom element creation options
         *                 tagName, attr, styleName+styleValue, className
         * @return {jNode} A jQuery element
         */
        createContainer: function(options) {
            var tagName = options.applierTagName || "div";
            var newElement = $("<" + tagName + ">");
            if (options.attr) {
                newElement.attr(options.attr);
            }
            if (options.styleName && options.styleValue) {
                newElement.css(options.styleName, options.styleValue);
            }
            if (options.className) {
                newElement.addClass(options.className);
            }
            return newElement;
        }
    });
})(jQuery);

/**
 * @fileoverview This file includes a collection of extension to jQuery that allows complex traversals of dom tree
 */
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.dom = $.Arte.dom || {};
    var dom = $.Arte.dom;
    var constants = $.Arte.constants;
    var configuration = $.Arte.configuration;
    var util = $.Arte.util;
    //Sizzle extension
    $.extend($.expr[":"], {
        /**
         * Sizzle lis to find block level elements
         * Usage:
         * - $("body :block") // returns all block elements inside body tag.
         * - $(element).is(":block") // will check if element is block or not.
         */
        block: function(element) {
            // Check if computed display of the element is block and float is not set.
            return element.nodeType !== 3 && ((element && element.tagName === "BR") || (($(element).css("display") === "block" ||
                $(element).css("display") === "list-item") && $(element).css("float") === "none"));
        },
        /**
         * Checks if the jQuery node is an element
         * Usage: jElement.is(":element");
         */
        element: function(element) {
            return element.nodeType === constants.nodeType.ELEMENT;
        },
        emptyText: function(element) {
            return element.nodeType === 3 && (element.nodeValue.match(/^\s*$/ig) !== null);
        },
        rangySpan: function(element) {
            return $(element).hasClass(configuration.rangySelectionBoundaryClassName);
        },
        emptyTextOrRangySpan: function(element) {
            var $element = $(element);
            return $element.is(":emptyText") || $element.is(":rangySpan");
        },
        /**
         * Find all elements that have block level children nodes
         * Usage: $("div").not(":blockChildren") - will return all div elements that don't have block children
         */
        blockChildren: function(element) {
            // Get all children of current element, remove the element itself and filter out none block children;
            return $(element).children().not(this).filter(":block").length > 0;
        }
    });

    /**
     * Get a next or previous sibling node (text or element) and allows filtering
     * @param {htmlNodes} nodes
     * @param {bool} direction
     * @param {function} additional filtering (for example, excluding empty nodes)
     * @return next or previous node
     */
    var seekDirection = {
        Next: 0,
        Prev: 1
    };

    function getSiblingIncludingTextNodes(nodes, direction, filter) {
        var allNodes = $();
        var isNext = direction === seekDirection.Next;
        nodes.each(function() {
            var result;
            var children = $(this).parent().contents().get();
            var index = $.inArray($(this).get(0), children);

            // Based on the seekDirection, we want to move forward or backward
            var increment = isNext ? 1 : -1;
            for (var i = index + increment; isNext ? i < children.length : i >= 0; i = i + increment) {
                var filterResult = filter ? filter(i, children[i]) : true;
                if (filterResult) {
                    result = children[i];
                    break;
                }
            }
            if (result) {
                allNodes.push(result);
            }
        });
        return allNodes;
    }

    /**
     * Overriding jQuery native function that can't operate on text nodes.
     */
    if (document.documentElement.contains) {
        jQuery.contains = function(a, b) {
            //IE contains function on the same node will return true, vs. other browsers returning false.
            //This code will to fix this behavior.
            if (a === b) {
                return false;
            }

            //if a is a text node it can't contain anything
            if (a.nodeType === 3) {
                return false;
            }

            //Sizzle can't handle contains when one of the parameters is a textNode
            var bup = b.parentNode || {};
            return a === bup || (bup.nodeType === 1 ? (!a.contains || a.contains(bup)) :
                ((a !== b && a.contains) ? a.contains(b) : true));
        };
    }

    $.extend(dom, {
        /**
         * Get top most parent such that there are is either no block child or only one block child
         * @param {jElement} topMostElement absolute ceiling (for example the top content editable element).
         * @return {jElement} parent node or the input jquery object
         */
        closestWithAtMostOneBlockChild: function(jNode, topMostElement) {
            var allNodes = [];
            jNode.each(function() {
                var parent = null;
                $(this).parentsUntil(topMostElement).each(function() {
                    var blockChildrenCount = $(this).children(":block").length;
                        // 0 or 1 block child
                    var isValid = (blockChildrenCount === 0) ||
                        // There are not other non-block children
                        (blockChildrenCount === 1 && blockChildrenCount === this.childNodes.length);
                    if (isValid) {
                        parent = this;
                    }
                    return isValid;
                });
                var result = parent || this;

                // don't include duplicate nodes
                if ($.inArray(result, allNodes) === -1) {
                    allNodes.push(result);
                }
            });

            return $(allNodes);
        },

        /**
         * Get previous node (text or element) and allows filtering
         * @param {function} additional filtering (for example, excluding empty nodes)
         * @return previous node
         */
        prevSiblingIncludingTextNodes: function(jNodes, filter) {
            return getSiblingIncludingTextNodes(jNodes, seekDirection.Prev, filter);
        },

        /**
         * Get next node (text or element) and allows filtering
         * @param {function} additional filtering (for example, excluding empty nodes)
         * @return next node
         */
        nextSiblingIncludingTextNodes: function(jNodes, filter) {
            return getSiblingIncludingTextNodes(jNodes, seekDirection.Next, filter);
        },

        /**
         * Split the classes of a jQuery element
         * @return {array} List of classes
         */
        getClasses: function(jNode) {
            var result = [];
            var classString = jNode.attr("class");
            if (classString) {
                result = classString.split(/\s+/);
            }
            return result;
        },

        /**
         * Parses the styles of the first object in the jQuery element
         * @return {array} an object representing the styles and their values
         */
        getStyles: function(jNode) {
            var returnValue = {};
            if (jNode.prop("nodeType") === constants.nodeType.TEXT) { // Text nodes won't have any styles set.
                return returnValue;
            }

            // The css style enumeration doesn't work in IE7 so we have to use the cssText to check which styles are set
            var style = jNode.attr("style");
            var cssText = (style) ? style.toLowerCase().split(";") : [];

            $.each(cssText, function(i, value) {
                value = $.trim(value);
                if (!value) {
                    return true;
                }

                var index = value.indexOf(":");
                var styleKey = $.trim(value.substring(0, index));
                var styleValue = $.trim(value.substring(index + 1));
                // Note: in IE setting the css value of a style to "" would retain this value in the cssText
                // Filter out the null/empty values
                if (styleValue) {
                    returnValue[styleKey] = styleValue;
                }
            });
            return returnValue;
        },

        /**
         * Check if a particular command is applied to the node
         * For example, the nodes <span style="font-weight:bold">ABC</span> or <span class="arte-font-weight">ABC</span>
         * have font-weight command applied and <b>ABC</b> have bold command applied
         * @param {string} commandName [see Arte.configuration.commands]
         */
        hasCommandApplied: function(jNodes, commandName) {
            var result = false;
            var commandConfig = configuration.commands[commandName];
            jNodes.each(function() {
                var $this = $(this);
                if (this.nodeType === constants.nodeType.TEXT) {
                    result = false;
                    return result;
                }
                var styles = dom.getStyles($this);
                result = (commandConfig.classNameRegex && dom.hasClassWithPattern($this, commandConfig.classNameRegex)) ||
                    (commandConfig.styleName && styles[commandConfig.styleName]) ||
                    (commandConfig.tagName && this.tagName === commandConfig.tagName);
                return result;
            });
            return result;
        },

        /**
         * Check if a particular style, class, tag is applied to the node
         * @param jNode
         * @param options Set of options for this command
         * @param [options.className] className, (e.g. arte-font-weight)
         * @param [options.styleName] styleName (e.g. font-weight)
         * @param [options.styleValue] styleValue (e.g. bold)
         * @param [options.tagName] tagName (e.g. p or div)
         */
        hasCommandValue: function(jNode, options) {
            var result = false;
            jNode.each(function() {
                var $this = $(this);
                result = (options.className && $this.hasClass(options.className)) ||
                    (options.styleName && dom.getStyles($this)[options.styleName] === options.styleValue) ||
                    (options.tagName && $this.prop("tagName") === options.tagName);
                return result;
            });
            return result;
        },

        getCommandValue: function(jNode, options) {
            var result = {};
            var commandConfig = configuration.commands[options.commandName];
            jNode.each(function() {
                var $this = $(this);
                var styles = dom.getStyles($this);
                if (options.className && $this.hasClass(options.className)) {
                    result.className = options.className;
                } else if (dom.hasClassWithPattern($this, commandConfig.classNameRegex)) {
                    result.className = dom.getClassWithPattern($this, commandConfig.classNameRegex)[0];
                } else if (options.styleName && styles[options.styleName]) {
                    result.styleName = styles[options.styleName];
                } else if (options.tagName && $this.prop("tagName") === commandConfig.tagName) {
                    result.tagName = $this.prop("tagName");
                }
                return result;
            });
            return result;
        },
        /**
         * Check if the input element has a class that matches the pattern
         * @param jNode
         * @param {string} regex pattern (see Arte.configuration.commands)
         * @return {bool} whether the element has a class with the pattern
         */
        hasClassWithPattern: function(jNode, pattern) {
            return pattern.test(jNode.attr("class"));
        },

        /**
         * Gets the class that matches the pattern
         * @param jNode
         * @param {string} regex pattern (see Arte.configuration.commands)
         * @return {string} Returns the class with pattern or null
         */
        getClassWithPattern: function(jNode, pattern) {
            return pattern.exec(jNode.attr("class"));
        },

        /**
         *  Remove class that matches the pattern
         * @param jNode
         * @param {string} regex pattern (see Arte.configuration.commands)
         */
        removeClassWithPattern: function(jNode, pattern) {
            var classNames = dom.getClassWithPattern(jNode, pattern) || [];
            $.each(classNames, function(index, className) {
                jNode.removeClass(className);
            });
        },

        /**
         * Checks if all the list elements are surrounded by same list parent
         * @param jNodes Collection of LI elements
         * @return {bool} Whether all of the list elements have same parent
         */
        hasSameListParent: function(jNodes) {
            var parent = jNodes.first().closest(constants.tagName.LI).parent();
            if (parent.length === 0) {
                return false;
            }

            var hasSameParent = true;
            jNodes.each(function() {
                hasSameParent = parent.has(this).length !== 0;
                return hasSameParent;
            });
            return hasSameParent;
        },

        /**
         * Checks if all the input elements have a class
         * @param {string} className
         * @return {bool} Whether all of the selected nodes have the className applied
         */
        allHaveClass: function(jNodes, className) {
            var hasClass = true;
            jNodes.each(function() {
                hasClass = $(this).hasClass(className);
                return hasClass;
            });
            return hasClass;
        },

        /**
         * Checks whether jLeftNode and jRightNode have same classes applied.
         * @param {jLeftNode} jQuery Node
         * @param {jRightNode} jQuery Node
         * @return {bool} whether both elements have same classes applied
         */
        hasSameClass: function(jLeftNode, jRightNode) {
            var thisClasses = {};
            var thatClasses = {};
            $.each(dom.getClasses(jLeftNode), function() {
                thisClasses[this] = 1;
            });
            $.each(dom.getClasses(jRightNode), function() {
                thatClasses[this] = 1;
            });
            return util.all(thisClasses, function(key) {
                    return thatClasses[key];
                }) &&
                util.all(thatClasses, function(key) {
                    return thisClasses[key];
                });
        },

        /**
         * Checks whether jLeftNode and jRightNode have same styles applied.
         * @param {jLeftNode} jQuery Node
         * @param {jRightNode} jQuery Node
         * @return {bool} whether both elements have same styles applied
         */
        hasSameStyle: function(jLeftNode, jRightNode) {
            var thisStyles = dom.getStyles(jLeftNode);
            var thatStyles = dom.getStyles(jRightNode);
            return util.all(thisStyles, function(key, value) {
                    return thatStyles[key] === value;
                }) &&
                util.all(thatStyles, function(key, value) {
                    return thisStyles[key] === value;
                });
        },

        /**
         * Checks whether jLeftNode and jRightNode have same styles and same classes applied.
         * @param {jLeftNode} jQuery Node
         * @param {jRightNode} jQuery Node
         * @return {bool} whether both elements have same styles and classes applied
         */
        hasSameStyleAndClass: function(jLeftNode, jRightNode) {
            return dom.hasSameStyle(jLeftNode, jRightNode) && dom.hasSameClass(jLeftNode, jRightNode);
        },

        /**
         * Get the closest node to which the command value is applied
         * @param jNode
         * @param options see closestWithCommand for more information
         * @return {jElements}  Set of jQuery elements that have the command applied
         */
        closestWithCommandValue: function(jNode, options) {
            return dom.closestWithCommand(jNode, $.extend(options, {
                checkValue: 1
            }));
        },

        /*
         * Evaluates an element or its parents have a style/class/tag applied
         * @param jNode
         * @param options Command Options
         * @param [options.commandName] commandName; if not supplied the command is inferred from the styleName or className
         * @param [options.styleName] name of css style to check
         * @param [options.styleValue] value of the css style to verify if checkValue is set
         * @param [options.className] name of the class to check
         * @param [options.topEditbleParent] ceiling html node to evaluate for result
         * @param [options.checkValue] whether to check the style/class value
         * @return {jElements}  Set of jQuery elements that have the command applied
         */
        closestWithCommand: function(jNode, options) {
            var result = $();
            var commandConfig = util.getCommandConfig(options);
            if (!commandConfig) {
                return result;
            }

            jNode.each(function() {
                var $this = $(this);
                var topLevelNode = options.topEditableParent || dom.getTopEditableParent($this).get(0);
                if (topLevelNode) {
                    var parentsAndSelf = $this.parentsUntil(topLevelNode.parentNode);
                    parentsAndSelf.splice(0, 0, this);
                    parentsAndSelf.each(function() {
                        if (dom.hasCommandApplied($(this), commandConfig.commandName)) {
                            // Add to result if check value is not requested or the node has the command value applied
                            if (!options.checkValue || dom.hasCommandValue($(this), options)) {
                                result.push(this);
                            }
                            return false; // Exit the loop
                        }
                        return true;
                    });
                }
            });
            return result;
        },

        /*
         * Get the top contentEditableElement or TextArea
         * @param jNode
         * @return {jElement} top level editable element
         */
        getTopEditableParent: function(jNode) {
            var contentEditable = jNode.closest("[contenteditable=true]");
            return contentEditable.length ? contentEditable : jNode.closest("textarea");
        },

        /**
         * Checks if all of the input nodes are surrounded by a list
         * @param {options}
         *   singleList: true|false
         *   tagName: OL|UL
         * @return boolean
         */
        listSurrounded: function(jNode, options) {
            var allNodesListSurrounded = util.all(jNode, function(index, node) {
                return $(node).closest(constants.tagName.LI).parents("[contenteditable=true]").get(0);
            });

            if (allNodesListSurrounded) {
                var parents = jNode.closest(constants.tagName.LI).parent();
                if (options && options.singleList && parents.length > 1) { // the LI elements belong to different lists
                    return false;
                }

                if (options && options.tagName) {
                    var hasSameTagName = false;
                    parents.each(function(index, element) {
                        hasSameTagName = element.tagName === options.tagName;
                        return hasSameTagName;
                    });
                    return hasSameTagName;
                }
                return true;
            }

            return false;
        },

        isEqual: function(jNode1, jNode2) {
            if (!jNode1.get(0) || !jNode2.get(0)) {
                return false;
            }

            var isEqual = true;

            // Attributes to check when comparing the nodes
            var attributes = ["style", "id", "class"];

            //compare node
            if (jNode1.prop("tagName") === jNode2.prop("tagName")) {
                //compare attributes
                $.each(attributes, function(index, attrib) {
                    if (attrib === "style") {
                        isEqual = $.Arte.dom.hasSameStyle(jNode1, jNode2);
                    } else if (attrib === "class") {
                        isEqual = $.Arte.dom.hasSameClass(jNode1, jNode2);
                    } else {
                        var thisAttr = jNode1.attr(attrib) && $.trim(jNode1.attr(attrib));
                        var thatAttr = jNode2.attr(attrib) && $.trim(jNode2.attr(attrib));

                        isEqual = thisAttr === thatAttr;
                    }
                    return isEqual;
                });

                if (isEqual) {
                    //check children nodes
                    var noEmptyTextNodesFilter = function(index, node) {
                        return !$(node).is(":emptyText");
                    };
                    var thisContent = jNode1.contents().filter(noEmptyTextNodesFilter);
                    var thatContent = jNode2.contents().filter(noEmptyTextNodesFilter);

                    // has same child count
                    isEqual = thisContent.length === thatContent.length;

                    for (var i = 0, l = thisContent.length; i < l && isEqual; i++) {
                        isEqual = thisContent[i].nodeType === 3 ?
                            $.trim(thisContent[i].nodeValue) === $.trim(thatContent[i].nodeValue) :
                            $.Arte.dom.isEqual($(thisContent[i]), $(thatContent[i]));
                    }
                }
            } else {
                isEqual = false;
            }

            return isEqual;
        }
    });

})(jQuery);

rangy.createModule("BlockElementApplier", ["WrappedSelection", "WrappedRange"], function(api) {
    var dom = $.Arte.dom;
    var constants = $.Arte.constants;

    /**
     * An object to holde the result of block surround test operation
     */
    var blockSurroundState = function() {
        this.Surrounded = 0; // All of the blocks in the range are surrounded
        this.UnSurrounded = 1; // All of the blocks in the range are not surrounded
        this.Mixed = 2; // Some of the blocks in the range are surrounded
        this.Invalid = 3; // Invalid State

        this.surroundedIndexes = []; // collection of surrounded ranges
        this.unSurroundedIndexes = []; // collection of unsurrounded ranges

        this._state = "";
        this.computeState = function() {
            // All surrounded
            if (this.surroundedIndexes.length && !this.unSurroundedIndexes.length) {
                this._state = this.Surrounded;
                // All un-surrounded
            } else if (this.unSurroundedIndexes.length && !this.surroundedIndexes.length) {
                this._state = this.UnSurrounded;
                // Some are surrounded and some are not surrounded
            } else if (this.surroundedIndexes.length && this.unSurroundedIndexes.length) {
                this._state = this.Mixed;
                // Something weird happened
            } else {
                this._state = this.Invalid;
            }
            return this._state;
        };

        this.state = function(newState) {
            if (newState) {
                this._state = newState;
            }
            if (!this._state) {
                this._state = this.computeState();
            }
            return this._state;
        };
    };

    /**
     * Checks if all of the block ranges block surrounded and the attributes are applied to the parent node
     * @param {[rangyRanges]} ranges
     * @return result object
     */
    function areRangesBlockSurrounded(ranges, options) {
        var rangeCount = ranges.length;
        var surroundState = new blockSurroundState();
        var nodesByRange = getTopNodesFromRanges(ranges);
        var bucket;

        for (var i = 0; i < rangeCount; i++) {
            bucket = (dom.closestWithCommandValue(nodesByRange[i], options).length > 0) ?
                    surroundState.surroundedIndexes :
                    surroundState.unSurroundedIndexes;
            bucket.push(i);
        }

        return surroundState;
    }

    /**
     * Checks if a set of ranges is block surrounded by a LI tag
     * In case all of the ranges are surrounded, also checks if the surrounded blocks are surrounded by the same ol/ul parent
     * @param {[rangyRanges]} ranges
     * @param {BlockSurroundOptions} options
     * @return BlockSurroundResult
     */
    function isBlockSetSurrounded(ranges, blockOptions) {
        // Check if all of the ranges are surrounded by LI.
        var surroundState = areRangesBlockSurrounded(ranges, {
            tagName: constants.tagName.LI,
            commandAttrType: blockOptions.commandAttrType,
            topEditableParent: blockOptions.topEditableParent
        });

        // Make sure in case all the ranges are surrounded, they are surrounded by same list parent;
        // if not, change the state to Mixed
        // In case there are two lists next to each other
        if (surroundState.state() === surroundState.Surrounded) {
            var listElements = $();
            $.each(ranges, function(index, range) {
                var li = $(rangy.util.getTopNodes(range.getNodes())).closest(constants.tagName.LI);
                listElements.push(li.get(0));
            });

            if (!dom.hasSameListParent(listElements)) {
                // Check if all of the list element are part of same list
                // Mixed State => <ol> <li> first </li> </ol> <ol> <li> second </li> <ol>
                surroundState.state(surroundState.Mixed);
            } else {
                // Check if the list tag is not the one we want
                var parent = listElements.first().parent();
                if (parent.prop("tagName") !== blockOptions.applierTagName.toUpperCase()) {
                    surroundState.state(surroundState.UnSurrounded);
                }
            }
        }
        return surroundState;
    }

    /*
     * Given a range and a list, determent how many list items are before, inside and after the range
     */
    function getSelectedListElements(jListParent, blockOptions) {
        var jListElement = jListParent.children();

        // construct a list of nodes that are after and before the selection
        var beforeSelection = $();
        var selection = $();
        var afterSelection = $();
        var target = beforeSelection;

        jListElement.each(function() {
            if (blockOptions.originalRange.intersectsNode(this)) {
                target = afterSelection;
                selection.push(this);
                return true;
            }
            target.push(this);
            return true;
        });

        return {
            tagName: jListParent.prop("tagName"),
            beforeSelection: beforeSelection,
            selection: selection,
            afterSelection: afterSelection
        };
    }

    /**
     * Gets nodes from ranges
     * Note that once the dom is manipulated, the ranges are no longer valid
     * @param {[rangyRanges]} ranges
     * @return object with nodeIndex -> [nodes in the range] mapping
     */
    function getTopNodesFromRanges(ranges) {
        var nodeCollection = {};
        var func = function() {
            nodeCollection[i].push(this);
        };

        for (var i = 0; i < ranges.length; i++) {
            nodeCollection[i] = $();
            $(rangy.util.getTopNodes(ranges[i].getNodes())).each(func);
        }
        return nodeCollection;
    }

    /*
     * If there are partially selected lists at the begining or end of selection, properly close the
     * non selected list elements.
     */
    function closeListsAroundSelection(splitRanges, blockOptions) {
        var blockSurroundedResult = blockOptions.blockSurroundState;

        var wrapUnselectedListItems = function(selectionResult) {
            var wrapWithBlock = dom.wrapWithBlock;
            // close the list before and after the selection
            wrapWithBlock(selectionResult.beforeSelection, {
                applierTagName: selectionResult.tagName
            });
            wrapWithBlock(selectionResult.afterSelection, {
                applierTagName: selectionResult.tagName
            });
        };

        var evaluateSelection = function(selectedElement) {
            var parent = selectedElement.closest(constants.tagName.LI).parent();
            var selectionResult = getSelectedListElements(parent, blockOptions);
            return {
                parent: parent,
                selectionResult: selectionResult
            };
        };

        // Check if the first and/or the last range is surrounded
        var selectionBegin;
        if (blockSurroundedResult.surroundedIndexes[0] === 0) { // first block in the range is surrounded
            selectionBegin = evaluateSelection($(splitRanges[0].startContainer));
        }

        var rangeCount = splitRanges.length;
        var selectionEnd;

        // Last block in the range is surrounded
        if (blockSurroundedResult.surroundedIndexes[blockSurroundedResult.surroundedIndexes.length - 1] === rangeCount - 1) {
            selectionEnd = evaluateSelection($(splitRanges[rangeCount - 1].startContainer));
        }

        // If the first or the last range is surrounded, remove the selected List elements and properly close the lists
        if (selectionBegin) {
            dom.unwrapWithOptions(selectionBegin.parent);
            wrapUnselectedListItems(selectionBegin.selectionResult);
        }

        if (selectionEnd && (!selectionBegin || (selectionBegin.parent[0] !== selectionEnd.parent[0]))) {
            dom.unwrapWithOptions(selectionEnd.parent);
            wrapUnselectedListItems(selectionEnd.selectionResult);
        }
    }

    /**
     * Wrap each range in split ranges with LI and then wrap all LIs into a UL/OL
     * @param {[rangyRanges]} splitRanges
     * @param {blockSurroundOptions} blockOptions
     * @return an array of new ranges
     */
    function surroundRangeSet(splitRanges, blockOptions) {
        var blockSurroundedResult = blockOptions.blockSurroundState;
        var nodesByBlockRange = getTopNodesFromRanges(splitRanges);
        var wrappedNodes = $();

        closeListsAroundSelection(splitRanges, blockOptions);
        // Create mapping lookup table
        var rangeLookup = {};
        $.each(blockSurroundedResult.surroundedIndexes, function() {
            rangeLookup[this] = 1;
        });

        var addToWrappedNodes = function() {
            wrappedNodes.push(this);
        };

        // Handle the selected elements
        var rangeCount = splitRanges.length;
        for (var i = 0; i < rangeCount; i++) {
            var nodeContainer;
            if (!rangeLookup[i]) {
                // If a selection includes a empty line (ex. <br/>some text) a rangy
                // selection span gets inserted at the  beginning of the block tag
                // in this case we don't want to wrap this into a block.
                if (nodesByBlockRange[i][0].nodeType == 3 && nodesByBlockRange[i][0].nodeValue.charCodeAt(0) == 65279) {
                    continue;
                }

                nodeContainer = dom.wrapWithBlock(nodesByBlockRange[i], {
                    applierTagName: constants.tagName.LI,
                    topEditableParent: blockOptions.topEditableParent
                });
                wrappedNodes.push(nodeContainer[0]);
            } else {
                // Skip over the nodes that we already unwrapped
                var node = nodesByBlockRange[i].first().closest(constants.tagName.LI);
                if (!(node.parents(constants.tagName.OL)[0] || node.parents(constants.tagName.UL)[0])) {
                    wrappedNodes.push(node[0]);
                    continue;
                }

                // This list is completely with-in a selection
                node.parent().children().each(addToWrappedNodes);
                dom.unwrapWithOptions(node.parent());
            }
        }

        dom.wrapWithOptions(wrappedNodes, blockOptions);
    }

    /**
     * Unwrap each range in split ranges from LI and UL and properly close the Ol/UL of the non-selected list elements
     * @param {[rangyRanges]} splitRanges
     * @param {blockSurroundOptions} blockOptions
     * @return an array of new ranges
     */
    function unSurroundRangeSet(splitRanges, blockOptions) {
        var jParent = $(splitRanges[0].startContainer).closest(constants.tagName.LI).parent();
        var parentTag = jParent.prop("tagName");

        var selectedLIs = getSelectedListElements(jParent, blockOptions);

        // Remove the ul/ol parent
        dom.unwrapWithOptions(jParent);

        // close the list before the selection
        dom.wrapWithOptions(selectedLIs.beforeSelection, {
            applierTagName: parentTag
        });

        // for these nodes, we want to remove the list tags
        dom.unwrapWithOptions(selectedLIs.selection, {
            "insertBr": true,
            "maintainStyles": true
        });

        // close the list after the selection
        dom.wrapWithOptions(selectedLIs.afterSelection, {
            applierTagName: parentTag
        });
    }

    /**
     * Given a set of selections and content ranges, expand the selection ranges to block level elements
     * @param {rangyRange} selectionRange
     * @param {rangyRange} contentRange
     * @return expanded range
     */
    function expandRange(selectionRange, topEditableParent) {
        if (!topEditableParent) {
            return selectionRange;
        }

        var contentEditableRange = rangy.createRangyRange();
        contentEditableRange.selectNodeContents(topEditableParent);
        //Get all ranges within contentRange
        var blocks = contentEditableRange.splitByBlock();
        var clonedSelectionRange = selectionRange.cloneRange();

        //Loop through blocks and find intersections with selection
        for (var i = 0, l = blocks.length; i < l; i++) {
            if (clonedSelectionRange.intersectsRange(blocks[i])) {
                //if begging of the selection is inside the current block, expend the begging of selection to the begging of the block
                if (blocks[i].comparePoint(clonedSelectionRange.startContainer, clonedSelectionRange.startOffset) === 0) {
                    clonedSelectionRange.setStart(blocks[i].startContainer, blocks[i].startOffset);
                }
                //otherwise if end of the selection is inside the current block, expend the end of selection to the end of the block
                if (blocks[i].comparePoint(clonedSelectionRange.endContainer, clonedSelectionRange.endOffset) === 0) {
                    clonedSelectionRange.setEnd(blocks[i].endContainer, blocks[i].endOffset);
                }
            }
        }
        return clonedSelectionRange;
    }

    /**
     * Toggle surround a range with list element
     * @param {[rangyRanges]} splitRanges
     * @param {blockSurroundOptions} blockOptions
     * @return an array of new ranges
     */
    function toggleSurroundRangeSet(range, options) {
        var blockOptions = new $.Arte.ElementApplierOptions(options);

        var expandedRanges = expandRange(range, options.topEditableParent);

        blockOptions.originalRange = expandedRanges;
        var splitRanges = expandedRanges.splitByBlock();
        var surroundState = isBlockSetSurrounded(splitRanges, blockOptions);
        blockOptions.blockSurroundState = surroundState;

        if (surroundState.state() === surroundState.UnSurrounded ||
            surroundState.state() === surroundState.Mixed) {
            surroundRangeSet(splitRanges, blockOptions);
        } else if (surroundState.state() === surroundState.Surrounded) {
            unSurroundRangeSet(splitRanges, blockOptions);
        }
    }

    /**
     * Toggle surround a selection with list element
     * @param {[rangyRanges]} splitRanges
     * @param {blockSurroundOptions} blockOptions
     * @return an array of new ranges
     */
    function toggleSurroundSelectionSet(options, topEditableParent) {
        var blockOptions = new $.Arte.ElementApplierOptions(options, topEditableParent);
        var selection = rangy.getSelection();
        var range = selection.getRangeAt(0);
        if (range) {
            toggleSurroundRangeSet(range, blockOptions);
        }
    }

    /**
     * Toggle surround each range in split ranges
     * @param {[rangyRanges]} splitRanges
     * @param {blockSurroundOptions} blockOptions
     * @return an array of new ranges
     */
    function toggleSurroundRange(range, options) {
        if (range.isCollapsed) {
            return;
        }

        var blockOptions = new $.Arte.ElementApplierOptions(options);

        var expandedRange = expandRange(range, options.topEditableParent);

        var splitRanges = expandedRange.splitByBlock();
        var surroundState = areRangesBlockSurrounded(splitRanges, blockOptions);
        var nodesByRange = getTopNodesFromRanges(splitRanges);

        // Iterate over each range and surround the content of the range with a block level element
        for (var rangeIndex in nodesByRange) {
            var jNodes = nodesByRange[rangeIndex];
            if (surroundState.state() == surroundState.Surrounded) {
                dom.unwrapBlock(jNodes, blockOptions);
            } else {
                dom.wrapWithBlock(nodesByRange[rangeIndex], blockOptions);
            }
        }
    }

    /**
     * Toggle surround a selection with block element
     * @param {[rangyRanges]} splitRanges
     * @param {blockSurroundOptions} blockOptions
     * @return an array of new ranges
     */
    function toggleSurroundSelection(options, topEditableParent) {
        var blockOptions = new $.Arte.ElementApplierOptions(options, topEditableParent);
        var selection = rangy.getSelection();
        var range = selection.getRangeAt(0);
        if (range) {
            toggleSurroundRange(range, blockOptions);
        }
    }

    /*Public api*/
    // Api for surrounding individual blocks
    api.toggleSurroundRange = toggleSurroundRange;
    api.toggleSurroundSelection = toggleSurroundSelection;

    // Api for surrounding block sets (for lists)
    api.toggleSurroundRangeSet = toggleSurroundRangeSet;
    api.toggleSurroundSelectionSet = toggleSurroundSelectionSet;
});

(function($) {
    $.Arte = $.Arte || {};
    $.Arte.ElementApplierOptions = function(initOptions) {
        if (initOptions._isProcessed) {
            // Options object is already processed
            return initOptions;
        }

        var constants = $.Arte.constants;
        this.tagName = "";
        this.topEditableParent = "";
        this.commandName = "";
        this.commandAttrType = initOptions.commandAttrType;
        this.textArea = null;
        switch (this.commandAttrType) {
            case constants.commandAttrType.className:
                this.classNameRegex = "";
                this.className = "";
                break;
            case constants.commandAttrType.styleName:
                this.styleName = "";
                this.styleValue = "";
                break;
        }

        for (var prop in initOptions) {
            this[prop] = initOptions[prop];
        }

        if (this.tagName) {
            this.tagName = $("<" + this.tagName + ">").prop("tagName");
        }

        this.attr = {};
        if (this.commandAttrType == constants.commandAttrType.className) {
            this.attr["class"] = this.className;
        }

        if (this.commandAttrType == constants.commandAttrType.styleName) {
            // Construct a style string, so that we can easily apply/remove this from an element
            var div = $("<div>").css(this.styleName, this.styleValue);
            this.attr.style = div[0].style.cssText;
        }

        if (!this.commandName) {
            var commandConfig = $.Arte.util.getCommandConfig(this);
            if (commandConfig) {
                this.commandName = commandConfig.commandName;
                this.commandAttrType = commandConfig.commandAttrType;
            }
        }

        // Adding a field so that we don't do this multiple times.
        this._isProcessed = true;
    };
})(jQuery);

$(document).ready(function() {
    //Make sure that rangy is initialized first.
    rangy.init();
    //Function that takes a given range, and finds all the blocks inside of it.
    //Block is something that is surrounded by a block element on either side.
    //Returns an array of ranges where each range represents all of the text nodes
    //inside a one block element.
    rangy.rangePrototype.splitByBlock = function() {
        var blockRanges = [];
        //clone current range just in case.
        var range = this.cloneRange();
        if (range.collapsed) {
            return range;
        }
        //get all non-empty text nodes from the range as well as all block elements and line breaks
        var nodes = range.getNodes([3, 1], function(node) {
            return isBlockOrLineBreak(node) || (node.nodeType === 3 && !isWhitespaceNode(node));
        });
        var tempRange;
        var currentTopNode = null;
        //loop through the collection of text nodes removing them when we find a new range
        while (nodes.length > 0) {
            //If this is a block element. Skip over it
            if (nodes[0].nodeType === 1) {
                if (!(currentTopNode && $(currentTopNode).has(nodes[0]).length)) {
                    currentTopNode = nodes[0];
                }
                nodes.splice(0, 1);
                continue;
            } else if (currentTopNode && !$(currentTopNode).has(nodes[0]).length) {
                currentTopNode = null;
            }

            //Node has siblings or it's parent is not a block level element
            if (nodes[0].parentNode.childNodes.length > 1 || !isBlockOrLineBreak(getTopParentWithSingleChild(nodes[0]))) {
                //Create a new temporary range.
                tempRange = rangy.createRangyRange();
                tempRange.setStartBefore(nodes[0]);
                for (var i = 0, l = nodes.length; i < l; i++) {
                    //If this is a block element. Skip over it
                    if (nodes[i].nodeType === 1) {
                        continue;
                    }
                    if (isBlockOrLineBreak(nodes[i].nextSibling) ||
                        (!nodes[i].nextSibling && isBlockOrLineBreak(nodes[i].parentNode)) ||
                        (nodes[i + 1] && isBlockOrLineBreak(nodes[i + 1]))) {
                        tempRange.setEndAfter(nodes[i]);
                        break;
                    }

                    // Is the next node within the block parent
                    if (currentTopNode && !$(currentTopNode).has(nodes[i + 1]).length) {
                        tempRange.setEndAfter(nodes[i]);
                        break;
                    }
                }
                //If we didn't find any block elements (i.e. begging of the range is the same as the end)
                //Then set the end to the very last element in the list
                if (tempRange.startContainer === tempRange.endContainer && tempRange.startOffset === tempRange.endOffset) {
                    i--;
                    tempRange.setEndAfter(nodes[i]);
                }
                blockRanges.push(tempRange);
                nodes.splice(0, i + 1);
            } else {
                // Doesn't have siblings
                if (isBlockOrLineBreak(getTopParentWithSingleChild(nodes[0]))) {
                    tempRange = rangy.createRangyRange();
                    tempRange.selectNodeContents(nodes[0]);
                    blockRanges.push(tempRange);
                    nodes.splice(0, 1);
                }
            }
        }
        return blockRanges;
    };

    //Helper function to find all text nodes of a given node.
    var collectTextNodes = function(element, texts) {
        for (var child = element.firstChild; child !== null; child = child.nextSibling) {
            if (child.nodeType === 3) {
                texts.push(child);
            } else if (child.nodeType === 1) {
                collectTextNodes(child, texts);
            }
        }
    };

    var getTopNodes = function(nodes) {
        var newNodeCollection = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var foundParent = false;
            for (var j = 0, len = nodes.length; j < len; j++) {
                //if current node is a child of any other node in the list, skip over it
                if ($.contains(nodes[j], nodes[i])) {
                    foundParent = true;
                    break;
                }
            }
            if (!foundParent) {
                newNodeCollection.push(nodes[i]);
            }
        }
        return newNodeCollection;
    };

    var getTopParentWithSingleChild = function(node) {
        if (node.parentNode.childNodes.length === 1) {
            return getTopParentWithSingleChild(node.parentNode);
        } else {
            return node;
        }

    };

    // "A whitespace node is either a Text node whose data is the empty string; or
    // a Text node whose data consists only of one or more tabs (0x0009), line
    // feeds (0x000A), carriage returns (0x000D), and/or spaces (0x0020), and whose
    // parent is an Element whose resolved value for "white-space" is "normal" or
    // "nowrap"; or a Text node whose data consists only of one or more tabs
    // (0x0009), carriage returns (0x000D), and/or spaces (0x0020), and whose
    // parent is an Element whose resolved value for "white-space" is "pre-line"."
    var isWhitespaceNode = function(node) {
        if (!node || node.nodeType != 3) {
            return false;
        }
        var text = node.data;
        if (text === "" || text === "\uFEFF") {
            return true;
        }
        var parent = node.parentNode;
        if (!parent || parent.nodeType != 1) {
            return false;
        }
        var computedWhiteSpace = getComputedStyleProperty(node.parentNode, "whiteSpace");

        return ((/^[\t\n\r ]+$/).test(text) && (/^(normal|nowrap)$/).test(computedWhiteSpace)) ||
            ((/^[\t\r ]+$/).test(text) && computedWhiteSpace == "pre-line");
    };

    var getComputedStyleProperty;

    if (typeof window.getComputedStyle != "undefined") {
        getComputedStyleProperty = function(el, propName) {
            return rangy.dom.getWindow(el).getComputedStyle(el, null)[propName];
        };
    } else if (typeof document.documentElement.currentStyle != "undefined") {
        getComputedStyleProperty = function(el, propName) {
            return el.currentStyle[propName];
        };
    } else {
        throw new Error("Can't create getComputedStyleProperty");
    }

    var inlineDisplayRegex = /^(none|inline(-block|-table)?)$/i;

    // "A block node is either an Element whose "display" property does not have
    // resolved value "inline" or "inline-block" or "inline-table" or "none", or a
    // Document, or a DocumentFragment."
    var isBlockOrLineBreak = function(node) {
        if (!node) {
            return false;
        }
        var nodeType = node.nodeType;
        return nodeType == 1 && (!inlineDisplayRegex.test(getComputedStyleProperty(node, "display")) ||
            node.tagName === "BR") || nodeType == 9 || nodeType == 11;
    };

    /**
     * Constructs a range from a saved selection using the start and end marker
     * @param {rangySelection} savedSelection
     * @return rangyRange object
     */

    function getRangeFromSavedSelection(savedSelection) {
        var rangeInfo = savedSelection.rangeInfos[0];
        if (rangeInfo.collapsed) { // Nothing is selected
            return null;
        }

        var startElement = $("#" + rangeInfo.startMarkerId)[0];
        var endElement = $("#" + rangeInfo.endMarkerId)[0];
        return createRangeFromElements(startElement, endElement);
    }

    /**
     * Create a rangy range using the startElement and endElement
     * @param {htmlElement} startElement
     * @param {htmlElement} startElement
     * @return rangyRange object
     */

    function createRangeFromElements(startElement, endElement, excludStartEndElements) {
        var range = rangy.createRangyRange();
        var startOp = excludStartEndElements ? "setStartAfter" : "setStartBefore";
        var endop = excludStartEndElements ? "setEndBefore" : "setEndAfter";
        range[startOp](startElement);
        range[endop](endElement);
        return range;
    }

    /**
     * Get non-whitespace text nodes
     * @param {rangyRange} Range object
     * @return Collection of matched text nodes
     */
    function getTextNodes(range) {
        if (!range.collapsed) {
            return $(range.getNodes([3])).filter(function() {
                return !isWhitespaceNode(this);
            });
        }
    }

    rangy.util.getRangeFromSavedSelection = getRangeFromSavedSelection;
    rangy.util.createRangeFromElements = createRangeFromElements;
    rangy.util.getTextNodes = getTextNodes;

    rangy.util.isWhitespaceNode = isWhitespaceNode;
    rangy.util.isBlockOrLineBreak = isBlockOrLineBreak;
    rangy.util.getTopNodes = getTopNodes;
    rangy.util.getTopParentWithSingleChild = getTopParentWithSingleChild;

});

rangy.createModule("InlineElementApplier", ["WrappedSelection", "WrappedRange"], function(api) {
    var dom = $.Arte.dom;
    var configuration = $.Arte.configuration;
    var constants = $.Arte.constants;
    var util = $.Arte.util;
    //Function to filter out selection boundary spans
    function excludeSelectionBoundarySpanFilter() {
        return !$(this).hasClass("rangySelectionBoundary");
    }

    /**
     * Checks if all of the text nodes in the range have the style applied.
     */
    function isApplied(range, options) {
        var textNodes = rangy.util.getTextNodes(range);
        return dom.closestWithCommandValue(textNodes, options).length === textNodes.length;
    }

    /**
     * Apply the styles in the  option to the text node
     */
    function applyToTextNode(textNode, options) {
        var parent = textNode.parent();

        var children = parent.contents().filter(excludeSelectionBoundarySpanFilter);

        if (children.length > 1 ||
                !configuration.styleableTags[parent.prop("tagName")] ||
                options.commandAttrType === constants.commandAttrType.tagName) {
            dom.wrapWithOptions(textNode, options);
        } else {
            if (options.commandAttrType === constants.commandAttrType.styleName) {
                parent.css(options.styleName, options.styleValue);
            } else if (options.commandAttrType === constants.commandAttrType.className) {
                var config = util.getCommandConfig({
                    className: options.className
                });
                if (config && config.classNameRegex) {
                    dom.removeClassWithPattern(parent, config.classNameRegex);
                }
                parent.addClass(options.className);
            }
        }
    }

    /*
     * Apply the styles in the options to each of the text nodes in the range
     */
    function applyToRange(range, options) {
        rangy.util.getTextNodes(range).each(function() {
            applyToTextNode($(this), options);
        });
    }

    /*
     * Undo the styles from the text node
     */
    function undoToTextNode(textNode, options) {
        var parentWithStyle = dom.closestWithCommand(textNode, $.extend(options, {
            checkValue: true
        }));

        // Get all of the text nodes inside the element
        var range = rangy.createRangyRange();
        range.selectNodeContents(parentWithStyle[0]);

        var otherTextNodes = util.filterCollection(rangy.util.getTextNodes(range, true), function(index, node) {
            return node !== textNode.get(0);
        });

        $.each(otherTextNodes, function(index, node) {
            dom.wrapWithOptions($(node), options);
        });

        if (options.styleName && dom.hasCommandValue(parentWithStyle, {
                styleName: options.styleName,
                styleValue: options.styleValue
            })) {
            var pattern = new RegExp(options.styleName + "\\s?:\\s?" + options.styleValue + "\\s?;?", "i");
            parentWithStyle[0].style.cssText = parentWithStyle[0].style.cssText.replace(pattern, "");
        } else if (options.className && dom.hasCommandValue(parentWithStyle, {
                className: options.className
            })) {
            parentWithStyle.removeClass(options.className);
        } else {
            dom.unwrapWithOptions(parentWithStyle, options);
        }
    }

    /*
     * Remove the styles from the text nodes in this range
     */
    function undoToRange(range, options) {
        rangy.util.getTextNodes(range).each(function() {
            undoToTextNode($(this), options);
        });
    }

    /*
     * Toggle range apply/undo styles to all text nodes in the range
     */
    function toggleRange(range, options) {
        if (range.collapsed) {
            return range;
        }

        var initOptions = new $.Arte.ElementApplierOptions(options);
        var surroundState = isApplied(range, initOptions);

        if (surroundState) {
            undoToRange(range, initOptions);
        } else {
            applyToRange(range, initOptions);
        }
    }

    /*
     * Toggle selection apply/undo styles to all text nodes in the selection
     */
    function toggleSelection(options) {
        var inlineOptions = new $.Arte.ElementApplierOptions(options);

        var selection = rangy.getSelection();
        if (!selection.isCollapsed) {
            // rangy.splitBoundaris, causes the loss of user selection.  The following is a work around.
            var savedSelection = rangy.saveSelection();
            var rangeInfo = savedSelection.rangeInfos[0];

            var startMarker = $("#" + rangeInfo.startMarkerId);
            var endMarker = $("#" + rangeInfo.endMarkerId);

            var newRange = rangy.util.createRangeFromElements(startMarker.get(0), endMarker.get(0), true);
            selection.setSingleRange(newRange);

            startMarker.remove();
            endMarker.remove();
        }

        var range = rangy.getSelection().getRangeAt(0);
        if (range) {
            toggleRange(range, inlineOptions);
        }
    }

    /*Public api*/
    api.toggleStyleOnRange = toggleRange;
    api.toggleStyleOnSelection = toggleSelection;
});

/**
 * @fileoverview Encapsulates applying a rich text command
 */
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.RichTextCommandApplier = function(options) {
        //
        var dom = $.Arte.dom;
        var util = $.Arte.util;
        var constants = $.Arte.constants;
        var configuration = $.Arte.configuration;

        var applyToTextNodes = function(commandInfo, type) {
            var selection = rangy.getSelection();
            var textArea = commandInfo.textArea;

            // If the selection is not in the content editable element and ops of collapsed
            // selection aren't allowed, return
            var selectionIsInContentEditable = util.isSelectionInElement(textArea.$el);

            var range = null;
            if (selection.isCollapsed) {
                var selectedRange = selection.getAllRanges()[0];
                var selectedContainer;
                if (selectedRange && selectionIsInContentEditable) {
                    // The cursor is inside the contentEditable; select the node around the cursor
                    selectedContainer = selectedRange.startContainer;
                    selectedContainer = selectedContainer.nodeType === constants.nodeType.TEXT ?
                        selectedContainer.parentNode :
                        selectedContainer;

                } else {
                    selectedContainer = textArea.$el.get(0);
                }
                // if selection is collapsed, construct a range from the first parent
                range = rangy.util.createRangeFromElements(selectedContainer, selectedContainer);
            }

            // Explicitly define the contentEditable parent
            var contentEditableParent = textArea.$el;

            var contentEditableContainer = contentEditableParent.get(0);
            var commandOptions = {
                topEditableParent: contentEditableContainer
            };

            $.extend(commandOptions, commandInfo);
            var commandType = constants.commandType;
            var commandToExecute = null;
            switch (type) {
                case commandType.inline:
                    commandToExecute = function() {
                        return range ?
                            rangy.toggleStyleOnRange(range, commandOptions) :
                            rangy.toggleStyleOnSelection(commandOptions);
                    };
                    break;
                case commandType.block:
                    commandToExecute = function() {
                        return range ?
                            rangy.toggleSurroundRange(range, commandOptions) :
                            rangy.toggleSurroundSelection(commandOptions, contentEditableContainer);
                    };
                    break;
                case commandType.complex:
                    commandToExecute = function() {
                        return range ?
                            rangy.toggleSurroundRangeSet(range, commandOptions) :
                            rangy.toggleSurroundSelectionSet(commandOptions, contentEditableContainer);
                    };
                    break;
            }

            var sel = rangy.saveSelection();
            commandToExecute();
            dom.cleanup($(commandOptions.topEditableParent));
            rangy.restoreSelection(sel);
        };

        var applyCommand = function(commandInfo, type) {
            var textField = commandInfo.textArea;
            var editorTypes = constants.editorTypes;
            var applyToElement = textField.editorType === editorTypes.plainText || !textField.$el.html();

            // If the selection is not in the content editable element and focus is required return
            var selectionIsInContentEditable = util.isSelectionInElement(textField.$el);
            if (!selectionIsInContentEditable && configuration.requireFocus) {
                return;
            }

            // Apply to element if focus is not required
            if (!selectionIsInContentEditable && !configuration.requireFocus &&
                commandInfo.commandAttrType != "tagName") {
                applyToElement = true;
            }

            if (applyToElement) {
                textField.toggleStyleOnElement(commandInfo);
            } else {
                applyToTextNodes(commandInfo, type);
            }
        };

        /*
         * Execute a rich text command
         */
        this.execute = function() {
            if (!options.commandName) {
                throw "commandName not specified.";
            }

            var commandConfig = configuration.commands[options.commandName];
            if (!commandConfig) {
                throw "unrecognized command: " + options.commandName;
            }

            applyCommand(options, commandConfig.commandType);
        };
    };

    /*
     * Create an execute a rich text command
     */
    $.Arte.RichTextCommandApplier.createAndExecute = function(options) {
        var command = new $.Arte.RichTextCommandApplier(options);
        command.execute();
        return command;
    };
})(jQuery);

/**
 * @fileoverview: A plugin to add command to insert and/or replace content
 */
(function(pluginManager) {
    var InsertCommand = function() {
        var publicApi = {
            insert: function(options) {
                $.extend(options, {
                    execute: true
                });
                this.triggerEvent($.Arte.constants.eventNames.onbeforeinsert, options);

                if (!options.execute) {
                    return;
                }

                // Ensure that the selection is valid
                var selectionIsInContentEditable = $.Arte.util.isSelectionInElement(this.$el);
                if (!selectionIsInContentEditable && $.Arte.configuration.requireFocus) {
                    return;
                }

                //var element = document.createTextNode(options.commandValue);
                var element = $("<span>").html(options.commandValue).get(0);
                var selection;
                if (selectionIsInContentEditable) {
                    // If we have a selection, insert the content at the cursor position
                    selection = rangy.getSelection();
                    var range = selection.getAllRanges()[0];
                    if (!selection.isCollapsed) {
                        range.deleteContents();
                    }
                    range.collapse();
                    range.insertNode(element);
                } else {
                    this.$el.append(element);
                }

                // Select the newly inserted content.
                selection = rangy.getSelection();
                selection.setSingleRange(rangy.util.createRangeFromElements(element, element));

                this.triggerEvent($.Arte.constants.eventNames.onafterinsert, options);
            }
        };
        $.extend($.Arte.TextArea.prototype, publicApi);

        $.extend($.Arte.constants.eventNames, {
            "onbeforeinsert": "onbeforeinsert",
            "onafterinsert": "onafterinsert"
        });

        return {
            init: function() { /* no op */ }
        };
    };
    pluginManager.register("insertCommand", InsertCommand);
})($.Arte.pluginManager);

/**
 * @fileoverview: StateDetector detects the command state of user selection
 */
(function(pluginManager) {
    var constants = $.Arte.constants;

    var getValue = function(nodes, commandOptions) {
        var styleValue = null;
        var hasSameValue = true;

        var nodesWithCommand = $.Arte.dom.closestWithCommand(nodes, commandOptions);
        if (nodes.length !== nodesWithCommand.length) {
            // Not all nodes have this command applied
            return null;
        }

        // All nodes should have same style applied
        var commandValue = $.Arte.dom.getCommandValue(nodesWithCommand.first(), commandOptions);

        nodesWithCommand.each(function() {
            hasSameValue = $.Arte.dom.hasCommandValue($(this), commandValue);
            return hasSameValue;
        });

        if (hasSameValue) {
            for (var value in commandValue) {
                styleValue = commandValue[value];
            }
        }

        return styleValue;
    };

    var isApplied = function(nodes, commandOptions) {
        // Special case for OL/UL: Check if the text nodes are surrounded by LIs and the LIs belong to same OL/LI parent
        var tag = commandOptions.tagName;
        if (tag && (tag === constants.tagName.OL || tag === constants.tagName.UL)) {
            return $.Arte.dom.listSurrounded(nodes, {
                singleList: true,
                tagName: tag
            });
        }
        var nodesWithStyleValue = $.Arte.dom.closestWithCommandValue(nodes, commandOptions);
        return nodesWithStyleValue.length === nodes.length;
    };

    var getState = function(selectedNodes, commandName, options) {
        if (!selectedNodes || !selectedNodes.length) {
            return null;
        }
        var commandConfig = $.Arte.configuration.commands[commandName];
        var commandOptions = $.extend({
            commandName: commandName,
            tagName: commandConfig.tagName,
            styleName: commandConfig.styleName,
            styleValue: commandConfig.defaultValue ? commandConfig.defaultValue.styleName : null,
            className: commandConfig.defaultValue ? commandConfig.defaultValue.className : null
        }, options);

        return commandConfig.acceptsParams ? getValue(selectedNodes, commandOptions) : isApplied(selectedNodes, commandOptions);
    };

    var getSelectedNodesState = function(selectedNodes, commandName) {
        if (commandName) {
            return getState(selectedNodes, commandName);
        } else {
            var result = {};
            $.each($.Arte.configuration.commands, function(name, config) {
                if ($.isPlainObject(config) && config.commandType && config.commandType != constants.commandType.other) {
                    result[name] = getState(selectedNodes, name);
                }
            });
            return result;
        }
    };

    // Extend the prototype of the TextArea to expose the public API
    $.extend($.Arte.TextArea.prototype, {
        getState: function(commandName) {
            var selectedNodes = $.Arte.util.getSelectedTextNodes.apply(this, [true]);
            return getSelectedNodesState(selectedNodes, commandName);
        },

        /**
         * Get an array of all the states found within the current selection
         * (ie: if the current selection has both a bold and a non-bold component, get two results representing that)
         * @param {commandName} string. Optional. If provided, only result the state of the given command (ie: fontFamily, bold, etc)
         */
        getAllStates: function(commandName) {
            var selectedNodes = $.Arte.util.getSelectedTextNodes.apply(this, [true]);
            var results = [];

            $.each(selectedNodes, function() {
                var selectedNode = $(this);
                results.push(getSelectedNodesState(selectedNode, commandName));
            });

            return results;
        }
    });

    var stateDetector = function() {
        return {
            /**
             * A callback method for when a Arte is initialized
             * @param {TextArea} textArea.  An instance of a Arte text area
             */
            init: function() {}
        };
    };

    // Register this plugin with the plugin manager
    pluginManager.register("stateDetector", stateDetector);
})($.Arte.pluginManager);

/**
 * @fileoverview: UndoManager plugin is a naive implementation to manage undo/redo information from a text area
 * TODO: Evaluate https://code.google.com/p/google-diff-match-patch/ for computing diffs.
 */
(function(pluginManager) {
    /**
     * Apply undo/redo commands
     * param {bool} isUndo Whether to perform undo command
     */
    var applyUndoCommand = function(isUndo) {
        var hasInfo = isUndo ? this.hasUndo() : this.hasRedo();
        if (!hasInfo) {
            return;
        }

        var eventNames = $.Arte.constants.eventNames;
        var data = {
            execute: true
        };
        this.triggerEvent(isUndo ? eventNames.onbeforeundo : eventNames.onbeforeredo, data);
        if (data.execute) {
            // perform undo
            this.undoInfo.index += isUndo ? -1 : 1;
            this.outerValue(this.undoInfo.stack[this.undoInfo.index]);
        }
        this.triggerEvent(isUndo ? eventNames.onundo : eventNames.onredo, {});
    };

    /**
     * Inserts undo data when the onvaluechange event is raised.  The data can be changed by typing into the field or
     * through a rich text command.  Listening to onvaluechange command simplifies the undo/redo functionality.
     * @param {jQuery event} e
     * @param {Arte event data} data
     */
    var insertUndoData = function(e, data) {
        var textArea = data.textArea;
        var undoInfo = textArea.undoInfo;
        var currentValue = $.trim(textArea.outerValue());
        // If the top of the stack is same as the new value, don"t add that to the undo stack
        // Note that the changes to the DOM are raised as delay change event removing and then
        // adding the value change event handler doesn"t help.
        if (currentValue != undoInfo.stack[undoInfo.index]) {
            var index = ++textArea.undoInfo.index;
            var undoStack = textArea.undoInfo.stack;

            // Remove all the entries after the current position (for example: change after undo)
            undoStack.splice(index, undoStack.length);
            undoStack.push(currentValue);
        }
    };
    /**
     * This is Public API that is exposed on the Arte Text Area
     */
    var publicApi = {
        /**
         * Whether undo manager can undo
         */
        hasUndo: function() {
            return this.undoInfo.stack.length > 0 && this.undoInfo.index > 0;
        },
        /**
         * Whether undo manager can redo
         */
        hasRedo: function() {
            return this.undoInfo.stack.length > 0 && (this.undoInfo.index < this.undoInfo.stack.length - 1);
        },
        /**
         * Perform undo
         */
        undo: function() {
            applyUndoCommand.call(this, true);
        },
        /**
         * Perform redo
         */
        redo: function() {
            applyUndoCommand.call(this, false);
        }
    };

    // Extend the prototype of the TextArea to expose the public API
    $.extend($.Arte.TextArea.prototype, publicApi);

    // Set of events raised by this plugin
    $.extend($.Arte.constants.eventNames, {
        "onbeforeundo": "onbeforeundo",
        "onundo": "onundo",
        "onbeforeredo": "onbeforeredo",
        "onredo": "onredo"
    });

    var undoManager = function() {
        return {
            /**
             * A callback method for when a Arte is initialized
             * @param {TextArea} textArea.  An instance of a Arte text area
             */
            init: function(textArea) {
                textArea.undoInfo = textArea.undoInfo || {
                    stack: [],
                    index: -1
                };

                textArea.$element.on({
                    onvaluechange: insertUndoData
                });
            }
        };
    };

    // Register this plugin with the plugin manager
    pluginManager.register("undoManager", undoManager);
})($.Arte.pluginManager);

/**
 * @fileoverview: A plugin to handle the keyboard events
 */
(function(pluginManager) {
    // Plugin
    var KeyboardEventHandler = function() {
        var keyCodeLookup = {
            8: "BackSpace",
            13: "Enter",
            32: "Space",
            37: "ArrowLeft",
            38: "ArrowUp",
            39: "ArrowRight",
            40: "ArrowDown",
            46: "Delete",
            65: "A",
            66: "B",
            67: "C",
            73: "I",
            75: "K",
            85: "U",
            86: "V",
            88: "X"
        };

        /**
         * Fires before text has been altered
         * @param {Event} e
         */
        var onKeyPressHandler = function() {};

        /**
         * Construct a key string based on the keyboard commands
         * @param {keyboard event} keyboardEvent
         */
        var getKey = function(keyboardEvent) {
            var key = keyboardEvent.ctrlKey ? "CTRL+" : "";
            key += keyboardEvent.altKey ? "AlT+" : "";

            var keyCode = keyCodeLookup[keyboardEvent.keyCode];
            key += keyCode || "";
            return key;
        };

        /**
         * Fires before text has been altered
         * @param {Event} e
         */
        var onKeyDownHandler = function(e, data) {
            var textArea = data.textArea;
            var event = data.originalEvent;
            var key = getKey(event);

            switch (key) {
                case "CTRL+B":
                    textArea.bold();
                    event.preventDefault(); // Browsers shouldn't handle this command
                    break;
                case "CTRL+I":
                    textArea.italic();
                    event.preventDefault();
                    break;
                case "CTRL+U":
                    textArea.underline();
                    event.preventDefault();
                    break;
            }
        };

        /**
         * Fires after a key event completes, and text has been altered.
         * @param {Event} e
         */
        var onKeyUpHandler = function(e, data) {
            var textArea = data.textArea;
            var event = data.originalEvent;
            var key = getKey(event);

            switch (key) {
                case "CTRL:A":
                case "CTRL+V":
                case "CTRL+ArrowDown":
                case "CTRL+ArrowLeft":
                case "CTRL+ArrowRight":
                case "CTRL+ArrowUp":
                case "ArrowDown":
                case "ArrowLeft":
                case "ArrowRight":
                case "ArrowUp":
                    textArea.triggerEvent($.Arte.constants.eventNames.onselectionchange);
            }
        };

        return {
            init: function(textArea) {
                textArea.$element.on({
                    "onkeydown": onKeyDownHandler,
                    "onkeypress": onKeyPressHandler,
                    "onkeyup": onKeyUpHandler
                });
            }
        };
    };

    // Register this plugin with the plugin manager
    pluginManager.register("keyboardEventHandler", KeyboardEventHandler);
})($.Arte.pluginManager);

(function(pluginManager) {
    $.Arte.configuration.pasteHandler = {
        attributes: {
            "id": 1,
            "style": 1,
            "class": 1
        },
        style: {
            "font": 1,
            "font-style": 1,
            "font-weight": 1,
            "font-family": 1, // TODO: font-family, color, font-size needs to compare against some sanctioned list
            "color": 1,
            "font-size": 1,
            "text-align": 1
        },
        tag: {
            "P": 1,
            "DIV": 1,
            "UL": 1,
            "OL": 1,
            "LI": 1,
            "SPAN": 1
                // What to do with tags not in this list
        },
        nodeType: {
            "1": 1, // Text
            "3": 1 // Element
        },
        invalidTagHandlers: {
            "B": {
                applierTagName: "span",
                styleName: "font-weight",
                styleValue: "bold"
            },
            "I": {
                applierTagName: "span",
                styleName: "font-style",
                styleValue: "italic"
            },
            "U": {
                applierTagName: "span",
                styleName: "text-decoration",
                styleValue: "underline"
            },
            "FONT": {
                applierTagName: "span"
            }
        }
    };

    var configuration = $.Arte.configuration.pasteHandler;
    var classNameSpace = $.Arte.configuration.classNameSpace;

    var getReplacementNode = function(jNode) {
        var nodeType = jNode.get(0).nodeType;
        if (!configuration.nodeType[nodeType]) { // Remove unsupported nodes
            jNode.remove();
            return null;
        }

        // Additional node type based processing
        if (nodeType == $.Arte.constants.nodeType.TEXT) {
            var nodeValue = jNode.get(0).nodeValue;
            // Remove the html comment text
            nodeValue = nodeValue.replace(/<!--[\S\s]*?-->/ig, "");

            // Remove empty nodes
            if (nodeValue === "" || !nodeValue.match(/\S+/ig) || nodeValue.match(/^[\xA0]+$/ig)) {
                jNode.remove();
                return null;
            }

            // Remove multiple spaces and new line characters
            jNode.get(0).nodeValue = nodeValue.replace(/\n/ig, "").replace(/[\xA0|\s+]{2,}/ig, " ");
            return null;
        }
        var content = jNode.html();
        if (!content) {
            jNode.remove();
            return null;
        }

        var tagName = jNode.prop("tagName");
        if (configuration.tag[tagName]) {
            // This is a supported tag, remove unsupported attributes
            var attr = jNode.prop("attributes");
            for (var i = 0; i < attr.length; i++) {
                if (!configuration.attributes[attr[i].name]) {
                    try {
                        // IE7 returns events/properties as attributes, removing those throw exception
                        jNode.removeAttr(attr[i].name);
                    } catch (e) {}
                }
            }

            // Remove unrecognized class
            var classes = $.Arte.dom.getClasses(jNode);
            $.each(classes, function(index, className) {
                if (className.indexOf(classNameSpace) !== 0) {
                    jNode.removeClass(className);
                }
            });

            var cssText = "";
            $.each($.Arte.dom.getStyles(jNode), function(style, value) {
                var keepStyle = configuration.style[style];
                if (keepStyle) {
                    switch (style) {
                        case "font-size":
                            keepStyle = value.match(/\d+\s?px/);
                            break;
                        case "color":
                            keepStyle = value.match(/#[a-fA-F0-9]{6}/) || value.match(/rgb\(\d+,\s*\d+\,\s*\d+\)/);
                            break;
                        default:
                            break;
                    }
                }

                if (keepStyle) {
                    cssText += style + ": " + value + "; ";
                }
            });
            jNode.get(0).style.cssText = cssText;

            return null;
        }

        // Unsupported tags, construct a replacement node
        var invalidTagHandlerConfig = configuration.invalidTagHandlers[jNode.prop("tagName")] || {
            tagName: "DIV" /* Just wrap the content in a div*/
        };
        var newNode = $.Arte.dom.createContainer(invalidTagHandlerConfig).html(jNode.html());
        return newNode;
    };

    var handleUnsanctionedTags = function(nodes) {
        nodes.each(function() {
            var $this = $(this);
            handleUnsanctionedTags($this.contents());

            var replacementNode = getReplacementNode($this);
            if (replacementNode) {
                $this.replaceWith(replacementNode);
            }
        });
    };

    // Set of events raised by this plugin
    $.extend($.Arte.constants.eventNames, {
        "onbeforehandlepaste": "onbeforehandlepaste",
        "onhandlepaste": "onhandlepaste"
    });

    var pasteHandler = function() {
        return {
            init: function(textArea) {
                textArea.$element.on({
                    "onpaste": function(e, data) {
                        var options = {
                            execute: true
                        };
                        textArea.triggerEvent($.Arte.constants.eventNames.onbeforehandlepaste, options);
                        if (!options.execute) {
                            return;
                        }
                        handleUnsanctionedTags(data.textArea.$el.children());
                        textArea.triggerEvent($.Arte.constants.eventNames.onbeforehandlepaste, options);
                    }
                });
            }
        };
    };

    pluginManager.register("pasteHandler", pasteHandler);
})($.Arte.pluginManager);
