/*global Arte:false*/

rangy.createModule("BlockElementApplier", function(api)
{
    api.requireModules(["WrappedSelection", "WrappedRange"]);

    var dom = $.Arte.dom;
    var constants = $.Arte.constants;

    /**
    * An object to holde the result of block surround test operation
    */
    var blockSurroundState = function()
    {
        this.Surrounded = 0; // All of the blocks in the range are surrounded
        this.UnSurrounded = 1; // All of the blocks in the range are not surrounded
        this.Mixed = 2; // Some of the blocks in the range are surrounded
        this.Invalid = 3; // Invalid State

        this.surroundedIndexes = [];   // collection of surrounded ranges
        this.unSurroundedIndexes = []; // collection of unsurrounded ranges

        this._state = "";
        this.computeState = function()
        {
            if (this.surroundedIndexes.length && !this.unSurroundedIndexes.length)
            { // All surrounded
                this._state = this.Surrounded;
            } else if (this.unSurroundedIndexes.length && !this.surroundedIndexes.length)
            { // All un-surrounded
                this._state = this.UnSurrounded;
            } else if (this.surroundedIndexes.length && this.unSurroundedIndexes.length)
            { // Some are surrounded and some are not surrounded
                this._state = this.Mixed;
            } else
            { // Something weird happened
                this._state = this.Invalid;
            }
            return this._state;
        };

        this.state = function(newState)
        {
            if (newState)
            {
                this._state = newState;
            }
            if (!this._state)
            {
                this._state = this.computeState();
            }
            return this._state;
        };
    };

    /**
    * Checks if all of the block ranges block surrounded and the attributes are applied to the parent node
    * @param {[rangyRanges]} ranges
    * @return result object
    */
    function areRangesBlockSurrounded(ranges, options)
    {
        var rangeCount = ranges.length;
        var surroundState = new blockSurroundState();
        var nodesByRange = getTopNodesFromRanges(ranges);

        for (var i = 0; i < rangeCount; i++)
        {
            var bucket = (dom.closestWithCommandValue(nodesByRange[i], options).length > 0) ? surroundState.surroundedIndexes : surroundState.unSurroundedIndexes;
            bucket.push(i);
        }

        return surroundState;
    }

    /**
    * Checks if a set of ranges is block surrounded by a LI tag
    * In case all of the ranges are surrounded, also checks if the surrounded blocks are surrounded by the same ol/ul parent
    * @param {[rangyRanges]} ranges
    * @param {BlockSurroundOptions} options
    * @return BlockSurroundResult
    */
    function isBlockSetSurrounded(ranges, blockOptions)
    {
        // Check if all of the ranges are surrounded by LI.
        var surroundState = areRangesBlockSurrounded(ranges,
            { tagName: constants.tagName.LI, commandAttrType: blockOptions.commandAttrType, topEditableParent: blockOptions.topEditableParent });

        // Make sure in case all the ranges are surrounded, they are surrounded by same list parent; if not, change the state to Mixed
        // In case there are two lists next to each other
        if (surroundState.state() === surroundState.Surrounded)
        {
            var listElements = $();
            $.each(ranges, function(index, range)
            {
                var li = $(rangy.util.getTopNodes(range.getNodes())).closest(constants.tagName.LI);
                listElements.push(li.get(0));
            });

            if (!dom.hasSameListParent(listElements))
            {
                // Check if all of the list element are part of same list
                // Mixed State => <ol> <li> first </li> </ol> <ol> <li> second </li> <ol>
                surroundState.state(surroundState.Mixed);
            } else
            {
                // Check if the list tag is not the one we want
                var parent = listElements.first().parent();
                if (parent.prop("tagName") !== blockOptions.applierTagName.toUpperCase())
                {
                    surroundState.state(surroundState.UnSurrounded);
                }
            }
        }
        return surroundState;
    }

    /* 
    * Given a range and a list, determent how many list items are before, inside and after the range
    */
    function getSelectedListElements(jListParent, blockOptions)
    {
        var jListElement = jListParent.children();

        // construct a list of nodes that are after and before the selection
        var beforeSelection = $(),
            selection = $(),
            afterSelection = $();
        var target = beforeSelection;

        jListElement.each(function()
        {
            if (blockOptions.originalRange.intersectsNode(this))
            {
                target = afterSelection;
                selection.push(this);
                return true;
            }
            target.push(this);
            return true;
        });

        return { tagName: jListParent.prop("tagName"), beforeSelection: beforeSelection, selection: selection, afterSelection: afterSelection };
    }

    /**
    * Gets nodes from ranges
    * Note that once the dom is manipulated, the ranges are no longer valid
    * @param {[rangyRanges]} ranges
    * @return object with nodeIndex -> [nodes in the range] mapping
    */
    function getTopNodesFromRanges(ranges)
    {
        var nodeCollection = {};
        var func = function()
        {
            nodeCollection[i].push(this);
        };

        for (var i = 0; i < ranges.length; i++)
        {
            nodeCollection[i] = $();
            $(rangy.util.getTopNodes(ranges[i].getNodes())).each(func);
        }
        return nodeCollection;
    }

    /*
    * If there are partially selected lists at the begining or end of selection, properly close the
    * non selected list elements.
    */
    function closeListsAroundSelection(splitRanges, blockOptions)
    {
        var blockSurroundedResult = blockOptions.blockSurroundState;

        var wrapUnselectedListItems = function(selectionResult)
        {
            var wrapWithBlock = dom.wrapWithBlock;
            // close the list before and after the selection
            wrapWithBlock(selectionResult.beforeSelection, { applierTagName: selectionResult.tagName });
            wrapWithBlock(selectionResult.afterSelection, { applierTagName: selectionResult.tagName });
        };

        var evaluateSelection = function(selectedElement)
        {
            var parent = selectedElement.closest(constants.tagName.LI).parent();
            var selectionResult = getSelectedListElements(parent, blockOptions);
            return { parent: parent, selectionResult: selectionResult };
        };

        // Check if the first and/or the last range is surrounded
        var selectionBegin;
        if (blockSurroundedResult.surroundedIndexes[0] === 0)
        { // first block in the range is surrounded
            selectionBegin = evaluateSelection($(splitRanges[0].startContainer));
        }

        var rangeCount = splitRanges.length;
        var selectionEnd;
        if (blockSurroundedResult.surroundedIndexes[blockSurroundedResult.surroundedIndexes.length - 1] === rangeCount - 1) //Last block in the range is surrounded
        {
            selectionEnd = evaluateSelection($(splitRanges[rangeCount - 1].startContainer));
        }

        // If the first or the last range is surrounded, remove the selected List elements and properly close the lists 
        if (selectionBegin)
        {
            dom.unwrapWithOptions(selectionBegin.parent);
            wrapUnselectedListItems(selectionBegin.selectionResult);
        }

        if (selectionEnd && (!selectionBegin || (selectionBegin.parent[0] !== selectionEnd.parent[0])))
        {
            dom.unwrapWithOptions(selectionEnd.parent);
            wrapUnselectedListItems(selectionEnd.selectionResult);
        }
    }

    /**
    * Wrap each range in split ranges with LI and then wrap all LIs into a UL/OL
    * @param {[rangyRanges]} splitRanges
    * @param {blockSurroundOptions} blockOptions
    * @return an array of new ranges
    */
    function surroundRangeSet(splitRanges, blockOptions)
    {
        var blockSurroundedResult = blockOptions.blockSurroundState;
        var nodesByBlockRange = getTopNodesFromRanges(splitRanges);
        var wrappedNodes = $();

        closeListsAroundSelection(splitRanges, blockOptions);
        // Create mapping lookup table
        var rangeLookup = {};
        $.each(blockSurroundedResult.surroundedIndexes, function()
        {
            rangeLookup[this] = 1;
        });

        var addToWrappedNodes = function()
        {
            wrappedNodes.push(this);
        };

        // Handle the selected elements
        var rangeCount = splitRanges.length;
        for (var i = 0; i < rangeCount; i++)
        {
            var nodeContainer;
            if (!rangeLookup[i])
            {
                // If a selection includes a empty line (ex. <br/>some text) a rangy selection span gets inserted at the  beginning of the block tag
                // in this case we don't want to wrap this into a block.
                if (nodesByBlockRange[i][0].nodeType == 3 && nodesByBlockRange[i][0].nodeValue.charCodeAt(0) == 65279)
                {
                    continue;
                }

                nodeContainer = dom.wrapWithBlock(nodesByBlockRange[i], { applierTagName: constants.tagName.LI, topEditableParent: blockOptions.topEditableParent });
                wrappedNodes.push(nodeContainer[0]);
            } else
            {
                // Skip over the nodes that we already unwrapped
                var node = nodesByBlockRange[i].first().closest(constants.tagName.LI);
                if (!(node.parents(constants.tagName.OL)[0] || node.parents(constants.tagName.UL)[0]))
                {
                    wrappedNodes.push(node[0]);
                    continue;
                }

                // This list is completely with-in a selection
                node.parent().children().each(addToWrappedNodes);
                dom.unwrapWithOptions(node.parent());
            }
        }

        dom.wrapWithOptions(wrappedNodes, blockOptions);
    }

    /**
    * Unwrap each range in split ranges from LI and UL and properly close the Ol/UL of the non-selected list elements
    * @param {[rangyRanges]} splitRanges
    * @param {blockSurroundOptions} blockOptions
    * @return an array of new ranges
    */
    function unSurroundRangeSet(splitRanges, blockOptions)
    {
        var jParent = $(splitRanges[0].startContainer).closest(constants.tagName.LI).parent();
        var parentTag = jParent.prop("tagName");

        var selectedLIs = getSelectedListElements(jParent, blockOptions);

        // Remove the ul/ol parent
        dom.unwrapWithOptions(jParent);

        // close the list before the selection
        dom.wrapWithOptions(selectedLIs.beforeSelection, { applierTagName: parentTag });

        // for these nodes, we want to remove the list tags     
        dom.unwrapWithOptions(selectedLIs.selection, { "insertBr": true, "maintainStyles": true });

        // close the list after the selection
        dom.wrapWithOptions(selectedLIs.afterSelection, { applierTagName: parentTag });
    }

    /**
    * Given a set of selections and content ranges, expand the selection ranges to block level elements
    * @param {rangyRange} selectionRange
    * @param {rangyRange} contentRange
    * @return expanded range
    */
    function expandRange(selectionRange, topEditableParent)
    {
        if (!topEditableParent)
        {
            return selectionRange;
        }

        var contentEditableRange = rangy.createRangyRange();
        contentEditableRange.selectNodeContents(topEditableParent);
        //Get all ranges within contentRange
        var blocks = contentEditableRange.splitByBlock();
        var clonedSelectionRange = selectionRange.cloneRange();

        //Loop through blocks and find intersections with selection
        for (var i = 0, l = blocks.length; i < l; i++)
        {
            if (clonedSelectionRange.intersectsRange(blocks[i]))
            {
                //if begging of the selection is inside the current block, expend the begging of selection to the begging of the block
                if (blocks[i].comparePoint(clonedSelectionRange.startContainer, clonedSelectionRange.startOffset) === 0)
                {
                    clonedSelectionRange.setStart(blocks[i].startContainer, blocks[i].startOffset);
                }
                //otherwise if end of the selection is inside the current block, expend the end of selection to the end of the block
                if (blocks[i].comparePoint(clonedSelectionRange.endContainer, clonedSelectionRange.endOffset) === 0)
                {
                    clonedSelectionRange.setEnd(blocks[i].endContainer, blocks[i].endOffset);
                }
            }
        }
        return clonedSelectionRange;
    }

    /**
    * Toggle surround a range with list element
    * @param {[rangyRanges]} splitRanges
    * @param {blockSurroundOptions} blockOptions
    * @return an array of new ranges
    */
    function toggleSurroundRangeSet(range, options)
    {
        var blockOptions = new $.Arte.ElementApplierOptions(options);

        var expandedRanges = expandRange(range, options.topEditableParent);

        blockOptions.originalRange = expandedRanges;
        var splitRanges = expandedRanges.splitByBlock();
        var surroundState = isBlockSetSurrounded(splitRanges, blockOptions);
        blockOptions.blockSurroundState = surroundState;

        if (surroundState.state() === surroundState.UnSurrounded ||
            surroundState.state() === surroundState.Mixed)
        {
            surroundRangeSet(splitRanges, blockOptions);
        } else if (surroundState.state() === surroundState.Surrounded)
        {
            unSurroundRangeSet(splitRanges, blockOptions);
        }
    }

    /**
    * Toggle surround a selection with list element
    * @param {[rangyRanges]} splitRanges
    * @param {blockSurroundOptions} blockOptions
    * @return an array of new ranges
    */
    function toggleSurroundSelectionSet(options, topEditableParent)
    {
        var blockOptions = new $.Arte.ElementApplierOptions(options, topEditableParent);
        var selection = rangy.getSelection();
        var range = selection.getRangeAt(0);
        if (range)
        {
            toggleSurroundRangeSet(range, blockOptions);
        }
    }

    /**
    * Toggle surround each range in split ranges 
    * @param {[rangyRanges]} splitRanges
    * @param {blockSurroundOptions} blockOptions
    * @return an array of new ranges
    */
    function toggleSurroundRange(range, options)
    {
        if (range.isCollapsed)
        {
            return;
        }

        var blockOptions = new $.Arte.ElementApplierOptions(options);

        var expandedRange = expandRange(range, options.topEditableParent);

        var splitRanges = expandedRange.splitByBlock();
        var surroundState = areRangesBlockSurrounded(splitRanges, blockOptions);
        var nodesByRange = getTopNodesFromRanges(splitRanges);

        // Iterate over each range and surround the content of the range with a block level element
        for (var rangeIndex in nodesByRange)
        {
            var jNodes = nodesByRange[rangeIndex];
            if (surroundState.state() == surroundState.Surrounded)
            {
                dom.unwrapBlock(jNodes, blockOptions);
            } else
            {
                dom.wrapWithBlock(nodesByRange[rangeIndex], blockOptions);
            }
        }
    }

    /**
    * Toggle surround a selection with block element
    * @param {[rangyRanges]} splitRanges
    * @param {blockSurroundOptions} blockOptions
    * @return an array of new ranges
    */
    function toggleSurroundSelection(options, topEditableParent)
    {
        var blockOptions = new $.Arte.ElementApplierOptions(options, topEditableParent);
        var selection = rangy.getSelection();
        var range = selection.getRangeAt(0);
        if (range)
        {
            toggleSurroundRange(range, blockOptions);
        }
    }

    /*Public api*/
    // Api for surrounding individual blocks
    api.toggleSurroundRange = toggleSurroundRange;
    api.toggleSurroundSelection = toggleSurroundSelection;

    // Api for surrounding block sets (for lists)
    api.toggleSurroundRangeSet = toggleSurroundRangeSet;
    api.toggleSurroundSelectionSet = toggleSurroundSelectionSet;
});
