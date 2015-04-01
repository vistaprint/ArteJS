/**
 * @fileoverview This file includes a collection of extension to jQuery that allows complex traversals of dom tree
 */
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.dom = $.Arte.dom || {};
    var dom = $.Arte.dom;
    var constants = $.Arte.constants;
    var configuration = $.Arte.configuration;
    var util = $.Arte.util;
    //Sizzle extension
    $.extend($.expr[":"], {
        /**
         * Sizzle lis to find block level elements
         * Usage:
         * - $("body :block") // returns all block elements inside body tag.
         * - $(element).is(":block") // will check if element is block or not.
         */
        block: function(element) {
            // Check if computed display of the element is block and float is not set.
            return element.nodeType !== 3 && ((element && element.tagName === "BR") || (($(element).css("display") === "block" ||
                $(element).css("display") === "list-item") && $(element).css("float") === "none"));
        },
        /**
         * Checks if the jQuery node is an element
         * Usage: jElement.is(":element");
         */
        element: function(element) {
            return element.nodeType === constants.nodeType.ELEMENT;
        },
        //cwkTODO delete
        emptyText: function(element) {
            return element.nodeType === 3 && (element.nodeValue.match(/^\s*$/ig) !== null);
        },
        /**
         * Find all elements that have block level children nodes
         * Usage: $("div").not(":blockChildren") - will return all div elements that don't have block children
         */
        blockChildren: function(element) {
            // Get all children of current element, remove the element itself and filter out none block children;
            return $(element).children().not(this).filter(":block").length > 0;
        }
    });

    /**
     * Get a next or previous sibling node (text or element) and allows filtering
     * @param {htmlNodes} nodes
     * @param {bool} direction
     * @param {function} additional filtering (for example, excluding empty nodes)
     * @return next or previous node
     */
    var seekDirection = {
        Next: 0,
        Prev: 1
    };

    function getSiblingIncludingTextNodes(nodes, direction, filter) {
        var allNodes = $();
        var isNext = direction === seekDirection.Next;
        nodes.each(function() {
            var result;
            var children = $(this).parent().contents().get();
            var index = $.inArray($(this).get(0), children);

            // Based on the seekDirection, we want to move forward or backward
            var increment = isNext ? 1 : -1;
            for (var i = index + increment; isNext ? i < children.length : i >= 0; i = i + increment) {
                var filterResult = filter ? filter(i, children[i]) : true;
                if (filterResult) {
                    result = children[i];
                    break;
                }
            }
            if (result) {
                allNodes.push(result);
            }
        });
        return allNodes;
    }

    /**
     * Overriding jQuery native function that can't operate on text nodes.
     */
    if (document.documentElement.contains) {
        jQuery.contains = function(a, b) {
            //IE contains function on the same node will return true, vs. other browsers returning false.
            //This code will to fix this behavior.
            if (a === b) {
                return false;
            }

            //if a is a text node it can't contain anything
            if (a.nodeType === 3) {
                return false;
            }

            //Sizzle can't handle contains when one of the parameters is a textNode
            var bup = b.parentNode || {};
            return a === bup || (bup.nodeType === 1 ? (!a.contains || a.contains(bup)) :
                ((a !== b && a.contains) ? a.contains(b) : true));
        };
    }

    $.extend(dom, {
        /**
         * Check if an element is empty text.
         * @param {element} an HTML DOM element
         */
        isEmptyText: function(element) {
            return element.nodeType === 3 && (element.nodeValue.match(/^\s*$/ig) !== null);
        },

        /**
         * Check if an element is a rangy span.
         * @param {element} an HTML DOM element
         */
        isRangySpan: function(element) {
            return $(element).hasClass(configuration.rangySelectionBoundaryClassName);
        },

        /**
         * Check if an element is empty text or a rangy span.
         *
         * NOTE: We use this method now instead of using
         * jQuery.is() with a custom Sizzle selector
         * (e.g.: `return $(element).is(":emptyTextOrRangySpan")`)
         * because starting in jQuery 1.10,
         * filter(), which is called by jQuery.is(),
         * only works on nodeType 1 (ELEMENT_NODE),
         * but we use it to check TEXT_NODE (nodeType = 3) as well.
         * Ref: https://github.com/vistaprint/ArteJS/issues/60
         *
         * @param {element} an HTML DOM element
         */
        isEmptyTextOrRangySpan: function(element) {
            return $(element).is(":emptyText") || this.isRangySpan(element); //cwkTODO undo
            //return this.isEmptyText(element) || this.isRangySpan(element);
        },

        /**
         * Get top most parent such that there are is either no block child or only one block child
         * @param {jElement} topMostElement absolute ceiling (for example the top content editable element).
         * @return {jElement} parent node or the input jquery object
         */
        closestWithAtMostOneBlockChild: function(jNode, topMostElement) {
            var allNodes = [];
            jNode.each(function() {
                var parent = null;
                $(this).parentsUntil(topMostElement).each(function() {
                    var blockChildrenCount = $(this).children(":block").length;
                    // 0 or 1 block child
                    var isValid = (blockChildrenCount === 0) ||
                        // There are not other non-block children
                        (blockChildrenCount === 1 && blockChildrenCount === this.childNodes.length);
                    if (isValid) {
                        parent = this;
                    }
                    return isValid;
                });
                var result = parent || this;

                // don't include duplicate nodes
                if ($.inArray(result, allNodes) === -1) {
                    allNodes.push(result);
                }
            });

            return $(allNodes);
        },

        /**
         * Get previous node (text or element) and allows filtering
         * @param {function} additional filtering (for example, excluding empty nodes)
         * @return previous node
         */
        prevSiblingIncludingTextNodes: function(jNodes, filter) {
            return getSiblingIncludingTextNodes(jNodes, seekDirection.Prev, filter);
        },

        /**
         * Get next node (text or element) and allows filtering
         * @param {function} additional filtering (for example, excluding empty nodes)
         * @return next node
         */
        nextSiblingIncludingTextNodes: function(jNodes, filter) {
            return getSiblingIncludingTextNodes(jNodes, seekDirection.Next, filter);
        },

        /**
         * Split the classes of a jQuery element
         * @return {array} List of classes
         */
        getClasses: function(jNode) {
            var result = [];
            var classString = jNode.attr("class");
            if (classString) {
                result = classString.split(/\s+/);
            }
            return result;
        },

        /**
         * Parses the styles of the first object in the jQuery element
         * @return {array} an object representing the styles and their values
         */
        getStyles: function(jNode) {
            var returnValue = {};
            if (jNode.prop("nodeType") === constants.nodeType.TEXT) { // Text nodes won't have any styles set.
                return returnValue;
            }

            // The css style enumeration doesn't work in IE7 so we have to use the cssText to check which styles are set
            var style = jNode.attr("style");
            var cssText = (style) ? style.toLowerCase().split(";") : [];

            $.each(cssText, function(i, value) {
                value = $.trim(value);
                if (!value) {
                    return true;
                }

                var index = value.indexOf(":");
                var styleKey = $.trim(value.substring(0, index));
                var styleValue = $.trim(value.substring(index + 1));
                // Note: in IE setting the css value of a style to "" would retain this value in the cssText
                // Filter out the null/empty values
                if (styleValue) {
                    returnValue[styleKey] = styleValue;
                }
            });
            return returnValue;
        },

        /**
         * Check if a particular command is applied to the node
         * For example, the nodes <span style="font-weight:bold">ABC</span> or <span class="arte-font-weight">ABC</span>
         * have font-weight command applied and <b>ABC</b> have bold command applied
         * @param {string} commandName [see Arte.configuration.commands]
         */
        hasCommandApplied: function(jNodes, commandName) {
            var result = false;
            var commandConfig = configuration.commands[commandName];
            jNodes.each(function() {
                var $this = $(this);
                if (this.nodeType === constants.nodeType.TEXT) {
                    result = false;
                    return result;
                }
                var styles = dom.getStyles($this);
                result = (commandConfig.classNameRegex && dom.hasClassWithPattern($this, commandConfig.classNameRegex)) ||
                    (commandConfig.styleName && styles[commandConfig.styleName]) ||
                    (commandConfig.tagName && this.tagName === commandConfig.tagName);
                return result;
            });
            return result;
        },

        /**
         * Check if a particular style, class, tag is applied to the node
         * @param jNode
         * @param options Set of options for this command
         * @param [options.className] className, (e.g. arte-font-weight)
         * @param [options.styleName] styleName (e.g. font-weight)
         * @param [options.styleValue] styleValue (e.g. bold)
         * @param [options.tagName] tagName (e.g. p or div)
         */
        hasCommandValue: function(jNode, options) {
            var result = false;
            jNode.each(function() {
                var $this = $(this);
                result = (options.className && $this.hasClass(options.className)) ||
                    (options.styleName && dom.getStyles($this)[options.styleName] === options.styleValue) ||
                    (options.tagName && $this.prop("tagName") === options.tagName);
                return result;
            });
            return result;
        },

        getCommandValue: function(jNode, options) {
            var result = {};
            var commandConfig = configuration.commands[options.commandName];
            jNode.each(function() {
                var $this = $(this);
                var styles = dom.getStyles($this);
                if (options.className && $this.hasClass(options.className)) {
                    result.className = options.className;
                } else if (dom.hasClassWithPattern($this, commandConfig.classNameRegex)) {
                    result.className = dom.getClassWithPattern($this, commandConfig.classNameRegex)[0];
                } else if (options.styleName && styles[options.styleName]) {
                    result.styleName = styles[options.styleName];
                } else if (options.tagName && $this.prop("tagName") === commandConfig.tagName) {
                    result.tagName = $this.prop("tagName");
                }
                return result;
            });
            return result;
        },
        /**
         * Check if the input element has a class that matches the pattern
         * @param jNode
         * @param {string} regex pattern (see Arte.configuration.commands)
         * @return {bool} whether the element has a class with the pattern
         */
        hasClassWithPattern: function(jNode, pattern) {
            return pattern.test(jNode.attr("class"));
        },

        /**
         * Gets the class that matches the pattern
         * @param jNode
         * @param {string} regex pattern (see Arte.configuration.commands)
         * @return {string} Returns the class with pattern or null
         */
        getClassWithPattern: function(jNode, pattern) {
            return pattern.exec(jNode.attr("class"));
        },

        /**
         *  Remove class that matches the pattern
         * @param jNode
         * @param {string} regex pattern (see Arte.configuration.commands)
         */
        removeClassWithPattern: function(jNode, pattern) {
            var classNames = dom.getClassWithPattern(jNode, pattern) || [];
            $.each(classNames, function(index, className) {
                jNode.removeClass(className);
            });
        },

        /**
         * Checks if all the list elements are surrounded by same list parent
         * @param jNodes Collection of LI elements
         * @return {bool} Whether all of the list elements have same parent
         */
        hasSameListParent: function(jNodes) {
            var parent = jNodes.first().closest(constants.tagName.LI).parent();
            if (parent.length === 0) {
                return false;
            }

            var hasSameParent = true;
            jNodes.each(function() {
                hasSameParent = parent.has(this).length !== 0;
                return hasSameParent;
            });
            return hasSameParent;
        },

        /**
         * Checks if all the input elements have a class
         * @param {string} className
         * @return {bool} Whether all of the selected nodes have the className applied
         */
        allHaveClass: function(jNodes, className) {
            var hasClass = true;
            jNodes.each(function() {
                hasClass = $(this).hasClass(className);
                return hasClass;
            });
            return hasClass;
        },

        /**
         * Checks whether jLeftNode and jRightNode have same classes applied.
         * @param {jLeftNode} jQuery Node
         * @param {jRightNode} jQuery Node
         * @return {bool} whether both elements have same classes applied
         */
        hasSameClass: function(jLeftNode, jRightNode) {
            var thisClasses = {};
            var thatClasses = {};
            $.each(dom.getClasses(jLeftNode), function() {
                thisClasses[this] = 1;
            });
            $.each(dom.getClasses(jRightNode), function() {
                thatClasses[this] = 1;
            });
            return util.all(thisClasses, function(key) {
                    return thatClasses[key];
                }) &&
                util.all(thatClasses, function(key) {
                    return thisClasses[key];
                });
        },

        /**
         * Checks whether jLeftNode and jRightNode have same styles applied.
         * @param {jLeftNode} jQuery Node
         * @param {jRightNode} jQuery Node
         * @return {bool} whether both elements have same styles applied
         */
        hasSameStyle: function(jLeftNode, jRightNode) {
            var thisStyles = dom.getStyles(jLeftNode);
            var thatStyles = dom.getStyles(jRightNode);
            return util.all(thisStyles, function(key, value) {
                    return thatStyles[key] === value;
                }) &&
                util.all(thatStyles, function(key, value) {
                    return thisStyles[key] === value;
                });
        },

        /**
         * Checks whether jLeftNode and jRightNode have same styles and same classes applied.
         * @param {jLeftNode} jQuery Node
         * @param {jRightNode} jQuery Node
         * @return {bool} whether both elements have same styles and classes applied
         */
        hasSameStyleAndClass: function(jLeftNode, jRightNode) {
            return dom.hasSameStyle(jLeftNode, jRightNode) && dom.hasSameClass(jLeftNode, jRightNode);
        },

        /**
         * Get the closest node to which the command value is applied
         * @param jNode
         * @param options see closestWithCommand for more information
         * @return {jElements}  Set of jQuery elements that have the command applied
         */
        closestWithCommandValue: function(jNode, options) {
            return dom.closestWithCommand(jNode, $.extend(options, {
                checkValue: 1
            }));
        },

        /*
         * Evaluates an element or its parents have a style/class/tag applied
         * @param jNode
         * @param options Command Options
         * @param [options.commandName] commandName; if not supplied the command is inferred from the styleName or className
         * @param [options.styleName] name of css style to check
         * @param [options.styleValue] value of the css style to verify if checkValue is set
         * @param [options.className] name of the class to check
         * @param [options.topEditbleParent] ceiling html node to evaluate for result
         * @param [options.checkValue] whether to check the style/class value
         * @return {jElements}  Set of jQuery elements that have the command applied
         */
        closestWithCommand: function(jNode, options) {
            var result = $();
            var commandConfig = util.getCommandConfig(options);
            if (!commandConfig) {
                return result;
            }

            jNode.each(function() {
                var $this = $(this);
                var topLevelNode = options.topEditableParent || dom.getTopEditableParent($this).get(0);
                if (topLevelNode) {
                    var parentsAndSelf = $this.parentsUntil(topLevelNode.parentNode);
                    parentsAndSelf.splice(0, 0, this);
                    parentsAndSelf.each(function() {
                        if (dom.hasCommandApplied($(this), commandConfig.commandName)) {
                            // Add to result if check value is not requested or the node has the command value applied
                            if (!options.checkValue || dom.hasCommandValue($(this), options)) {
                                result.push(this);
                            }
                            return false; // Exit the loop
                        }
                        return true;
                    });
                }
            });
            return result;
        },

        /*
         * Get the top contentEditableElement or TextArea
         * @param jNode
         * @return {jElement} top level editable element
         */
        getTopEditableParent: function(jNode) {
            var contentEditable = jNode.closest("[contenteditable=true]");
            return contentEditable.length ? contentEditable : jNode.closest("textarea");
        },

        /**
         * Checks if all of the input nodes are surrounded by a list
         * @param {options}
         *   singleList: true|false
         *   tagName: OL|UL
         * @return boolean
         */
        listSurrounded: function(jNode, options) {
            var allNodesListSurrounded = util.all(jNode, function(index, node) {
                return $(node).closest(constants.tagName.LI).parents("[contenteditable=true]").get(0);
            });

            if (allNodesListSurrounded) {
                var parents = jNode.closest(constants.tagName.LI).parent();
                if (options && options.singleList && parents.length > 1) { // the LI elements belong to different lists
                    return false;
                }

                if (options && options.tagName) {
                    var hasSameTagName = false;
                    parents.each(function(index, element) {
                        hasSameTagName = element.tagName === options.tagName;
                        return hasSameTagName;
                    });
                    return hasSameTagName;
                }
                return true;
            }

            return false;
        },

        isEqual: function(jNode1, jNode2) {
            if (!jNode1.get(0) || !jNode2.get(0)) {
                return false;
            }

            var isEqual = true;

            // Attributes to check when comparing the nodes
            var attributes = ["style", "id", "class"];

            //compare node
            if (jNode1.prop("tagName") === jNode2.prop("tagName")) {
                //compare attributes
                $.each(attributes, function(index, attrib) {
                    if (attrib === "style") {
                        isEqual = $.Arte.dom.hasSameStyle(jNode1, jNode2);
                    } else if (attrib === "class") {
                        isEqual = $.Arte.dom.hasSameClass(jNode1, jNode2);
                    } else {
                        var thisAttr = jNode1.attr(attrib) && $.trim(jNode1.attr(attrib));
                        var thatAttr = jNode2.attr(attrib) && $.trim(jNode2.attr(attrib));

                        isEqual = thisAttr === thatAttr;
                    }
                    return isEqual;
                });

                if (isEqual) {
                    //check children nodes
                    var noEmptyTextNodesFilter = function(index, node) {
                        return !dom.isEmptyText(node);
                    };
                    var thisContent = jNode1.contents().filter(noEmptyTextNodesFilter);
                    var thatContent = jNode2.contents().filter(noEmptyTextNodesFilter);

                    // has same child count
                    isEqual = thisContent.length === thatContent.length;

                    for (var i = 0, l = thisContent.length; i < l && isEqual; i++) {
                        isEqual = thisContent[i].nodeType === 3 ?
                            $.trim(thisContent[i].nodeValue) === $.trim(thatContent[i].nodeValue) :
                            dom.isEqual($(thisContent[i]), $(thatContent[i]));
                    }
                }
            } else {
                isEqual = false;
            }

            return isEqual;
        }
    });

})(jQuery);
