/*global Arte:false*/
/**
* @fileoverview: A plugin to handle the keyboard events
*/
(function(pluginManager)
{
    // Plugin
    var KeyboardEventHandler = function()
    {
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
        var onKeyPressHandler = function()
        {
        };

        /**
        * Construct a key string based on the keyboard commands
        * @param {keyboard event} keyboardEvent
        */
        var getKey = function(keyboardEvent)
        {
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
        var onKeyDownHandler = function(e, data)
        {
            var textArea = data.textArea;
            var event = data.originalEvent;
            var key = getKey(event);

            switch (key)
            {
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
                    setTimeout(function()
                    {
                        textArea.triggerEvent($.Arte.constants.eventNames.onselectionchange);
                    }, 10);
                    break;
            }
        };

        /**
        * Fires after a key event completes, and text has been altered.
        * @param {Event} e
        */
        var onKeyUpHandler = function(e, data)
        {
            var textArea = data.textArea;
            var event = data.originalEvent;
            var key = getKey(event);
            switch (key)
            {
                case "Enter":
                    var range = rangy.getSelection().getRangeAt(0);
                    var element = range.commonAncestorContainer.nodeType === $.Arte.constants.nodeType.TEXT ?
                        $(range.commonAncestorContainer.parentNode) : $(range.commonAncestorContainer);
                    var result = $.Arte.dom.convertDivsToP(element).get(0);
                    
                    var children = result.childNodes;
                    var selection = rangy.getSelection();
                    selection.setSingleRange(rangy.util.createRangeFromElements(children[0], children[children.length - 1]));
                    selection.collapseToStart();
                    break;
            }
        };

        return {
            init: function(textArea)
            {
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