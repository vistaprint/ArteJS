/**
 * @fileoverview: Various utility functions
 */
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.util = {
        /**
         * Ensure that if there is a user selection, it is inside of the selected element.
         * @param {jQuery object} jElement - the element to check the selection against
         * @return {boolean} whether or not there is a selection in the given element
         */
        isSelectionInElement: function(jElement) {
            var selection = rangy.getSelection();
            var range = selection.getAllRanges()[0];
            return range &&
                (range.startContainer === jElement.get(0) || jElement.has(range.startContainer).length !== 0);
        },
        /**
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

        /**
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
        /**
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
        /**
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
         * @param {boolean} allowCollapsedSelection - whether or not to return the parent of the node with the cursor if the selection is collapsed
         * @return {Array} array of selected text nodes
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

                // In case we don't have a valid selection,
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
        /**
         * Identify the ArteJS command configuration from className, styleName or tagName. 
         * @param {Object} options - an object containing either a commandName, className, styleName, or tagName attribute
         * @return {Object} returns the command configuration that matched to the parameter passed in or null if no commands are found
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

            // Infer the command from the properties in the options.
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
