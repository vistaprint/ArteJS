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
