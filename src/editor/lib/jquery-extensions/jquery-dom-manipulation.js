/**
 * @fileoverview: Various dom manipulation function used by Arte
 */
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.dom = $.Arte.dom || {};
    var dom = $.Arte.dom;
    var configuration = $.Arte.configuration;
    var constants = $.Arte.constants;

    /**
     * wrap elements/nodes
     * In addition, if there is a rangySelectionBoundary span before or after the nodes to wrap,
     * include them in the wrap container
     */
    $.extend(dom, {
        wrapWithOptions: function(jNodes, options) {
            var wrapContainer = $();
            if (jNodes.length > 0) {
                wrapContainer = dom.createContainer(options);
                var rangyStartTag = dom.prevSiblingIncludingTextNodes(jNodes.first());
                if (rangyStartTag.hasClass(configuration.rangySelectionBoundaryClassName)) {
                    wrapContainer.append(rangyStartTag);
                }
                var rangyEndTag = dom.nextSiblingIncludingTextNodes(jNodes.last());

                jNodes.first().before(wrapContainer);
                jNodes.each(function() {
                    wrapContainer.append(this);
                });

                if (rangyEndTag.hasClass(configuration.rangySelectionBoundaryClassName)) {
                    wrapContainer.append(rangyEndTag);
                }
            }
            return wrapContainer;
        },

        /*
         * unwrap the elements/nodes
         * Unwrap each element in the jQuery selection and add br tag at the end if specified.
         */
        unwrapWithOptions: function(jNodes, options) {
            var children = $();

            jNodes.each(function() {
                var $this = $(this);

                // While unwrapping a block element, don't lose the line breaks before or after
                // For example: unwrapping the div in abc<div>elementToUnwrap</div>otherContent
                // should result in abc<br/>elementToUnwrap<br/>otherContent to maintain visual
                // consistency

                var filter = function(index, node) {
                    return !dom.isEmptyTextOrRangySpan(node);
                };

                if ($this.is(":block")) {
                    var prevNode = dom.prevSiblingIncludingTextNodes($this, filter);
                    if (prevNode.length && !prevNode.is(":block") && options && options.insertBr) {
                        $this.before($("<br />"));
                    }

                    // We need to insert a <br/> after this node if the current node has next node that is not block.
                    var nextNode = dom.nextSiblingIncludingTextNodes($this, filter);
                    if (nextNode.length && !nextNode.is(":block") && options && options.insertBr) {
                        $this.after($("<br />"));
                    }
                }

                var contents = $(this).contents();

                // If this node has any styles, we should maintain them
                if (options && options.maintainStyles) {
                    var newContainer = dom.wrapWithOptions(contents, {
                        applierTagName: "span",
                        attr: {
                            style: $this.attr("style")
                        }
                    });
                    newContainer.unwrap();
                    children = children.add(newContainer);
                } else {
                    contents.first().unwrap();
                    children = children.add(contents);
                }
            });

            return children;
        },

        /**
         * Surround a set of nodes with a block element.  If a block parent exist, apply the styles
         * to the existing block if there are attributes, or update the tagName of the block parent.
         */
        wrapWithBlock: function(jNodes, blockOptions) {
            // Get a block Parent for this range.
            var blockParent = dom.closestWithAtMostOneBlockChild(jNodes, blockOptions.topEditableParent);
            var tagName = blockParent.prop("tagName");
            var nodesToWrap;
            // Does not have a block parent with desired tagName or the block parent is LI
            // LI is a special case as we never want to wrap a LI with anything (except )
            if (!blockParent.first().is(":block") || // top parent is not a block element
                blockOptions.applierTagName === constants.tagName.LI || // want to wrap the nodes with LI
                !configuration.styleableTags[tagName]) {
                nodesToWrap = blockParent;
            } else if (tagName === blockOptions.applierTagName ||
                (configuration.styleableTags[tagName] && configuration.styleableTags[blockOptions.applierTagName])) {
                if (blockOptions.styleName) {
                    blockParent.css(blockOptions.styleName, blockOptions.styleValue);
                } else if (blockOptions.className) {
                    blockParent.addClass(blockOptions.className);
                } else {
                    // e.g. wrapping a LI with a OL.
                    nodesToWrap = blockParent;
                }
            } else {
                nodesToWrap = jNodes;
            }

            var container = nodesToWrap ? dom.wrapWithOptions(nodesToWrap, blockOptions) : blockParent;

            // In case there is a immediate sibling of line break, remove that
            var br = container.next();
            if (br.length && br.prop("tagName") == constants.tagName.BR) {
                br.remove();
            }
            return container;
        },

        /*
         * block unsurround
         */
        unwrapBlock: function(jNodes, blockOptions) {
            var blockParent = dom.closestWithCommand(jNodes, blockOptions);
            if (!blockParent.length) {
                return jNodes;
            }

            // In this case the blockParent has multiple styles or is the contentEditable, only remove the styles
            if (!$.isEmptyObject(dom.getStyles(blockParent)) ||
                    dom.getClasses(blockParent).length > 0 ||
                    blockParent.attr("contentEditable")) {
                if (blockOptions.styleName) {
                    return blockParent.css(blockOptions.styleName, "");
                } else if (blockOptions.className) {
                    return blockParent.removeClass(blockOptions.className);
                }
            } else {
                return dom.unwrapWithOptions(blockParent, {
                    "insertBr": true
                });
            }
        },

        /**
         * Create a dom element with options
         * @param {object} a set of dom element creation options
         *                 tagName, attr, styleName+styleValue, className
         * @return {jNode} A jQuery element
         */
        createContainer: function(options) {
            var tagName = options.applierTagName || "div";
            var newElement = $("<" + tagName + ">");
            if (options.attr) {
                newElement.attr(options.attr);
            }
            if (options.styleName && options.styleValue) {
                newElement.css(options.styleName, options.styleValue);
            }
            if (options.className) {
                newElement.addClass(options.className);
            }
            return newElement;
        }
    });
})(jQuery);
