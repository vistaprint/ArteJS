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
