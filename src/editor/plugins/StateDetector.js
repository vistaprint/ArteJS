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
        /**
         * Same as getAllStates however will only return the states that are applied to every node in the selection
         * @param {String} [commandName] If provided, only result the state of the given command (ie: fontFamily, bold, etc)
         * @return {Object} returns object containing each commandName and the value only if it is applied
         *      to every single node in the selection (if there are multiple nodes in the selection
         *      and they have different values for the given command then the value will be false/null)
         */
        getState: function(commandName) {
            var selectedNodes = $.Arte.util.getSelectedTextNodes.apply(this, [true]);
            return getSelectedNodesState(selectedNodes, commandName);
        },

        /**
         * Get an array of all the states found within the current selection
         * (ie: if the current selection has both a bold and a non-bold component, get two results representing that)
         * @param {String} [commandName] If provided, only return the state of the given command (ie: fontFamily, bold, etc)
         * @return {Array<Object>} returns array containing an object for each selected node
         *      that lists out the commandName and it's value for that node
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
