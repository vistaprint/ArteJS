/*global Arte:false*/
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
