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
     * @param {String} commandName - name of the command get attrType for
     * @param {Object} options
     * @param {Object} [options.commandAttrType] - pass a commandAttrType in the options if you want to use it
     * @param {Object} [options.styleName] - will use styleName as the attrType if you pass one in
     * @param {Object} [options.className] - will use className as the attrType if you pass one in
     * @param {Object} [options.tagName] - will use tagName as the attrType if you pass one in
     * @return {String} returns the attrType in this order 
                1. If it was defined in the config for the command use that
                2. If no options object then return commandAttrType object from configuration
                3. If options defines a commandAttrType use that
                4. If a styleName/className/tagName is passed in options use the styleName/className/tagName properties from $.Arte.constants as the attrType 
     */
    var commandAttrType = function(commandName, options) {
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

    /**
     * Executes a rich text command
     * @param {String} commandName - name of the command to call
     * @param {Object} options
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
    
    /**
     * Get the correct command value based on the given parameters
     * @param {String} commandName - name of the command get the value for
     * @param {String} attrType - attrType you are using the command with
     * @param {Object|String} options - either an options object or it can just be a string containing the commandValue
     * @param {Object} [options.styleValue] - if attrType == styleName and you pass this in then styleValue will be the the commandValue
     * @param {Object} [options.className] - if attrType == className and you pass this in then className will be the the commandValue
     * @param {Object} [options.commandValue] - if you pass in a commandValue that will be returned
     * @return {String} try to return commandValue using options that were passed in, if none are found return the default value for the command specified in the configuration
     */
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
    
    /**
     * Get the tagName for the given command
     * @param {String} commandName - name of the command get the tagName for
     * @param {String} attrType - attrType you are using the command with - used to find the right tag (for example bold uses the B tag if we want to apply tags or a SPAN if applying styles/classes)
     * @param {Object} options
     * @param {String} options.tagName - if you already know the tagName and put it in the options it will be returned back
     * @return {String} return tagName for the given command or if there is none just return default inline/block tag based on command type
     */
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
    
    /**
     * Creates command options to use for the command based on the configuration
     * @param {String} commandName - name of the command generate the options for
     * @param {Object} options - a object containing various options
     * @return {Object} return tagName for the given command or if there is none just return default inline/block tag based on command type
     */
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
        /**
         * Toggles styles
         * @param {Object} [options]
         * @param {jQuery} [options.element] - pass in your own element or use the rich text area by default
         * @param {Object} [options.styleName] - name of style you would like to toggle on the element (e.g. font-weight)
         * @param {Object} [options.styleValue] - value for the styleName defined above that you would like to toggle on the element (e.g. bold)
         * @param {Object} [options.className] - name of css class you would like to toggle on the element (e.g. arte-font-weight)
         */
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
