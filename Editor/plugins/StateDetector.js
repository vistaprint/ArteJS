/**
* @fileoverview: StateDetector detects the command state of user selection
*/
(function(pluginManager)
{
    var constants = $.Arte.constants;
    var util = $.Arte.util;

    var getValue = function(nodes, commandOptions)
    {
        var styleValue = null;
        var hasSameValue = true;

        var nodesWithCommand = $.Arte.dom.closestWithCommand(nodes, commandOptions);
        if (nodes.length !== nodesWithCommand.length)
        {
            // Not all nodes have this command applied
            return null;
        }

        // All nodes should have same style applied
        var commandValue = $.Arte.dom.getCommandValue(nodesWithCommand.first(), commandOptions);

        nodesWithCommand.each(function()
        {
            hasSameValue = $.Arte.dom.hasCommandValue($(this), commandValue);
            return hasSameValue;
        });

        if (hasSameValue)
        {
            for (var value in commandValue)
            {
                styleValue = commandValue[value];
            }
        }

        return styleValue;
    };

    var isApplied = function(nodes, commandOptions)
    {
        // Special case for OL/UL: Check if the text nodes are surrounded by LIs and the LIs belong to same OL/LI parent
        var tag = commandOptions.tagName;
        if (tag && (tag === constants.tagName.OL || tag === constants.tagName.UL))
        {
            var surroundedByCorrectListType = $.Arte.dom.listSurrounded(nodes, { singleList: true, tagName: tag });
            if(!surroundedByCorrectListType)
            {
                //If not a text node maybe this is a parent node - check to see if the any of the direct children are OL/LI
                var directChildrenHaveCorrectListType = nodes.children().length && util.any(nodes.children(), function(index, node)
                {
                    return  $.Arte.dom.hasCommandApplied($(node), commandOptions.commandName);
                });
            }
            return surroundedByCorrectListType || directChildrenHaveCorrectListType;
        }
        var nodesWithStyleValue = $.Arte.dom.closestWithCommandValue(nodes, commandOptions);
        return nodesWithStyleValue.length === nodes.length;
    };

    var getState = function(selectedNodes, commandName, options)
    {
        if (!selectedNodes.length)
        {
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

    // Extend the prototype of the TextArea to expose the public API
    $.extend($.Arte.TextArea.prototype, {
        getState: function(commandName)
        {
            var selectedNodes = $.Arte.util.getSelectedTextNodes.apply(this, [true]);
            if (commandName)
            {
                return getState(selectedNodes, commandName);
            }
            else
            {
                var result = {};
                $.each($.Arte.configuration.commands, function(name, config)
                {
                    if ($.isPlainObject(config) && config.commandType && config.commandType != constants.commandType.other)
                    {
                        result[name] = getState(selectedNodes, name);
                    }
                });
                return result;
            }
        }
    });

    var stateDetector = function()
    {
        return {
            /**
            * A callback method for when a Arte is initialized
            * @param {TextArea} textArea.  An instance of a Arte text area
            */
            init: function() { }
        };
    };

    // Register this plugin with the plugin manager
    pluginManager.register("stateDetector", stateDetector);
})($.Arte.pluginManager);