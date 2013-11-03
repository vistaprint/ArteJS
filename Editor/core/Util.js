/**
* @fileoverview: Various utility functions
*/
(function($)
{
    $.Arte = $.Arte || { };
    $.Arte.util = {
    /* 
        * Ensure that if there is a user selection, it is inside of the selected element.   
        */
        isSelectionInElement : function(jElement)
        {
            var selection = rangy.getSelection();
            var range = selection.getAllRanges()[0];
            return range &&
                (range.startContainer === jElement.get(0) || jElement.has(range.startContainer).length !== 0);
        },
        /* 
        * Move cursor to the end of the input element
        * @param {htmlElement} element
        */
        moveCursorToEndOfElement : function(element)
        {
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
        all : function(collection, callback)
        {
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
        any : function(collection, callback)
        {
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
        filterCollection : function(collection, callback)
        {
            var result = [];
            $.each(collection, function(key, value) {
                if (callback(key, value))
                {
                    result.push(collection.length ? value: key);
                }
            });
            return result;
        },
        /**
        * Returns selected text nodes
        */
        getSelectedTextNodes : function(allowCollapsedSelection)
        {
            var selectedNodes = $();
            var range;
            // Is there a user selection
            var userSelection = rangy.getSelection();
            var isSelectionInElement = $.Arte.util.isSelectionInElement(this.$el);

            // User selection is collapsed or the selection is not valid (i.e. something outside of the text field is selected)
            if (userSelection.isCollapsed || !isSelectionInElement)
            {
                if (allowCollapsedSelection && isSelectionInElement)
                {
                    // Get the parent of the node with the cursor 
                    range = userSelection.getRangeAt(0);
                    selectedNodes.push(range.startContainer);
                    return selectedNodes;
                }

                // In case we don't have a valid selection, 
                selectedNodes.push(this.$el.get(0));
            }
            else if (isSelectionInElement)
            {
                // We have a valid selection
                range = userSelection.getAllRanges()[0];
                selectedNodes = rangy.util.getTextNodes(range);
            }
            return selectedNodes;
        }
    };
})(jQuery);