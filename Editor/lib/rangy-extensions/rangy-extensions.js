$(document).ready(function()
{
    //Make sure that rangy is initialized first.
    rangy.init();
    //Function that takes a given range, and finds all the blocks inside of it.
    //Block is something that is surrounded by a block element on either side.
    //Returns an array of ranges where each range represents all of the text nodes
    //inside a one block element.
    rangy.rangePrototype.splitByBlock = function()
    {
        var blockRanges = [];
        //clone current range just in case.
        var range = this.cloneRange();
        if (range.collapsed)
        {
            return range;
        }
        //get all non-empty text nodes from the range as well as all block elements and line breaks
        var nodes = range.getNodes([3, 1], function(node)
        {
            return isBlockOrLineBreak(node) || (node.nodeType === 3 && !isWhitespaceNode(node));
        });
        var tempRange;
        var currentTopNode = null;
        //loop through the collection of text nodes removing them when we find a new range
        while (nodes.length > 0)
        {
            //If this is a block element. Skip over it
            if (nodes[0].nodeType === 1)
            {
                if (!(currentTopNode && $(currentTopNode).has(nodes[0]).length))
                {
                    currentTopNode = nodes[0];
                }
                nodes.splice(0, 1);
                continue;
            } else if (currentTopNode && !$(currentTopNode).has(nodes[0]).length)
            {
                currentTopNode = null;
            }

            //Node has siblings or it's parent is not a block level element
            if (nodes[0].parentNode.childNodes.length > 1 || !isBlockOrLineBreak(getTopParentWithSingleChild(nodes[0])))
            {
                //Create a new temporary range. 
                tempRange = rangy.createRangyRange();
                tempRange.setStartBefore(nodes[0]);
                for (var i = 0, l = nodes.length; i < l; i++)
                {
                    //If this is a block element. Skip over it
                    if (nodes[i].nodeType === 1)
                    {
                        continue;
                    }
                    if (isBlockOrLineBreak(nodes[i].nextSibling) ||
                       (!nodes[i].nextSibling && isBlockOrLineBreak(nodes[i].parentNode)) ||
                       (nodes[i + 1] && isBlockOrLineBreak(nodes[i + 1])))
                    {
                        tempRange.setEndAfter(nodes[i]);
                        break;
                    }

                    // Is the next node within the block parent
                    if (currentTopNode && !$(currentTopNode).has(nodes[i + 1]).length)
                    {
                        tempRange.setEndAfter(nodes[i]);
                        break;
                    }
                }
                //If we didn't find any block elements (i.e. begging of the range is the same as the end)
                //Then set the end to the very last element in the list
                if (tempRange.startContainer === tempRange.endContainer && tempRange.startOffset === tempRange.endOffset)
                {
                    i--;
                    tempRange.setEndAfter(nodes[i]);
                }
                blockRanges.push(tempRange);
                nodes.splice(0, i + 1);
            }
            //Doesn't have siblings
            else
            {
                if (isBlockOrLineBreak(getTopParentWithSingleChild(nodes[0])))
                {
                    tempRange = rangy.createRangyRange();
                    tempRange.selectNodeContents(nodes[0]);
                    blockRanges.push(tempRange);
                    nodes.splice(0, 1);
                }
            }
        }
        return blockRanges;
    };

    //Helper function to find all text nodes of a given node.
    var collectTextNodes = function(element, texts)
    {
        for (var child = element.firstChild; child !== null; child = child.nextSibling)
        {
            if (child.nodeType === 3) texts.push(child);
            else if (child.nodeType === 1) collectTextNodes(child, texts);
        }
    };

    var getTopNodes = function(nodes)
    {
        var newNodeCollection = [];
        for (var i = 0, l = nodes.length; i < l; i++)
        {
            var foundParent = false;
            for (var j = 0, len = nodes.length; j < len; j++)
            {
                //if current node is a child of any other node in the list, skip over it
                if ($.contains(nodes[j], nodes[i]))
                {
                    foundParent = true;
                    break;
                }
            }
            if (!foundParent)
            {
                newNodeCollection.push(nodes[i]);
            }
        }
        return newNodeCollection;
    };

    var getTopParentWithSingleChild = function(node)
    {
        if (node.parentNode.childNodes.length === 1)
        {
            return getTopParentWithSingleChild(node.parentNode);
        }
        else
        {
            return node;
        }

    };

    // "A whitespace node is either a Text node whose data is the empty string; or
    // a Text node whose data consists only of one or more tabs (0x0009), line
    // feeds (0x000A), carriage returns (0x000D), and/or spaces (0x0020), and whose
    // parent is an Element whose resolved value for "white-space" is "normal" or
    // "nowrap"; or a Text node whose data consists only of one or more tabs
    // (0x0009), carriage returns (0x000D), and/or spaces (0x0020), and whose
    // parent is an Element whose resolved value for "white-space" is "pre-line"."
    var isWhitespaceNode = function(node)
    {
        if (!node || node.nodeType != 3)
        {
            return false;
        }
        var text = node.data;
        if (text === "" || text === "\uFEFF")
        {
            return true;
        }
        var parent = node.parentNode;
        if (!parent || parent.nodeType != 1)
        {
            return false;
        }
        var computedWhiteSpace = getComputedStyleProperty(node.parentNode, "whiteSpace");

        return ((/^[\t\n\r ]+$/).test(text) && (/^(normal|nowrap)$/).test(computedWhiteSpace)) ||
            ((/^[\t\r ]+$/).test(text) && computedWhiteSpace == "pre-line");
    };

    var getComputedStyleProperty;

    if (typeof window.getComputedStyle != "undefined")
    {
        getComputedStyleProperty = function(el, propName)
        {
            return rangy.dom.getWindow(el).getComputedStyle(el, null)[propName];
        };
    } else if (typeof document.documentElement.currentStyle != "undefined")
    {
        getComputedStyleProperty = function(el, propName)
        {
            return el.currentStyle[propName];
        };
    } else
    {
        throw new Error("Can't create getComputedStyleProperty");
    }

    var inlineDisplayRegex = /^(none|inline(-block|-table)?)$/i;

    // "A block node is either an Element whose "display" property does not have
    // resolved value "inline" or "inline-block" or "inline-table" or "none", or a
    // Document, or a DocumentFragment."
    var isBlockOrLineBreak = function(node)
    {
        if (!node)
        {
            return false;
        }
        var nodeType = node.nodeType;
        return nodeType == 1 && (!inlineDisplayRegex.test(getComputedStyleProperty(node, "display")) ||
            node.tagName === "BR") || nodeType == 9 || nodeType == 11;
    };

    /**
    * Constructs a range from a saved selection using the start and end marker
    * @param {rangySelection} savedSelection
    * @return rangyRange object
    */

    function getRangeFromSavedSelection(savedSelection)
    {
        var rangeInfo = savedSelection.rangeInfos[0];
        if (rangeInfo.collapsed)
        { // Nothing is selected
            return null;
        }

        var startElement = $("#" + rangeInfo.startMarkerId)[0];
        var endElement = $("#" + rangeInfo.endMarkerId)[0];
        return createRangeFromElements(startElement, endElement);
    }

    /**
    * Create a rangy range using the startElement and endElement
    * @param {htmlElement} startElement
    * @param {htmlElement} startElement
    * @return rangyRange object
    */

    function createRangeFromElements(startElement, endElement, excludStartEndElements)
    {
        var range = rangy.createRangyRange();
        var startOp = excludStartEndElements ? "setStartAfter" : "setStartBefore";
        var endop = excludStartEndElements ? "setEndBefore" : "setEndAfter";
        range[startOp](startElement);
        range[endop](endElement);
        return range;
    }

    /**
    * Get non-whitespace text nodes
    * @param {rangyRange} Range object
    * @return Collection of matched text nodes
    */
    function getTextNodes(range, keepBoundaries)
    {
        if (!range.collapsed)
        {
            if (!keepBoundaries)
            {
                range = splitBoundaries(range);
            }
            return $(range.getNodes([3])).filter(function()
            {
                return !isWhitespaceNode(this);
            });
        }
    }

    /**
    * Replacement for range.splitNodes
    * rangy.splitBoundaris, causes the loss of user selection.  We need to restore the selection.
    */
    function splitBoundaries(range)
    {
        var selection = rangy.getSelection();
        if (selection.isCollapsed)
        {
            return range;
        }

        var savedSelection = rangy.saveSelection();
        (rangy.getSelection().getRangeAt(0)).splitBoundaries();

        var rangeInfo = savedSelection.rangeInfos[0];

        var startMarker = $("#" + rangeInfo.startMarkerId);
        var endMarker = $("#" + rangeInfo.endMarkerId);
        var newRange = createRangeFromElements(startMarker.get(0), endMarker.get(0), true);
        selection.setSingleRange(newRange);

        startMarker.remove();
        endMarker.remove();
        return rangy.getSelection().getRangeAt(0);
    }

    rangy.util.getRangeFromSavedSelection = getRangeFromSavedSelection;
    rangy.util.createRangeFromElements = createRangeFromElements;
    rangy.util.getTextNodes = getTextNodes;

    rangy.util.isWhitespaceNode = isWhitespaceNode;
    rangy.util.isBlockOrLineBreak = isBlockOrLineBreak;
    rangy.util.getTopNodes = getTopNodes;
    rangy.util.getTopParentWithSingleChild = getTopParentWithSingleChild;

});
