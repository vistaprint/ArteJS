/*global Arte:false*/
/**
* @fileoverview: A plugin to add command to insert and/or replace content
*/
(function(pluginManager)
{
    var InsertCommand = function()
    {
        var publicApi = {
            insert: function(options)
            {
                $.extend(options, { execute: true });
                this.triggerEvent($.Arte.constants.eventNames.onbeforeinsert, options);

                if (!options.execute)
                {
                    return;
                }

                // Ensure that the selection is valid
                var selectionIsInContentEditable = $.Arte.util.isSelectionInElement(this.$el);
                if (!selectionIsInContentEditable && !$.Arte.configuration.allowOpsOnCollapsedSelection)
                {
                    return;
                }

                //var element = document.createTextNode(options.commandValue);
                var element = $("<span>").html(options.commandValue).get(0);
                var selection;
                if (selectionIsInContentEditable)
                {
                    // If we have a selection, insert the content at the cursor position
                    selection = rangy.getSelection();
                    var range = selection.getAllRanges()[0];
                    if (!selection.isCollapsed)
                    {
                        range.deleteContents();
                    }
                    range.collapse();
                    range.insertNode(element);
                }
                else
                {
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