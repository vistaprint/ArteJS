/**
 * Rangy, a cross-browser JavaScript range and selection library
 * https://github.com/timdown/rangy
 *
 * Copyright 2014, Tim Down
 * Licensed under the MIT license.
 * Version: 1.3.0-alpha.20140921
 * Build date: 21 September 2014
 */

(function(factory, root) {
    if (typeof define == "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof module != "undefined" && typeof exports == "object") {
        // Node/CommonJS style
        module.exports = factory();
    } else {
        // No AMD or CommonJS support so we place Rangy in (probably) the global variable
        root.rangy = factory();
    }
})(function() {

    var OBJECT = "object", FUNCTION = "function", UNDEFINED = "undefined";

    // Minimal set of properties required for DOM Level 2 Range compliance. Comparison constants such as START_TO_START
    // are omitted because ranges in KHTML do not have them but otherwise work perfectly well. See issue 113.
    var domRangeProperties = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed",
        "commonAncestorContainer"];

    // Minimal set of methods required for DOM Level 2 Range compliance
    var domRangeMethods = ["setStart", "setStartBefore", "setStartAfter", "setEnd", "setEndBefore",
        "setEndAfter", "collapse", "selectNode", "selectNodeContents", "compareBoundaryPoints", "deleteContents",
        "extractContents", "cloneContents", "insertNode", "surroundContents", "cloneRange", "toString", "detach"];

    var textRangeProperties = ["boundingHeight", "boundingLeft", "boundingTop", "boundingWidth", "htmlText", "text"];

    // Subset of TextRange's full set of methods that we're interested in
    var textRangeMethods = ["collapse", "compareEndPoints", "duplicate", "moveToElementText", "parentElement", "select",
        "setEndPoint", "getBoundingClientRect"];

    /*----------------------------------------------------------------------------------------------------------------*/

    // Trio of functions taken from Peter Michaux's article:
    // http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
    function isHostMethod(o, p) {
        var t = typeof o[p];
        return t == FUNCTION || (!!(t == OBJECT && o[p])) || t == "unknown";
    }

    function isHostObject(o, p) {
        return !!(typeof o[p] == OBJECT && o[p]);
    }

    function isHostProperty(o, p) {
        return typeof o[p] != UNDEFINED;
    }

    // Creates a convenience function to save verbose repeated calls to tests functions
    function createMultiplePropertyTest(testFunc) {
        return function(o, props) {
            var i = props.length;
            while (i--) {
                if (!testFunc(o, props[i])) {
                    return false;
                }
            }
            return true;
        };
    }

    // Next trio of functions are a convenience to save verbose repeated calls to previous two functions
    var areHostMethods = createMultiplePropertyTest(isHostMethod);
    var areHostObjects = createMultiplePropertyTest(isHostObject);
    var areHostProperties = createMultiplePropertyTest(isHostProperty);

    function isTextRange(range) {
        return range && areHostMethods(range, textRangeMethods) && areHostProperties(range, textRangeProperties);
    }

    function getBody(doc) {
        return isHostObject(doc, "body") ? doc.body : doc.getElementsByTagName("body")[0];
    }

    var modules = {};

    var isBrowser = (typeof window != UNDEFINED && typeof document != UNDEFINED);

    var util = {
        isHostMethod: isHostMethod,
        isHostObject: isHostObject,
        isHostProperty: isHostProperty,
        areHostMethods: areHostMethods,
        areHostObjects: areHostObjects,
        areHostProperties: areHostProperties,
        isTextRange: isTextRange,
        getBody: getBody
    };

    var api = {
        version: "1.3.0-alpha.20140921",
        initialized: false,
        isBrowser: isBrowser,
        supported: true,
        util: util,
        features: {},
        modules: modules,
        config: {
            alertOnFail: true,
            alertOnWarn: false,
            preferTextRange: false,
            autoInitialize: (typeof rangyAutoInitialize == UNDEFINED) ? true : rangyAutoInitialize
        }
    };

    function consoleLog(msg) {
        if (typeof console != UNDEFINED && isHostMethod(console, "log")) {
            console.log(msg);
        }
    }

    function alertOrLog(msg, shouldAlert) {
        if (isBrowser && shouldAlert) {
            alert(msg);
        } else  {
            consoleLog(msg);
        }
    }

    function fail(reason) {
        api.initialized = true;
        api.supported = false;
        alertOrLog("Rangy is not supported in this environment. Reason: " + reason, api.config.alertOnFail);
    }

    api.fail = fail;

    function warn(msg) {
        alertOrLog("Rangy warning: " + msg, api.config.alertOnWarn);
    }

    api.warn = warn;

    // Add utility extend() method
    var extend;
    if ({}.hasOwnProperty) {
        util.extend = extend = function(obj, props, deep) {
            var o, p;
            for (var i in props) {
                if (props.hasOwnProperty(i)) {
                    o = obj[i];
                    p = props[i];
                    if (deep && o !== null && typeof o == "object" && p !== null && typeof p == "object") {
                        extend(o, p, true);
                    }
                    obj[i] = p;
                }
            }
            // Special case for toString, which does not show up in for...in loops in IE <= 8
            if (props.hasOwnProperty("toString")) {
                obj.toString = props.toString;
            }
            return obj;
        };

        util.createOptions = function(optionsParam, defaults) {
            var options = {};
            extend(options, defaults);
            if (optionsParam) {
                extend(options, optionsParam);
            }
            return options;
        };
    } else {
        fail("hasOwnProperty not supported");
    }
    
    // Test whether we're in a browser and bail out if not
    if (!isBrowser) {
        fail("Rangy can only run in a browser");
    }

    // Test whether Array.prototype.slice can be relied on for NodeLists and use an alternative toArray() if not
    (function() {
        var toArray;

        if (isBrowser) {
            var el = document.createElement("div");
            el.appendChild(document.createElement("span"));
            var slice = [].slice;
            try {
                if (slice.call(el.childNodes, 0)[0].nodeType == 1) {
                    toArray = function(arrayLike) {
                        return slice.call(arrayLike, 0);
                    };
                }
            } catch (e) {}
        }

        if (!toArray) {
            toArray = function(arrayLike) {
                var arr = [];
                for (var i = 0, len = arrayLike.length; i < len; ++i) {
                    arr[i] = arrayLike[i];
                }
                return arr;
            };
        }

        util.toArray = toArray;
    })();

    // Very simple event handler wrapper function that doesn't attempt to solve issues such as "this" handling or
    // normalization of event properties
    var addListener;
    if (isBrowser) {
        if (isHostMethod(document, "addEventListener")) {
            addListener = function(obj, eventType, listener) {
                obj.addEventListener(eventType, listener, false);
            };
        } else if (isHostMethod(document, "attachEvent")) {
            addListener = function(obj, eventType, listener) {
                obj.attachEvent("on" + eventType, listener);
            };
        } else {
            fail("Document does not have required addEventListener or attachEvent method");
        }

        util.addListener = addListener;
    }

    var initListeners = [];

    function getErrorDesc(ex) {
        return ex.message || ex.description || String(ex);
    }

    // Initialization
    function init() {
        if (!isBrowser || api.initialized) {
            return;
        }
        var testRange;
        var implementsDomRange = false, implementsTextRange = false;

        // First, perform basic feature tests

        if (isHostMethod(document, "createRange")) {
            testRange = document.createRange();
            if (areHostMethods(testRange, domRangeMethods) && areHostProperties(testRange, domRangeProperties)) {
                implementsDomRange = true;
            }
        }

        var body = getBody(document);
        if (!body || body.nodeName.toLowerCase() != "body") {
            fail("No body element found");
            return;
        }

        if (body && isHostMethod(body, "createTextRange")) {
            testRange = body.createTextRange();
            if (isTextRange(testRange)) {
                implementsTextRange = true;
            }
        }

        if (!implementsDomRange && !implementsTextRange) {
            fail("Neither Range nor TextRange are available");
            return;
        }

        api.initialized = true;
        api.features = {
            implementsDomRange: implementsDomRange,
            implementsTextRange: implementsTextRange
        };

        // Initialize modules
        var module, errorMessage;
        for (var moduleName in modules) {
            if ( (module = modules[moduleName]) instanceof Module ) {
                module.init(module, api);
            }
        }

        // Call init listeners
        for (var i = 0, len = initListeners.length; i < len; ++i) {
            try {
                initListeners[i](api);
            } catch (ex) {
                errorMessage = "Rangy init listener threw an exception. Continuing. Detail: " + getErrorDesc(ex);
                consoleLog(errorMessage);
            }
        }
    }

    // Allow external scripts to initialize this library in case it's loaded after the document has loaded
    api.init = init;

    // Execute listener immediately if already initialized
    api.addInitListener = function(listener) {
        if (api.initialized) {
            listener(api);
        } else {
            initListeners.push(listener);
        }
    };

    var shimListeners = [];

    api.addShimListener = function(listener) {
        shimListeners.push(listener);
    };

    function shim(win) {
        win = win || window;
        init();

        // Notify listeners
        for (var i = 0, len = shimListeners.length; i < len; ++i) {
            shimListeners[i](win);
        }
    }

    if (isBrowser) {
        api.shim = api.createMissingNativeApi = shim;
    }

    function Module(name, dependencies, initializer) {
        this.name = name;
        this.dependencies = dependencies;
        this.initialized = false;
        this.supported = false;
        this.initializer = initializer;
    }

    Module.prototype = {
        init: function() {
            var requiredModuleNames = this.dependencies || [];
            for (var i = 0, len = requiredModuleNames.length, requiredModule, moduleName; i < len; ++i) {
                moduleName = requiredModuleNames[i];

                requiredModule = modules[moduleName];
                if (!requiredModule || !(requiredModule instanceof Module)) {
                    throw new Error("required module '" + moduleName + "' not found");
                }

                requiredModule.init();

                if (!requiredModule.supported) {
                    throw new Error("required module '" + moduleName + "' not supported");
                }
            }
            
            // Now run initializer
            this.initializer(this);
        },
        
        fail: function(reason) {
            this.initialized = true;
            this.supported = false;
            throw new Error("Module '" + this.name + "' failed to load: " + reason);
        },

        warn: function(msg) {
            api.warn("Module " + this.name + ": " + msg);
        },

        deprecationNotice: function(deprecated, replacement) {
            api.warn("DEPRECATED: " + deprecated + " in module " + this.name + "is deprecated. Please use " +
                replacement + " instead");
        },

        createError: function(msg) {
            return new Error("Error in Rangy " + this.name + " module: " + msg);
        }
    };
    
    function createModule(name, dependencies, initFunc) {
        var newModule = new Module(name, dependencies, function(module) {
            if (!module.initialized) {
                module.initialized = true;
                try {
                    initFunc(api, module);
                    module.supported = true;
                } catch (ex) {
                    var errorMessage = "Module '" + name + "' failed to load: " + getErrorDesc(ex);
                    consoleLog(errorMessage);
                    if (ex.stack) {
                        consoleLog(ex.stack);
                    }
                }
            }
        });
        modules[name] = newModule;
        return newModule;
    }

    api.createModule = function(name) {
        // Allow 2 or 3 arguments (second argument is an optional array of dependencies)
        var initFunc, dependencies;
        if (arguments.length == 2) {
            initFunc = arguments[1];
            dependencies = [];
        } else {
            initFunc = arguments[2];
            dependencies = arguments[1];
        }

        var module = createModule(name, dependencies, initFunc);

        // Initialize the module immediately if the core is already initialized
        if (api.initialized && api.supported) {
            module.init();
        }
    };

    api.createCoreModule = function(name, dependencies, initFunc) {
        createModule(name, dependencies, initFunc);
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    // Ensure rangy.rangePrototype and rangy.selectionPrototype are available immediately

    function RangePrototype() {}
    api.RangePrototype = RangePrototype;
    api.rangePrototype = new RangePrototype();

    function SelectionPrototype() {}
    api.selectionPrototype = new SelectionPrototype();

    /*----------------------------------------------------------------------------------------------------------------*/

    // DOM utility methods used by Rangy
    api.createCoreModule("DomUtil", [], function(api, module) {
        var UNDEF = "undefined";
        var util = api.util;

        // Perform feature tests
        if (!util.areHostMethods(document, ["createDocumentFragment", "createElement", "createTextNode"])) {
            module.fail("document missing a Node creation method");
        }

        if (!util.isHostMethod(document, "getElementsByTagName")) {
            module.fail("document missing getElementsByTagName method");
        }

        var el = document.createElement("div");
        if (!util.areHostMethods(el, ["insertBefore", "appendChild", "cloneNode"] ||
                !util.areHostObjects(el, ["previousSibling", "nextSibling", "childNodes", "parentNode"]))) {
            module.fail("Incomplete Element implementation");
        }

        // innerHTML is required for Range's createContextualFragment method
        if (!util.isHostProperty(el, "innerHTML")) {
            module.fail("Element is missing innerHTML property");
        }

        var textNode = document.createTextNode("test");
        if (!util.areHostMethods(textNode, ["splitText", "deleteData", "insertData", "appendData", "cloneNode"] ||
                !util.areHostObjects(el, ["previousSibling", "nextSibling", "childNodes", "parentNode"]) ||
                !util.areHostProperties(textNode, ["data"]))) {
            module.fail("Incomplete Text Node implementation");
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Removed use of indexOf because of a bizarre bug in Opera that is thrown in one of the Acid3 tests. I haven't been
        // able to replicate it outside of the test. The bug is that indexOf returns -1 when called on an Array that
        // contains just the document as a single element and the value searched for is the document.
        var arrayContains = /*Array.prototype.indexOf ?
            function(arr, val) {
                return arr.indexOf(val) > -1;
            }:*/

            function(arr, val) {
                var i = arr.length;
                while (i--) {
                    if (arr[i] === val) {
                        return true;
                    }
                }
                return false;
            };

        // Opera 11 puts HTML elements in the null namespace, it seems, and IE 7 has undefined namespaceURI
        function isHtmlNamespace(node) {
            var ns;
            return typeof node.namespaceURI == UNDEF || ((ns = node.namespaceURI) === null || ns == "http://www.w3.org/1999/xhtml");
        }

        function parentElement(node) {
            var parent = node.parentNode;
            return (parent.nodeType == 1) ? parent : null;
        }

        function getNodeIndex(node) {
            var i = 0;
            while( (node = node.previousSibling) ) {
                ++i;
            }
            return i;
        }

        function getNodeLength(node) {
            switch (node.nodeType) {
                case 7:
                case 10:
                    return 0;
                case 3:
                case 8:
                    return node.length;
                default:
                    return node.childNodes.length;
            }
        }

        function getCommonAncestor(node1, node2) {
            var ancestors = [], n;
            for (n = node1; n; n = n.parentNode) {
                ancestors.push(n);
            }

            for (n = node2; n; n = n.parentNode) {
                if (arrayContains(ancestors, n)) {
                    return n;
                }
            }

            return null;
        }

        function isAncestorOf(ancestor, descendant, selfIsAncestor) {
            var n = selfIsAncestor ? descendant : descendant.parentNode;
            while (n) {
                if (n === ancestor) {
                    return true;
                } else {
                    n = n.parentNode;
                }
            }
            return false;
        }

        function isOrIsAncestorOf(ancestor, descendant) {
            return isAncestorOf(ancestor, descendant, true);
        }

        function getClosestAncestorIn(node, ancestor, selfIsAncestor) {
            var p, n = selfIsAncestor ? node : node.parentNode;
            while (n) {
                p = n.parentNode;
                if (p === ancestor) {
                    return n;
                }
                n = p;
            }
            return null;
        }

        function isCharacterDataNode(node) {
            var t = node.nodeType;
            return t == 3 || t == 4 || t == 8 ; // Text, CDataSection or Comment
        }

        function isTextOrCommentNode(node) {
            if (!node) {
                return false;
            }
            var t = node.nodeType;
            return t == 3 || t == 8 ; // Text or Comment
        }

        function insertAfter(node, precedingNode) {
            var nextNode = precedingNode.nextSibling, parent = precedingNode.parentNode;
            if (nextNode) {
                parent.insertBefore(node, nextNode);
            } else {
                parent.appendChild(node);
            }
            return node;
        }

        // Note that we cannot use splitText() because it is bugridden in IE 9.
        function splitDataNode(node, index, positionsToPreserve) {
            var newNode = node.cloneNode(false);
            newNode.deleteData(0, index);
            node.deleteData(index, node.length - index);
            insertAfter(newNode, node);

            // Preserve positions
            if (positionsToPreserve) {
                for (var i = 0, position; position = positionsToPreserve[i++]; ) {
                    // Handle case where position was inside the portion of node after the split point
                    if (position.node == node && position.offset > index) {
                        position.node = newNode;
                        position.offset -= index;
                    }
                    // Handle the case where the position is a node offset within node's parent
                    else if (position.node == node.parentNode && position.offset > getNodeIndex(node)) {
                        ++position.offset;
                    }
                }
            }
            return newNode;
        }

        function getDocument(node) {
            if (node.nodeType == 9) {
                return node;
            } else if (typeof node.ownerDocument != UNDEF) {
                return node.ownerDocument;
            } else if (typeof node.document != UNDEF) {
                return node.document;
            } else if (node.parentNode) {
                return getDocument(node.parentNode);
            } else {
                throw module.createError("getDocument: no document found for node");
            }
        }

        function getWindow(node) {
            var doc = getDocument(node);
            if (typeof doc.defaultView != UNDEF) {
                return doc.defaultView;
            } else if (typeof doc.parentWindow != UNDEF) {
                return doc.parentWindow;
            } else {
                throw module.createError("Cannot get a window object for node");
            }
        }

        function getIframeDocument(iframeEl) {
            if (typeof iframeEl.contentDocument != UNDEF) {
                return iframeEl.contentDocument;
            } else if (typeof iframeEl.contentWindow != UNDEF) {
                return iframeEl.contentWindow.document;
            } else {
                throw module.createError("getIframeDocument: No Document object found for iframe element");
            }
        }

        function getIframeWindow(iframeEl) {
            if (typeof iframeEl.contentWindow != UNDEF) {
                return iframeEl.contentWindow;
            } else if (typeof iframeEl.contentDocument != UNDEF) {
                return iframeEl.contentDocument.defaultView;
            } else {
                throw module.createError("getIframeWindow: No Window object found for iframe element");
            }
        }

        // This looks bad. Is it worth it?
        function isWindow(obj) {
            return obj && util.isHostMethod(obj, "setTimeout") && util.isHostObject(obj, "document");
        }

        function getContentDocument(obj, module, methodName) {
            var doc;

            if (!obj) {
                doc = document;
            }

            // Test if a DOM node has been passed and obtain a document object for it if so
            else if (util.isHostProperty(obj, "nodeType")) {
                doc = (obj.nodeType == 1 && obj.tagName.toLowerCase() == "iframe") ?
                    getIframeDocument(obj) : getDocument(obj);
            }

            // Test if the doc parameter appears to be a Window object
            else if (isWindow(obj)) {
                doc = obj.document;
            }

            if (!doc) {
                throw module.createError(methodName + "(): Parameter must be a Window object or DOM node");
            }

            return doc;
        }

        function getRootContainer(node) {
            var parent;
            while ( (parent = node.parentNode) ) {
                node = parent;
            }
            return node;
        }

        function comparePoints(nodeA, offsetA, nodeB, offsetB) {
            // See http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#Level-2-Range-Comparing
            var nodeC, root, childA, childB, n;
            if (nodeA == nodeB) {
                // Case 1: nodes are the same
                return offsetA === offsetB ? 0 : (offsetA < offsetB) ? -1 : 1;
            } else if ( (nodeC = getClosestAncestorIn(nodeB, nodeA, true)) ) {
                // Case 2: node C (container B or an ancestor) is a child node of A
                return offsetA <= getNodeIndex(nodeC) ? -1 : 1;
            } else if ( (nodeC = getClosestAncestorIn(nodeA, nodeB, true)) ) {
                // Case 3: node C (container A or an ancestor) is a child node of B
                return getNodeIndex(nodeC) < offsetB  ? -1 : 1;
            } else {
                root = getCommonAncestor(nodeA, nodeB);
                if (!root) {
                    throw new Error("comparePoints error: nodes have no common ancestor");
                }

                // Case 4: containers are siblings or descendants of siblings
                childA = (nodeA === root) ? root : getClosestAncestorIn(nodeA, root, true);
                childB = (nodeB === root) ? root : getClosestAncestorIn(nodeB, root, true);

                if (childA === childB) {
                    // This shouldn't be possible
                    throw module.createError("comparePoints got to case 4 and childA and childB are the same!");
                } else {
                    n = root.firstChild;
                    while (n) {
                        if (n === childA) {
                            return -1;
                        } else if (n === childB) {
                            return 1;
                        }
                        n = n.nextSibling;
                    }
                }
            }
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Test for IE's crash (IE 6/7) or exception (IE >= 8) when a reference to garbage-collected text node is queried
        var crashyTextNodes = false;

        function isBrokenNode(node) {
            var n;
            try {
                n = node.parentNode;
                return false;
            } catch (e) {
                return true;
            }
        }

        (function() {
            var el = document.createElement("b");
            el.innerHTML = "1";
            var textNode = el.firstChild;
            el.innerHTML = "<br>";
            crashyTextNodes = isBrokenNode(textNode);

            api.features.crashyTextNodes = crashyTextNodes;
        })();

        /*----------------------------------------------------------------------------------------------------------------*/

        function inspectNode(node) {
            if (!node) {
                return "[No node]";
            }
            if (crashyTextNodes && isBrokenNode(node)) {
                return "[Broken node]";
            }
            if (isCharacterDataNode(node)) {
                return '"' + node.data + '"';
            }
            if (node.nodeType == 1) {
                var idAttr = node.id ? ' id="' + node.id + '"' : "";
                return "<" + node.nodeName + idAttr + ">[index:" + getNodeIndex(node) + ",length:" + node.childNodes.length + "][" + (node.innerHTML || "[innerHTML not supported]").slice(0, 25) + "]";
            }
            return node.nodeName;
        }

        function fragmentFromNodeChildren(node) {
            var fragment = getDocument(node).createDocumentFragment(), child;
            while ( (child = node.firstChild) ) {
                fragment.appendChild(child);
            }
            return fragment;
        }

        var getComputedStyleProperty;
        if (typeof window.getComputedStyle != UNDEF) {
            getComputedStyleProperty = function(el, propName) {
                return getWindow(el).getComputedStyle(el, null)[propName];
            };
        } else if (typeof document.documentElement.currentStyle != UNDEF) {
            getComputedStyleProperty = function(el, propName) {
                return el.currentStyle[propName];
            };
        } else {
            module.fail("No means of obtaining computed style properties found");
        }

        function NodeIterator(root) {
            this.root = root;
            this._next = root;
        }

        NodeIterator.prototype = {
            _current: null,

            hasNext: function() {
                return !!this._next;
            },

            next: function() {
                var n = this._current = this._next;
                var child, next;
                if (this._current) {
                    child = n.firstChild;
                    if (child) {
                        this._next = child;
                    } else {
                        next = null;
                        while ((n !== this.root) && !(next = n.nextSibling)) {
                            n = n.parentNode;
                        }
                        this._next = next;
                    }
                }
                return this._current;
            },

            detach: function() {
                this._current = this._next = this.root = null;
            }
        };

        function createIterator(root) {
            return new NodeIterator(root);
        }

        function DomPosition(node, offset) {
            this.node = node;
            this.offset = offset;
        }

        DomPosition.prototype = {
            equals: function(pos) {
                return !!pos && this.node === pos.node && this.offset == pos.offset;
            },

            inspect: function() {
                return "[DomPosition(" + inspectNode(this.node) + ":" + this.offset + ")]";
            },

            toString: function() {
                return this.inspect();
            }
        };

        function DOMException(codeName) {
            this.code = this[codeName];
            this.codeName = codeName;
            this.message = "DOMException: " + this.codeName;
        }

        DOMException.prototype = {
            INDEX_SIZE_ERR: 1,
            HIERARCHY_REQUEST_ERR: 3,
            WRONG_DOCUMENT_ERR: 4,
            NO_MODIFICATION_ALLOWED_ERR: 7,
            NOT_FOUND_ERR: 8,
            NOT_SUPPORTED_ERR: 9,
            INVALID_STATE_ERR: 11,
            INVALID_NODE_TYPE_ERR: 24
        };

        DOMException.prototype.toString = function() {
            return this.message;
        };

        api.dom = {
            arrayContains: arrayContains,
            isHtmlNamespace: isHtmlNamespace,
            parentElement: parentElement,
            getNodeIndex: getNodeIndex,
            getNodeLength: getNodeLength,
            getCommonAncestor: getCommonAncestor,
            isAncestorOf: isAncestorOf,
            isOrIsAncestorOf: isOrIsAncestorOf,
            getClosestAncestorIn: getClosestAncestorIn,
            isCharacterDataNode: isCharacterDataNode,
            isTextOrCommentNode: isTextOrCommentNode,
            insertAfter: insertAfter,
            splitDataNode: splitDataNode,
            getDocument: getDocument,
            getWindow: getWindow,
            getIframeWindow: getIframeWindow,
            getIframeDocument: getIframeDocument,
            getBody: util.getBody,
            isWindow: isWindow,
            getContentDocument: getContentDocument,
            getRootContainer: getRootContainer,
            comparePoints: comparePoints,
            isBrokenNode: isBrokenNode,
            inspectNode: inspectNode,
            getComputedStyleProperty: getComputedStyleProperty,
            fragmentFromNodeChildren: fragmentFromNodeChildren,
            createIterator: createIterator,
            DomPosition: DomPosition
        };

        api.DOMException = DOMException;
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    // Pure JavaScript implementation of DOM Range
    api.createCoreModule("DomRange", ["DomUtil"], function(api, module) {
        var dom = api.dom;
        var util = api.util;
        var DomPosition = dom.DomPosition;
        var DOMException = api.DOMException;

        var isCharacterDataNode = dom.isCharacterDataNode;
        var getNodeIndex = dom.getNodeIndex;
        var isOrIsAncestorOf = dom.isOrIsAncestorOf;
        var getDocument = dom.getDocument;
        var comparePoints = dom.comparePoints;
        var splitDataNode = dom.splitDataNode;
        var getClosestAncestorIn = dom.getClosestAncestorIn;
        var getNodeLength = dom.getNodeLength;
        var arrayContains = dom.arrayContains;
        var getRootContainer = dom.getRootContainer;
        var crashyTextNodes = api.features.crashyTextNodes;

        /*----------------------------------------------------------------------------------------------------------------*/

        // Utility functions

        function isNonTextPartiallySelected(node, range) {
            return (node.nodeType != 3) &&
                   (isOrIsAncestorOf(node, range.startContainer) || isOrIsAncestorOf(node, range.endContainer));
        }

        function getRangeDocument(range) {
            return range.document || getDocument(range.startContainer);
        }

        function getBoundaryBeforeNode(node) {
            return new DomPosition(node.parentNode, getNodeIndex(node));
        }

        function getBoundaryAfterNode(node) {
            return new DomPosition(node.parentNode, getNodeIndex(node) + 1);
        }

        function insertNodeAtPosition(node, n, o) {
            var firstNodeInserted = node.nodeType == 11 ? node.firstChild : node;
            if (isCharacterDataNode(n)) {
                if (o == n.length) {
                    dom.insertAfter(node, n);
                } else {
                    n.parentNode.insertBefore(node, o == 0 ? n : splitDataNode(n, o));
                }
            } else if (o >= n.childNodes.length) {
                n.appendChild(node);
            } else {
                n.insertBefore(node, n.childNodes[o]);
            }
            return firstNodeInserted;
        }

        function rangesIntersect(rangeA, rangeB, touchingIsIntersecting) {
            assertRangeValid(rangeA);
            assertRangeValid(rangeB);

            if (getRangeDocument(rangeB) != getRangeDocument(rangeA)) {
                throw new DOMException("WRONG_DOCUMENT_ERR");
            }

            var startComparison = comparePoints(rangeA.startContainer, rangeA.startOffset, rangeB.endContainer, rangeB.endOffset),
                endComparison = comparePoints(rangeA.endContainer, rangeA.endOffset, rangeB.startContainer, rangeB.startOffset);

            return touchingIsIntersecting ? startComparison <= 0 && endComparison >= 0 : startComparison < 0 && endComparison > 0;
        }

        function cloneSubtree(iterator) {
            var partiallySelected;
            for (var node, frag = getRangeDocument(iterator.range).createDocumentFragment(), subIterator; node = iterator.next(); ) {
                partiallySelected = iterator.isPartiallySelectedSubtree();
                node = node.cloneNode(!partiallySelected);
                if (partiallySelected) {
                    subIterator = iterator.getSubtreeIterator();
                    node.appendChild(cloneSubtree(subIterator));
                    subIterator.detach();
                }

                if (node.nodeType == 10) { // DocumentType
                    throw new DOMException("HIERARCHY_REQUEST_ERR");
                }
                frag.appendChild(node);
            }
            return frag;
        }

        function iterateSubtree(rangeIterator, func, iteratorState) {
            var it, n;
            iteratorState = iteratorState || { stop: false };
            for (var node, subRangeIterator; node = rangeIterator.next(); ) {
                if (rangeIterator.isPartiallySelectedSubtree()) {
                    if (func(node) === false) {
                        iteratorState.stop = true;
                        return;
                    } else {
                        // The node is partially selected by the Range, so we can use a new RangeIterator on the portion of
                        // the node selected by the Range.
                        subRangeIterator = rangeIterator.getSubtreeIterator();
                        iterateSubtree(subRangeIterator, func, iteratorState);
                        subRangeIterator.detach();
                        if (iteratorState.stop) {
                            return;
                        }
                    }
                } else {
                    // The whole node is selected, so we can use efficient DOM iteration to iterate over the node and its
                    // descendants
                    it = dom.createIterator(node);
                    while ( (n = it.next()) ) {
                        if (func(n) === false) {
                            iteratorState.stop = true;
                            return;
                        }
                    }
                }
            }
        }

        function deleteSubtree(iterator) {
            var subIterator;
            while (iterator.next()) {
                if (iterator.isPartiallySelectedSubtree()) {
                    subIterator = iterator.getSubtreeIterator();
                    deleteSubtree(subIterator);
                    subIterator.detach();
                } else {
                    iterator.remove();
                }
            }
        }

        function extractSubtree(iterator) {
            for (var node, frag = getRangeDocument(iterator.range).createDocumentFragment(), subIterator; node = iterator.next(); ) {

                if (iterator.isPartiallySelectedSubtree()) {
                    node = node.cloneNode(false);
                    subIterator = iterator.getSubtreeIterator();
                    node.appendChild(extractSubtree(subIterator));
                    subIterator.detach();
                } else {
                    iterator.remove();
                }
                if (node.nodeType == 10) { // DocumentType
                    throw new DOMException("HIERARCHY_REQUEST_ERR");
                }
                frag.appendChild(node);
            }
            return frag;
        }

        function getNodesInRange(range, nodeTypes, filter) {
            var filterNodeTypes = !!(nodeTypes && nodeTypes.length), regex;
            var filterExists = !!filter;
            if (filterNodeTypes) {
                regex = new RegExp("^(" + nodeTypes.join("|") + ")$");
            }

            var nodes = [];
            iterateSubtree(new RangeIterator(range, false), function(node) {
                if (filterNodeTypes && !regex.test(node.nodeType)) {
                    return;
                }
                if (filterExists && !filter(node)) {
                    return;
                }
                // Don't include a boundary container if it is a character data node and the range does not contain any
                // of its character data. See issue 190.
                var sc = range.startContainer;
                if (node == sc && isCharacterDataNode(sc) && range.startOffset == sc.length) {
                    return;
                }

                var ec = range.endContainer;
                if (node == ec && isCharacterDataNode(ec) && range.endOffset == 0) {
                    return;
                }

                nodes.push(node);
            });
            return nodes;
        }

        function inspect(range) {
            var name = (typeof range.getName == "undefined") ? "Range" : range.getName();
            return "[" + name + "(" + dom.inspectNode(range.startContainer) + ":" + range.startOffset + ", " +
                    dom.inspectNode(range.endContainer) + ":" + range.endOffset + ")]";
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // RangeIterator code partially borrows from IERange by Tim Ryan (http://github.com/timcameronryan/IERange)

        function RangeIterator(range, clonePartiallySelectedTextNodes) {
            this.range = range;
            this.clonePartiallySelectedTextNodes = clonePartiallySelectedTextNodes;


            if (!range.collapsed) {
                this.sc = range.startContainer;
                this.so = range.startOffset;
                this.ec = range.endContainer;
                this.eo = range.endOffset;
                var root = range.commonAncestorContainer;

                if (this.sc === this.ec && isCharacterDataNode(this.sc)) {
                    this.isSingleCharacterDataNode = true;
                    this._first = this._last = this._next = this.sc;
                } else {
                    this._first = this._next = (this.sc === root && !isCharacterDataNode(this.sc)) ?
                        this.sc.childNodes[this.so] : getClosestAncestorIn(this.sc, root, true);
                    this._last = (this.ec === root && !isCharacterDataNode(this.ec)) ?
                        this.ec.childNodes[this.eo - 1] : getClosestAncestorIn(this.ec, root, true);
                }
            }
        }

        RangeIterator.prototype = {
            _current: null,
            _next: null,
            _first: null,
            _last: null,
            isSingleCharacterDataNode: false,

            reset: function() {
                this._current = null;
                this._next = this._first;
            },

            hasNext: function() {
                return !!this._next;
            },

            next: function() {
                // Move to next node
                var current = this._current = this._next;
                if (current) {
                    this._next = (current !== this._last) ? current.nextSibling : null;

                    // Check for partially selected text nodes
                    if (isCharacterDataNode(current) && this.clonePartiallySelectedTextNodes) {
                        if (current === this.ec) {
                            (current = current.cloneNode(true)).deleteData(this.eo, current.length - this.eo);
                        }
                        if (this._current === this.sc) {
                            (current = current.cloneNode(true)).deleteData(0, this.so);
                        }
                    }
                }

                return current;
            },

            remove: function() {
                var current = this._current, start, end;

                if (isCharacterDataNode(current) && (current === this.sc || current === this.ec)) {
                    start = (current === this.sc) ? this.so : 0;
                    end = (current === this.ec) ? this.eo : current.length;
                    if (start != end) {
                        current.deleteData(start, end - start);
                    }
                } else {
                    if (current.parentNode) {
                        current.parentNode.removeChild(current);
                    } else {
                    }
                }
            },

            // Checks if the current node is partially selected
            isPartiallySelectedSubtree: function() {
                var current = this._current;
                return isNonTextPartiallySelected(current, this.range);
            },

            getSubtreeIterator: function() {
                var subRange;
                if (this.isSingleCharacterDataNode) {
                    subRange = this.range.cloneRange();
                    subRange.collapse(false);
                } else {
                    subRange = new Range(getRangeDocument(this.range));
                    var current = this._current;
                    var startContainer = current, startOffset = 0, endContainer = current, endOffset = getNodeLength(current);

                    if (isOrIsAncestorOf(current, this.sc)) {
                        startContainer = this.sc;
                        startOffset = this.so;
                    }
                    if (isOrIsAncestorOf(current, this.ec)) {
                        endContainer = this.ec;
                        endOffset = this.eo;
                    }

                    updateBoundaries(subRange, startContainer, startOffset, endContainer, endOffset);
                }
                return new RangeIterator(subRange, this.clonePartiallySelectedTextNodes);
            },

            detach: function() {
                this.range = this._current = this._next = this._first = this._last = this.sc = this.so = this.ec = this.eo = null;
            }
        };

        /*----------------------------------------------------------------------------------------------------------------*/

        var beforeAfterNodeTypes = [1, 3, 4, 5, 7, 8, 10];
        var rootContainerNodeTypes = [2, 9, 11];
        var readonlyNodeTypes = [5, 6, 10, 12];
        var insertableNodeTypes = [1, 3, 4, 5, 7, 8, 10, 11];
        var surroundNodeTypes = [1, 3, 4, 5, 7, 8];

        function createAncestorFinder(nodeTypes) {
            return function(node, selfIsAncestor) {
                var t, n = selfIsAncestor ? node : node.parentNode;
                while (n) {
                    t = n.nodeType;
                    if (arrayContains(nodeTypes, t)) {
                        return n;
                    }
                    n = n.parentNode;
                }
                return null;
            };
        }

        var getDocumentOrFragmentContainer = createAncestorFinder( [9, 11] );
        var getReadonlyAncestor = createAncestorFinder(readonlyNodeTypes);
        var getDocTypeNotationEntityAncestor = createAncestorFinder( [6, 10, 12] );

        function assertNoDocTypeNotationEntityAncestor(node, allowSelf) {
            if (getDocTypeNotationEntityAncestor(node, allowSelf)) {
                throw new DOMException("INVALID_NODE_TYPE_ERR");
            }
        }

        function assertValidNodeType(node, invalidTypes) {
            if (!arrayContains(invalidTypes, node.nodeType)) {
                throw new DOMException("INVALID_NODE_TYPE_ERR");
            }
        }

        function assertValidOffset(node, offset) {
            if (offset < 0 || offset > (isCharacterDataNode(node) ? node.length : node.childNodes.length)) {
                throw new DOMException("INDEX_SIZE_ERR");
            }
        }

        function assertSameDocumentOrFragment(node1, node2) {
            if (getDocumentOrFragmentContainer(node1, true) !== getDocumentOrFragmentContainer(node2, true)) {
                throw new DOMException("WRONG_DOCUMENT_ERR");
            }
        }

        function assertNodeNotReadOnly(node) {
            if (getReadonlyAncestor(node, true)) {
                throw new DOMException("NO_MODIFICATION_ALLOWED_ERR");
            }
        }

        function assertNode(node, codeName) {
            if (!node) {
                throw new DOMException(codeName);
            }
        }

        function isOrphan(node) {
            return (crashyTextNodes && dom.isBrokenNode(node)) ||
                !arrayContains(rootContainerNodeTypes, node.nodeType) && !getDocumentOrFragmentContainer(node, true);
        }

        function isValidOffset(node, offset) {
            return offset <= (isCharacterDataNode(node) ? node.length : node.childNodes.length);
        }

        function isRangeValid(range) {
            return (!!range.startContainer && !!range.endContainer &&
                    !isOrphan(range.startContainer) &&
                    !isOrphan(range.endContainer) &&
                    isValidOffset(range.startContainer, range.startOffset) &&
                    isValidOffset(range.endContainer, range.endOffset));
        }

        function assertRangeValid(range) {
            if (!isRangeValid(range)) {
                throw new Error("Range error: Range is no longer valid after DOM mutation (" + range.inspect() + ")");
            }
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Test the browser's innerHTML support to decide how to implement createContextualFragment
        var styleEl = document.createElement("style");
        var htmlParsingConforms = false;
        try {
            styleEl.innerHTML = "<b>x</b>";
            htmlParsingConforms = (styleEl.firstChild.nodeType == 3); // Opera incorrectly creates an element node
        } catch (e) {
            // IE 6 and 7 throw
        }

        api.features.htmlParsingConforms = htmlParsingConforms;

        var createContextualFragment = htmlParsingConforms ?

            // Implementation as per HTML parsing spec, trusting in the browser's implementation of innerHTML. See
            // discussion and base code for this implementation at issue 67.
            // Spec: http://html5.org/specs/dom-parsing.html#extensions-to-the-range-interface
            // Thanks to Aleks Williams.
            function(fragmentStr) {
                // "Let node the context object's start's node."
                var node = this.startContainer;
                var doc = getDocument(node);

                // "If the context object's start's node is null, raise an INVALID_STATE_ERR
                // exception and abort these steps."
                if (!node) {
                    throw new DOMException("INVALID_STATE_ERR");
                }

                // "Let element be as follows, depending on node's interface:"
                // Document, Document Fragment: null
                var el = null;

                // "Element: node"
                if (node.nodeType == 1) {
                    el = node;

                // "Text, Comment: node's parentElement"
                } else if (isCharacterDataNode(node)) {
                    el = dom.parentElement(node);
                }

                // "If either element is null or element's ownerDocument is an HTML document
                // and element's local name is "html" and element's namespace is the HTML
                // namespace"
                if (el === null || (
                    el.nodeName == "HTML" &&
                    dom.isHtmlNamespace(getDocument(el).documentElement) &&
                    dom.isHtmlNamespace(el)
                )) {

                // "let element be a new Element with "body" as its local name and the HTML
                // namespace as its namespace.""
                    el = doc.createElement("body");
                } else {
                    el = el.cloneNode(false);
                }

                // "If the node's document is an HTML document: Invoke the HTML fragment parsing algorithm."
                // "If the node's document is an XML document: Invoke the XML fragment parsing algorithm."
                // "In either case, the algorithm must be invoked with fragment as the input
                // and element as the context element."
                el.innerHTML = fragmentStr;

                // "If this raises an exception, then abort these steps. Otherwise, let new
                // children be the nodes returned."

                // "Let fragment be a new DocumentFragment."
                // "Append all new children to fragment."
                // "Return fragment."
                return dom.fragmentFromNodeChildren(el);
            } :

            // In this case, innerHTML cannot be trusted, so fall back to a simpler, non-conformant implementation that
            // previous versions of Rangy used (with the exception of using a body element rather than a div)
            function(fragmentStr) {
                var doc = getRangeDocument(this);
                var el = doc.createElement("body");
                el.innerHTML = fragmentStr;

                return dom.fragmentFromNodeChildren(el);
            };

        function splitRangeBoundaries(range, positionsToPreserve) {
            assertRangeValid(range);

            var sc = range.startContainer, so = range.startOffset, ec = range.endContainer, eo = range.endOffset;
            var startEndSame = (sc === ec);

            if (isCharacterDataNode(ec) && eo > 0 && eo < ec.length) {
                splitDataNode(ec, eo, positionsToPreserve);
            }

            if (isCharacterDataNode(sc) && so > 0 && so < sc.length) {
                sc = splitDataNode(sc, so, positionsToPreserve);
                if (startEndSame) {
                    eo -= so;
                    ec = sc;
                } else if (ec == sc.parentNode && eo >= getNodeIndex(sc)) {
                    eo++;
                }
                so = 0;
            }
            range.setStartAndEnd(sc, so, ec, eo);
        }
        
        function rangeToHtml(range) {
            assertRangeValid(range);
            var container = range.commonAncestorContainer.parentNode.cloneNode(false);
            container.appendChild( range.cloneContents() );
            return container.innerHTML;
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        var rangeProperties = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed",
            "commonAncestorContainer"];

        var s2s = 0, s2e = 1, e2e = 2, e2s = 3;
        var n_b = 0, n_a = 1, n_b_a = 2, n_i = 3;

        util.extend(api.rangePrototype, {
            compareBoundaryPoints: function(how, range) {
                assertRangeValid(this);
                assertSameDocumentOrFragment(this.startContainer, range.startContainer);

                var nodeA, offsetA, nodeB, offsetB;
                var prefixA = (how == e2s || how == s2s) ? "start" : "end";
                var prefixB = (how == s2e || how == s2s) ? "start" : "end";
                nodeA = this[prefixA + "Container"];
                offsetA = this[prefixA + "Offset"];
                nodeB = range[prefixB + "Container"];
                offsetB = range[prefixB + "Offset"];
                return comparePoints(nodeA, offsetA, nodeB, offsetB);
            },

            insertNode: function(node) {
                assertRangeValid(this);
                assertValidNodeType(node, insertableNodeTypes);
                assertNodeNotReadOnly(this.startContainer);

                if (isOrIsAncestorOf(node, this.startContainer)) {
                    throw new DOMException("HIERARCHY_REQUEST_ERR");
                }

                // No check for whether the container of the start of the Range is of a type that does not allow
                // children of the type of node: the browser's DOM implementation should do this for us when we attempt
                // to add the node

                var firstNodeInserted = insertNodeAtPosition(node, this.startContainer, this.startOffset);
                this.setStartBefore(firstNodeInserted);
            },

            cloneContents: function() {
                assertRangeValid(this);

                var clone, frag;
                if (this.collapsed) {
                    return getRangeDocument(this).createDocumentFragment();
                } else {
                    if (this.startContainer === this.endContainer && isCharacterDataNode(this.startContainer)) {
                        clone = this.startContainer.cloneNode(true);
                        clone.data = clone.data.slice(this.startOffset, this.endOffset);
                        frag = getRangeDocument(this).createDocumentFragment();
                        frag.appendChild(clone);
                        return frag;
                    } else {
                        var iterator = new RangeIterator(this, true);
                        clone = cloneSubtree(iterator);
                        iterator.detach();
                    }
                    return clone;
                }
            },

            canSurroundContents: function() {
                assertRangeValid(this);
                assertNodeNotReadOnly(this.startContainer);
                assertNodeNotReadOnly(this.endContainer);

                // Check if the contents can be surrounded. Specifically, this means whether the range partially selects
                // no non-text nodes.
                var iterator = new RangeIterator(this, true);
                var boundariesInvalid = (iterator._first && (isNonTextPartiallySelected(iterator._first, this)) ||
                        (iterator._last && isNonTextPartiallySelected(iterator._last, this)));
                iterator.detach();
                return !boundariesInvalid;
            },

            surroundContents: function(node) {
                assertValidNodeType(node, surroundNodeTypes);

                if (!this.canSurroundContents()) {
                    throw new DOMException("INVALID_STATE_ERR");
                }

                // Extract the contents
                var content = this.extractContents();

                // Clear the children of the node
                if (node.hasChildNodes()) {
                    while (node.lastChild) {
                        node.removeChild(node.lastChild);
                    }
                }

                // Insert the new node and add the extracted contents
                insertNodeAtPosition(node, this.startContainer, this.startOffset);
                node.appendChild(content);

                this.selectNode(node);
            },

            cloneRange: function() {
                assertRangeValid(this);
                var range = new Range(getRangeDocument(this));
                var i = rangeProperties.length, prop;
                while (i--) {
                    prop = rangeProperties[i];
                    range[prop] = this[prop];
                }
                return range;
            },

            toString: function() {
                assertRangeValid(this);
                var sc = this.startContainer;
                if (sc === this.endContainer && isCharacterDataNode(sc)) {
                    return (sc.nodeType == 3 || sc.nodeType == 4) ? sc.data.slice(this.startOffset, this.endOffset) : "";
                } else {
                    var textParts = [], iterator = new RangeIterator(this, true);
                    iterateSubtree(iterator, function(node) {
                        // Accept only text or CDATA nodes, not comments
                        if (node.nodeType == 3 || node.nodeType == 4) {
                            textParts.push(node.data);
                        }
                    });
                    iterator.detach();
                    return textParts.join("");
                }
            },

            // The methods below are all non-standard. The following batch were introduced by Mozilla but have since
            // been removed from Mozilla.

            compareNode: function(node) {
                assertRangeValid(this);

                var parent = node.parentNode;
                var nodeIndex = getNodeIndex(node);

                if (!parent) {
                    throw new DOMException("NOT_FOUND_ERR");
                }

                var startComparison = this.comparePoint(parent, nodeIndex),
                    endComparison = this.comparePoint(parent, nodeIndex + 1);

                if (startComparison < 0) { // Node starts before
                    return (endComparison > 0) ? n_b_a : n_b;
                } else {
                    return (endComparison > 0) ? n_a : n_i;
                }
            },

            comparePoint: function(node, offset) {
                assertRangeValid(this);
                assertNode(node, "HIERARCHY_REQUEST_ERR");
                assertSameDocumentOrFragment(node, this.startContainer);

                if (comparePoints(node, offset, this.startContainer, this.startOffset) < 0) {
                    return -1;
                } else if (comparePoints(node, offset, this.endContainer, this.endOffset) > 0) {
                    return 1;
                }
                return 0;
            },

            createContextualFragment: createContextualFragment,

            toHtml: function() {
                return rangeToHtml(this);
            },

            // touchingIsIntersecting determines whether this method considers a node that borders a range intersects
            // with it (as in WebKit) or not (as in Gecko pre-1.9, and the default)
            intersectsNode: function(node, touchingIsIntersecting) {
                assertRangeValid(this);
                assertNode(node, "NOT_FOUND_ERR");
                if (getDocument(node) !== getRangeDocument(this)) {
                    return false;
                }

                var parent = node.parentNode, offset = getNodeIndex(node);
                assertNode(parent, "NOT_FOUND_ERR");

                var startComparison = comparePoints(parent, offset, this.endContainer, this.endOffset),
                    endComparison = comparePoints(parent, offset + 1, this.startContainer, this.startOffset);

                return touchingIsIntersecting ? startComparison <= 0 && endComparison >= 0 : startComparison < 0 && endComparison > 0;
            },

            isPointInRange: function(node, offset) {
                assertRangeValid(this);
                assertNode(node, "HIERARCHY_REQUEST_ERR");
                assertSameDocumentOrFragment(node, this.startContainer);

                return (comparePoints(node, offset, this.startContainer, this.startOffset) >= 0) &&
                       (comparePoints(node, offset, this.endContainer, this.endOffset) <= 0);
            },

            // The methods below are non-standard and invented by me.

            // Sharing a boundary start-to-end or end-to-start does not count as intersection.
            intersectsRange: function(range) {
                return rangesIntersect(this, range, false);
            },

            // Sharing a boundary start-to-end or end-to-start does count as intersection.
            intersectsOrTouchesRange: function(range) {
                return rangesIntersect(this, range, true);
            },

            intersection: function(range) {
                if (this.intersectsRange(range)) {
                    var startComparison = comparePoints(this.startContainer, this.startOffset, range.startContainer, range.startOffset),
                        endComparison = comparePoints(this.endContainer, this.endOffset, range.endContainer, range.endOffset);

                    var intersectionRange = this.cloneRange();
                    if (startComparison == -1) {
                        intersectionRange.setStart(range.startContainer, range.startOffset);
                    }
                    if (endComparison == 1) {
                        intersectionRange.setEnd(range.endContainer, range.endOffset);
                    }
                    return intersectionRange;
                }
                return null;
            },

            union: function(range) {
                if (this.intersectsOrTouchesRange(range)) {
                    var unionRange = this.cloneRange();
                    if (comparePoints(range.startContainer, range.startOffset, this.startContainer, this.startOffset) == -1) {
                        unionRange.setStart(range.startContainer, range.startOffset);
                    }
                    if (comparePoints(range.endContainer, range.endOffset, this.endContainer, this.endOffset) == 1) {
                        unionRange.setEnd(range.endContainer, range.endOffset);
                    }
                    return unionRange;
                } else {
                    throw new DOMException("Ranges do not intersect");
                }
            },

            containsNode: function(node, allowPartial) {
                if (allowPartial) {
                    return this.intersectsNode(node, false);
                } else {
                    return this.compareNode(node) == n_i;
                }
            },

            containsNodeContents: function(node) {
                return this.comparePoint(node, 0) >= 0 && this.comparePoint(node, getNodeLength(node)) <= 0;
            },

            containsRange: function(range) {
                var intersection = this.intersection(range);
                return intersection !== null && range.equals(intersection);
            },

            containsNodeText: function(node) {
                var nodeRange = this.cloneRange();
                nodeRange.selectNode(node);
                var textNodes = nodeRange.getNodes([3]);
                if (textNodes.length > 0) {
                    nodeRange.setStart(textNodes[0], 0);
                    var lastTextNode = textNodes.pop();
                    nodeRange.setEnd(lastTextNode, lastTextNode.length);
                    return this.containsRange(nodeRange);
                } else {
                    return this.containsNodeContents(node);
                }
            },

            getNodes: function(nodeTypes, filter) {
                assertRangeValid(this);
                return getNodesInRange(this, nodeTypes, filter);
            },

            getDocument: function() {
                return getRangeDocument(this);
            },

            collapseBefore: function(node) {
                this.setEndBefore(node);
                this.collapse(false);
            },

            collapseAfter: function(node) {
                this.setStartAfter(node);
                this.collapse(true);
            },
            
            getBookmark: function(containerNode) {
                var doc = getRangeDocument(this);
                var preSelectionRange = api.createRange(doc);
                containerNode = containerNode || dom.getBody(doc);
                preSelectionRange.selectNodeContents(containerNode);
                var range = this.intersection(preSelectionRange);
                var start = 0, end = 0;
                if (range) {
                    preSelectionRange.setEnd(range.startContainer, range.startOffset);
                    start = preSelectionRange.toString().length;
                    end = start + range.toString().length;
                }

                return {
                    start: start,
                    end: end,
                    containerNode: containerNode
                };
            },
            
            moveToBookmark: function(bookmark) {
                var containerNode = bookmark.containerNode;
                var charIndex = 0;
                this.setStart(containerNode, 0);
                this.collapse(true);
                var nodeStack = [containerNode], node, foundStart = false, stop = false;
                var nextCharIndex, i, childNodes;

                while (!stop && (node = nodeStack.pop())) {
                    if (node.nodeType == 3) {
                        nextCharIndex = charIndex + node.length;
                        if (!foundStart && bookmark.start >= charIndex && bookmark.start <= nextCharIndex) {
                            this.setStart(node, bookmark.start - charIndex);
                            foundStart = true;
                        }
                        if (foundStart && bookmark.end >= charIndex && bookmark.end <= nextCharIndex) {
                            this.setEnd(node, bookmark.end - charIndex);
                            stop = true;
                        }
                        charIndex = nextCharIndex;
                    } else {
                        childNodes = node.childNodes;
                        i = childNodes.length;
                        while (i--) {
                            nodeStack.push(childNodes[i]);
                        }
                    }
                }
            },

            getName: function() {
                return "DomRange";
            },

            equals: function(range) {
                return Range.rangesEqual(this, range);
            },

            isValid: function() {
                return isRangeValid(this);
            },
            
            inspect: function() {
                return inspect(this);
            },
            
            detach: function() {
                // In DOM4, detach() is now a no-op.
            }
        });

        function copyComparisonConstantsToObject(obj) {
            obj.START_TO_START = s2s;
            obj.START_TO_END = s2e;
            obj.END_TO_END = e2e;
            obj.END_TO_START = e2s;

            obj.NODE_BEFORE = n_b;
            obj.NODE_AFTER = n_a;
            obj.NODE_BEFORE_AND_AFTER = n_b_a;
            obj.NODE_INSIDE = n_i;
        }

        function copyComparisonConstants(constructor) {
            copyComparisonConstantsToObject(constructor);
            copyComparisonConstantsToObject(constructor.prototype);
        }

        function createRangeContentRemover(remover, boundaryUpdater) {
            return function() {
                assertRangeValid(this);

                var sc = this.startContainer, so = this.startOffset, root = this.commonAncestorContainer;

                var iterator = new RangeIterator(this, true);

                // Work out where to position the range after content removal
                var node, boundary;
                if (sc !== root) {
                    node = getClosestAncestorIn(sc, root, true);
                    boundary = getBoundaryAfterNode(node);
                    sc = boundary.node;
                    so = boundary.offset;
                }

                // Check none of the range is read-only
                iterateSubtree(iterator, assertNodeNotReadOnly);

                iterator.reset();

                // Remove the content
                var returnValue = remover(iterator);
                iterator.detach();

                // Move to the new position
                boundaryUpdater(this, sc, so, sc, so);

                return returnValue;
            };
        }

        function createPrototypeRange(constructor, boundaryUpdater) {
            function createBeforeAfterNodeSetter(isBefore, isStart) {
                return function(node) {
                    assertValidNodeType(node, beforeAfterNodeTypes);
                    assertValidNodeType(getRootContainer(node), rootContainerNodeTypes);

                    var boundary = (isBefore ? getBoundaryBeforeNode : getBoundaryAfterNode)(node);
                    (isStart ? setRangeStart : setRangeEnd)(this, boundary.node, boundary.offset);
                };
            }

            function setRangeStart(range, node, offset) {
                var ec = range.endContainer, eo = range.endOffset;
                if (node !== range.startContainer || offset !== range.startOffset) {
                    // Check the root containers of the range and the new boundary, and also check whether the new boundary
                    // is after the current end. In either case, collapse the range to the new position
                    if (getRootContainer(node) != getRootContainer(ec) || comparePoints(node, offset, ec, eo) == 1) {
                        ec = node;
                        eo = offset;
                    }
                    boundaryUpdater(range, node, offset, ec, eo);
                }
            }

            function setRangeEnd(range, node, offset) {
                var sc = range.startContainer, so = range.startOffset;
                if (node !== range.endContainer || offset !== range.endOffset) {
                    // Check the root containers of the range and the new boundary, and also check whether the new boundary
                    // is after the current end. In either case, collapse the range to the new position
                    if (getRootContainer(node) != getRootContainer(sc) || comparePoints(node, offset, sc, so) == -1) {
                        sc = node;
                        so = offset;
                    }
                    boundaryUpdater(range, sc, so, node, offset);
                }
            }

            // Set up inheritance
            var F = function() {};
            F.prototype = api.rangePrototype;
            constructor.prototype = new F();

            util.extend(constructor.prototype, {
                setStart: function(node, offset) {
                    assertNoDocTypeNotationEntityAncestor(node, true);
                    assertValidOffset(node, offset);

                    setRangeStart(this, node, offset);
                },

                setEnd: function(node, offset) {
                    assertNoDocTypeNotationEntityAncestor(node, true);
                    assertValidOffset(node, offset);

                    setRangeEnd(this, node, offset);
                },

                /**
                 * Convenience method to set a range's start and end boundaries. Overloaded as follows:
                 * - Two parameters (node, offset) creates a collapsed range at that position
                 * - Three parameters (node, startOffset, endOffset) creates a range contained with node starting at
                 *   startOffset and ending at endOffset
                 * - Four parameters (startNode, startOffset, endNode, endOffset) creates a range starting at startOffset in
                 *   startNode and ending at endOffset in endNode
                 */
                setStartAndEnd: function() {
                    var args = arguments;
                    var sc = args[0], so = args[1], ec = sc, eo = so;

                    switch (args.length) {
                        case 3:
                            eo = args[2];
                            break;
                        case 4:
                            ec = args[2];
                            eo = args[3];
                            break;
                    }

                    boundaryUpdater(this, sc, so, ec, eo);
                },
                
                setBoundary: function(node, offset, isStart) {
                    this["set" + (isStart ? "Start" : "End")](node, offset);
                },

                setStartBefore: createBeforeAfterNodeSetter(true, true),
                setStartAfter: createBeforeAfterNodeSetter(false, true),
                setEndBefore: createBeforeAfterNodeSetter(true, false),
                setEndAfter: createBeforeAfterNodeSetter(false, false),

                collapse: function(isStart) {
                    assertRangeValid(this);
                    if (isStart) {
                        boundaryUpdater(this, this.startContainer, this.startOffset, this.startContainer, this.startOffset);
                    } else {
                        boundaryUpdater(this, this.endContainer, this.endOffset, this.endContainer, this.endOffset);
                    }
                },

                selectNodeContents: function(node) {
                    assertNoDocTypeNotationEntityAncestor(node, true);

                    boundaryUpdater(this, node, 0, node, getNodeLength(node));
                },

                selectNode: function(node) {
                    assertNoDocTypeNotationEntityAncestor(node, false);
                    assertValidNodeType(node, beforeAfterNodeTypes);

                    var start = getBoundaryBeforeNode(node), end = getBoundaryAfterNode(node);
                    boundaryUpdater(this, start.node, start.offset, end.node, end.offset);
                },

                extractContents: createRangeContentRemover(extractSubtree, boundaryUpdater),

                deleteContents: createRangeContentRemover(deleteSubtree, boundaryUpdater),

                canSurroundContents: function() {
                    assertRangeValid(this);
                    assertNodeNotReadOnly(this.startContainer);
                    assertNodeNotReadOnly(this.endContainer);

                    // Check if the contents can be surrounded. Specifically, this means whether the range partially selects
                    // no non-text nodes.
                    var iterator = new RangeIterator(this, true);
                    var boundariesInvalid = (iterator._first && isNonTextPartiallySelected(iterator._first, this) ||
                            (iterator._last && isNonTextPartiallySelected(iterator._last, this)));
                    iterator.detach();
                    return !boundariesInvalid;
                },

                splitBoundaries: function() {
                    splitRangeBoundaries(this);
                },

                splitBoundariesPreservingPositions: function(positionsToPreserve) {
                    splitRangeBoundaries(this, positionsToPreserve);
                },

                normalizeBoundaries: function() {
                    assertRangeValid(this);

                    var sc = this.startContainer, so = this.startOffset, ec = this.endContainer, eo = this.endOffset;

                    var mergeForward = function(node) {
                        var sibling = node.nextSibling;
                        if (sibling && sibling.nodeType == node.nodeType) {
                            ec = node;
                            eo = node.length;
                            node.appendData(sibling.data);
                            sibling.parentNode.removeChild(sibling);
                        }
                    };

                    var mergeBackward = function(node) {
                        var sibling = node.previousSibling;
                        if (sibling && sibling.nodeType == node.nodeType) {
                            sc = node;
                            var nodeLength = node.length;
                            so = sibling.length;
                            node.insertData(0, sibling.data);
                            sibling.parentNode.removeChild(sibling);
                            if (sc == ec) {
                                eo += so;
                                ec = sc;
                            } else if (ec == node.parentNode) {
                                var nodeIndex = getNodeIndex(node);
                                if (eo == nodeIndex) {
                                    ec = node;
                                    eo = nodeLength;
                                } else if (eo > nodeIndex) {
                                    eo--;
                                }
                            }
                        }
                    };

                    var normalizeStart = true;

                    if (isCharacterDataNode(ec)) {
                        if (ec.length == eo) {
                            mergeForward(ec);
                        }
                    } else {
                        if (eo > 0) {
                            var endNode = ec.childNodes[eo - 1];
                            if (endNode && isCharacterDataNode(endNode)) {
                                mergeForward(endNode);
                            }
                        }
                        normalizeStart = !this.collapsed;
                    }

                    if (normalizeStart) {
                        if (isCharacterDataNode(sc)) {
                            if (so == 0) {
                                mergeBackward(sc);
                            }
                        } else {
                            if (so < sc.childNodes.length) {
                                var startNode = sc.childNodes[so];
                                if (startNode && isCharacterDataNode(startNode)) {
                                    mergeBackward(startNode);
                                }
                            }
                        }
                    } else {
                        sc = ec;
                        so = eo;
                    }

                    boundaryUpdater(this, sc, so, ec, eo);
                },

                collapseToPoint: function(node, offset) {
                    assertNoDocTypeNotationEntityAncestor(node, true);
                    assertValidOffset(node, offset);
                    this.setStartAndEnd(node, offset);
                }
            });

            copyComparisonConstants(constructor);
        }

        /*----------------------------------------------------------------------------------------------------------------*/

        // Updates commonAncestorContainer and collapsed after boundary change
        function updateCollapsedAndCommonAncestor(range) {
            range.collapsed = (range.startContainer === range.endContainer && range.startOffset === range.endOffset);
            range.commonAncestorContainer = range.collapsed ?
                range.startContainer : dom.getCommonAncestor(range.startContainer, range.endContainer);
        }

        function updateBoundaries(range, startContainer, startOffset, endContainer, endOffset) {
            range.startContainer = startContainer;
            range.startOffset = startOffset;
            range.endContainer = endContainer;
            range.endOffset = endOffset;
            range.document = dom.getDocument(startContainer);

            updateCollapsedAndCommonAncestor(range);
        }

        function Range(doc) {
            this.startContainer = doc;
            this.startOffset = 0;
            this.endContainer = doc;
            this.endOffset = 0;
            this.document = doc;
            updateCollapsedAndCommonAncestor(this);
        }

        createPrototypeRange(Range, updateBoundaries);

        util.extend(Range, {
            rangeProperties: rangeProperties,
            RangeIterator: RangeIterator,
            copyComparisonConstants: copyComparisonConstants,
            createPrototypeRange: createPrototypeRange,
            inspect: inspect,
            toHtml: rangeToHtml,
            getRangeDocument: getRangeDocument,
            rangesEqual: function(r1, r2) {
                return r1.startContainer === r2.startContainer &&
                    r1.startOffset === r2.startOffset &&
                    r1.endContainer === r2.endContainer &&
                    r1.endOffset === r2.endOffset;
            }
        });

        api.DomRange = Range;
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    // Wrappers for the browser's native DOM Range and/or TextRange implementation 
    api.createCoreModule("WrappedRange", ["DomRange"], function(api, module) {
        var WrappedRange, WrappedTextRange;
        var dom = api.dom;
        var util = api.util;
        var DomPosition = dom.DomPosition;
        var DomRange = api.DomRange;
        var getBody = dom.getBody;
        var getContentDocument = dom.getContentDocument;
        var isCharacterDataNode = dom.isCharacterDataNode;


        /*----------------------------------------------------------------------------------------------------------------*/

        if (api.features.implementsDomRange) {
            // This is a wrapper around the browser's native DOM Range. It has two aims:
            // - Provide workarounds for specific browser bugs
            // - provide convenient extensions, which are inherited from Rangy's DomRange

            (function() {
                var rangeProto;
                var rangeProperties = DomRange.rangeProperties;

                function updateRangeProperties(range) {
                    var i = rangeProperties.length, prop;
                    while (i--) {
                        prop = rangeProperties[i];
                        range[prop] = range.nativeRange[prop];
                    }
                    // Fix for broken collapsed property in IE 9.
                    range.collapsed = (range.startContainer === range.endContainer && range.startOffset === range.endOffset);
                }

                function updateNativeRange(range, startContainer, startOffset, endContainer, endOffset) {
                    var startMoved = (range.startContainer !== startContainer || range.startOffset != startOffset);
                    var endMoved = (range.endContainer !== endContainer || range.endOffset != endOffset);
                    var nativeRangeDifferent = !range.equals(range.nativeRange);

                    // Always set both boundaries for the benefit of IE9 (see issue 35)
                    if (startMoved || endMoved || nativeRangeDifferent) {
                        range.setEnd(endContainer, endOffset);
                        range.setStart(startContainer, startOffset);
                    }
                }

                var createBeforeAfterNodeSetter;

                WrappedRange = function(range) {
                    if (!range) {
                        throw module.createError("WrappedRange: Range must be specified");
                    }
                    this.nativeRange = range;
                    updateRangeProperties(this);
                };

                DomRange.createPrototypeRange(WrappedRange, updateNativeRange);

                rangeProto = WrappedRange.prototype;

                rangeProto.selectNode = function(node) {
                    this.nativeRange.selectNode(node);
                    updateRangeProperties(this);
                };

                rangeProto.cloneContents = function() {
                    return this.nativeRange.cloneContents();
                };

                // Due to a long-standing Firefox bug that I have not been able to find a reliable way to detect,
                // insertNode() is never delegated to the native range.

                rangeProto.surroundContents = function(node) {
                    this.nativeRange.surroundContents(node);
                    updateRangeProperties(this);
                };

                rangeProto.collapse = function(isStart) {
                    this.nativeRange.collapse(isStart);
                    updateRangeProperties(this);
                };

                rangeProto.cloneRange = function() {
                    return new WrappedRange(this.nativeRange.cloneRange());
                };

                rangeProto.refresh = function() {
                    updateRangeProperties(this);
                };

                rangeProto.toString = function() {
                    return this.nativeRange.toString();
                };

                // Create test range and node for feature detection

                var testTextNode = document.createTextNode("test");
                getBody(document).appendChild(testTextNode);
                var range = document.createRange();

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for Firefox 2 bug that prevents moving the start of a Range to a point after its current end and
                // correct for it

                range.setStart(testTextNode, 0);
                range.setEnd(testTextNode, 0);

                try {
                    range.setStart(testTextNode, 1);

                    rangeProto.setStart = function(node, offset) {
                        this.nativeRange.setStart(node, offset);
                        updateRangeProperties(this);
                    };

                    rangeProto.setEnd = function(node, offset) {
                        this.nativeRange.setEnd(node, offset);
                        updateRangeProperties(this);
                    };

                    createBeforeAfterNodeSetter = function(name) {
                        return function(node) {
                            this.nativeRange[name](node);
                            updateRangeProperties(this);
                        };
                    };

                } catch(ex) {

                    rangeProto.setStart = function(node, offset) {
                        try {
                            this.nativeRange.setStart(node, offset);
                        } catch (ex) {
                            this.nativeRange.setEnd(node, offset);
                            this.nativeRange.setStart(node, offset);
                        }
                        updateRangeProperties(this);
                    };

                    rangeProto.setEnd = function(node, offset) {
                        try {
                            this.nativeRange.setEnd(node, offset);
                        } catch (ex) {
                            this.nativeRange.setStart(node, offset);
                            this.nativeRange.setEnd(node, offset);
                        }
                        updateRangeProperties(this);
                    };

                    createBeforeAfterNodeSetter = function(name, oppositeName) {
                        return function(node) {
                            try {
                                this.nativeRange[name](node);
                            } catch (ex) {
                                this.nativeRange[oppositeName](node);
                                this.nativeRange[name](node);
                            }
                            updateRangeProperties(this);
                        };
                    };
                }

                rangeProto.setStartBefore = createBeforeAfterNodeSetter("setStartBefore", "setEndBefore");
                rangeProto.setStartAfter = createBeforeAfterNodeSetter("setStartAfter", "setEndAfter");
                rangeProto.setEndBefore = createBeforeAfterNodeSetter("setEndBefore", "setStartBefore");
                rangeProto.setEndAfter = createBeforeAfterNodeSetter("setEndAfter", "setStartAfter");

                /*--------------------------------------------------------------------------------------------------------*/

                // Always use DOM4-compliant selectNodeContents implementation: it's simpler and less code than testing
                // whether the native implementation can be trusted
                rangeProto.selectNodeContents = function(node) {
                    this.setStartAndEnd(node, 0, dom.getNodeLength(node));
                };

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for and correct WebKit bug that has the behaviour of compareBoundaryPoints round the wrong way for
                // constants START_TO_END and END_TO_START: https://bugs.webkit.org/show_bug.cgi?id=20738

                range.selectNodeContents(testTextNode);
                range.setEnd(testTextNode, 3);

                var range2 = document.createRange();
                range2.selectNodeContents(testTextNode);
                range2.setEnd(testTextNode, 4);
                range2.setStart(testTextNode, 2);

                if (range.compareBoundaryPoints(range.START_TO_END, range2) == -1 &&
                        range.compareBoundaryPoints(range.END_TO_START, range2) == 1) {
                    // This is the wrong way round, so correct for it

                    rangeProto.compareBoundaryPoints = function(type, range) {
                        range = range.nativeRange || range;
                        if (type == range.START_TO_END) {
                            type = range.END_TO_START;
                        } else if (type == range.END_TO_START) {
                            type = range.START_TO_END;
                        }
                        return this.nativeRange.compareBoundaryPoints(type, range);
                    };
                } else {
                    rangeProto.compareBoundaryPoints = function(type, range) {
                        return this.nativeRange.compareBoundaryPoints(type, range.nativeRange || range);
                    };
                }

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for IE deleteContents() and extractContents() bug and correct it. See issue 107.

                var el = document.createElement("div");
                el.innerHTML = "123";
                var textNode = el.firstChild;
                var body = getBody(document);
                body.appendChild(el);

                range.setStart(textNode, 1);
                range.setEnd(textNode, 2);
                range.deleteContents();

                if (textNode.data == "13") {
                    // Behaviour is correct per DOM4 Range so wrap the browser's implementation of deleteContents() and
                    // extractContents()
                    rangeProto.deleteContents = function() {
                        this.nativeRange.deleteContents();
                        updateRangeProperties(this);
                    };

                    rangeProto.extractContents = function() {
                        var frag = this.nativeRange.extractContents();
                        updateRangeProperties(this);
                        return frag;
                    };
                } else {
                }

                body.removeChild(el);
                body = null;

                /*--------------------------------------------------------------------------------------------------------*/

                // Test for existence of createContextualFragment and delegate to it if it exists
                if (util.isHostMethod(range, "createContextualFragment")) {
                    rangeProto.createContextualFragment = function(fragmentStr) {
                        return this.nativeRange.createContextualFragment(fragmentStr);
                    };
                }

                /*--------------------------------------------------------------------------------------------------------*/

                // Clean up
                getBody(document).removeChild(testTextNode);

                rangeProto.getName = function() {
                    return "WrappedRange";
                };

                api.WrappedRange = WrappedRange;

                api.createNativeRange = function(doc) {
                    doc = getContentDocument(doc, module, "createNativeRange");
                    return doc.createRange();
                };
            })();
        }
        
        if (api.features.implementsTextRange) {
            /*
            This is a workaround for a bug where IE returns the wrong container element from the TextRange's parentElement()
            method. For example, in the following (where pipes denote the selection boundaries):

            <ul id="ul"><li id="a">| a </li><li id="b"> b |</li></ul>

            var range = document.selection.createRange();
            alert(range.parentElement().id); // Should alert "ul" but alerts "b"

            This method returns the common ancestor node of the following:
            - the parentElement() of the textRange
            - the parentElement() of the textRange after calling collapse(true)
            - the parentElement() of the textRange after calling collapse(false)
            */
            var getTextRangeContainerElement = function(textRange) {
                var parentEl = textRange.parentElement();
                var range = textRange.duplicate();
                range.collapse(true);
                var startEl = range.parentElement();
                range = textRange.duplicate();
                range.collapse(false);
                var endEl = range.parentElement();
                var startEndContainer = (startEl == endEl) ? startEl : dom.getCommonAncestor(startEl, endEl);

                return startEndContainer == parentEl ? startEndContainer : dom.getCommonAncestor(parentEl, startEndContainer);
            };

            var textRangeIsCollapsed = function(textRange) {
                return textRange.compareEndPoints("StartToEnd", textRange) == 0;
            };

            // Gets the boundary of a TextRange expressed as a node and an offset within that node. This function started
            // out as an improved version of code found in Tim Cameron Ryan's IERange (http://code.google.com/p/ierange/)
            // but has grown, fixing problems with line breaks in preformatted text, adding workaround for IE TextRange
            // bugs, handling for inputs and images, plus optimizations.
            var getTextRangeBoundaryPosition = function(textRange, wholeRangeContainerElement, isStart, isCollapsed, startInfo) {
                var workingRange = textRange.duplicate();
                workingRange.collapse(isStart);
                var containerElement = workingRange.parentElement();

                // Sometimes collapsing a TextRange that's at the start of a text node can move it into the previous node, so
                // check for that
                if (!dom.isOrIsAncestorOf(wholeRangeContainerElement, containerElement)) {
                    containerElement = wholeRangeContainerElement;
                }


                // Deal with nodes that cannot "contain rich HTML markup". In practice, this means form inputs, images and
                // similar. See http://msdn.microsoft.com/en-us/library/aa703950%28VS.85%29.aspx
                if (!containerElement.canHaveHTML) {
                    var pos = new DomPosition(containerElement.parentNode, dom.getNodeIndex(containerElement));
                    return {
                        boundaryPosition: pos,
                        nodeInfo: {
                            nodeIndex: pos.offset,
                            containerElement: pos.node
                        }
                    };
                }

                var workingNode = dom.getDocument(containerElement).createElement("span");

                // Workaround for HTML5 Shiv's insane violation of document.createElement(). See Rangy issue 104 and HTML5
                // Shiv issue 64: https://github.com/aFarkas/html5shiv/issues/64
                if (workingNode.parentNode) {
                    workingNode.parentNode.removeChild(workingNode);
                }

                var comparison, workingComparisonType = isStart ? "StartToStart" : "StartToEnd";
                var previousNode, nextNode, boundaryPosition, boundaryNode;
                var start = (startInfo && startInfo.containerElement == containerElement) ? startInfo.nodeIndex : 0;
                var childNodeCount = containerElement.childNodes.length;
                var end = childNodeCount;

                // Check end first. Code within the loop assumes that the endth child node of the container is definitely
                // after the range boundary.
                var nodeIndex = end;

                while (true) {
                    if (nodeIndex == childNodeCount) {
                        containerElement.appendChild(workingNode);
                    } else {
                        containerElement.insertBefore(workingNode, containerElement.childNodes[nodeIndex]);
                    }
                    workingRange.moveToElementText(workingNode);
                    comparison = workingRange.compareEndPoints(workingComparisonType, textRange);
                    if (comparison == 0 || start == end) {
                        break;
                    } else if (comparison == -1) {
                        if (end == start + 1) {
                            // We know the endth child node is after the range boundary, so we must be done.
                            break;
                        } else {
                            start = nodeIndex;
                        }
                    } else {
                        end = (end == start + 1) ? start : nodeIndex;
                    }
                    nodeIndex = Math.floor((start + end) / 2);
                    containerElement.removeChild(workingNode);
                }


                // We've now reached or gone past the boundary of the text range we're interested in
                // so have identified the node we want
                boundaryNode = workingNode.nextSibling;

                if (comparison == -1 && boundaryNode && isCharacterDataNode(boundaryNode)) {
                    // This is a character data node (text, comment, cdata). The working range is collapsed at the start of
                    // the node containing the text range's boundary, so we move the end of the working range to the
                    // boundary point and measure the length of its text to get the boundary's offset within the node.
                    workingRange.setEndPoint(isStart ? "EndToStart" : "EndToEnd", textRange);

                    var offset;

                    if (/[\r\n]/.test(boundaryNode.data)) {
                        /*
                        For the particular case of a boundary within a text node containing rendered line breaks (within a
                        <pre> element, for example), we need a slightly complicated approach to get the boundary's offset in
                        IE. The facts:
                        
                        - Each line break is represented as \r in the text node's data/nodeValue properties
                        - Each line break is represented as \r\n in the TextRange's 'text' property
                        - The 'text' property of the TextRange does not contain trailing line breaks
                        
                        To get round the problem presented by the final fact above, we can use the fact that TextRange's
                        moveStart() and moveEnd() methods return the actual number of characters moved, which is not
                        necessarily the same as the number of characters it was instructed to move. The simplest approach is
                        to use this to store the characters moved when moving both the start and end of the range to the
                        start of the document body and subtracting the start offset from the end offset (the
                        "move-negative-gazillion" method). However, this is extremely slow when the document is large and
                        the range is near the end of it. Clearly doing the mirror image (i.e. moving the range boundaries to
                        the end of the document) has the same problem.
                        
                        Another approach that works is to use moveStart() to move the start boundary of the range up to the
                        end boundary one character at a time and incrementing a counter with the value returned by the
                        moveStart() call. However, the check for whether the start boundary has reached the end boundary is
                        expensive, so this method is slow (although unlike "move-negative-gazillion" is largely unaffected
                        by the location of the range within the document).
                        
                        The approach used below is a hybrid of the two methods above. It uses the fact that a string
                        containing the TextRange's 'text' property with each \r\n converted to a single \r character cannot
                        be longer than the text of the TextRange, so the start of the range is moved that length initially
                        and then a character at a time to make up for any trailing line breaks not contained in the 'text'
                        property. This has good performance in most situations compared to the previous two methods.
                        */
                        var tempRange = workingRange.duplicate();
                        var rangeLength = tempRange.text.replace(/\r\n/g, "\r").length;

                        offset = tempRange.moveStart("character", rangeLength);
                        while ( (comparison = tempRange.compareEndPoints("StartToEnd", tempRange)) == -1) {
                            offset++;
                            tempRange.moveStart("character", 1);
                        }
                    } else {
                        offset = workingRange.text.length;
                    }
                    boundaryPosition = new DomPosition(boundaryNode, offset);
                } else {

                    // If the boundary immediately follows a character data node and this is the end boundary, we should favour
                    // a position within that, and likewise for a start boundary preceding a character data node
                    previousNode = (isCollapsed || !isStart) && workingNode.previousSibling;
                    nextNode = (isCollapsed || isStart) && workingNode.nextSibling;
                    if (nextNode && isCharacterDataNode(nextNode)) {
                        boundaryPosition = new DomPosition(nextNode, 0);
                    } else if (previousNode && isCharacterDataNode(previousNode)) {
                        boundaryPosition = new DomPosition(previousNode, previousNode.data.length);
                    } else {
                        boundaryPosition = new DomPosition(containerElement, dom.getNodeIndex(workingNode));
                    }
                }

                // Clean up
                workingNode.parentNode.removeChild(workingNode);

                return {
                    boundaryPosition: boundaryPosition,
                    nodeInfo: {
                        nodeIndex: nodeIndex,
                        containerElement: containerElement
                    }
                };
            };

            // Returns a TextRange representing the boundary of a TextRange expressed as a node and an offset within that
            // node. This function started out as an optimized version of code found in Tim Cameron Ryan's IERange
            // (http://code.google.com/p/ierange/)
            var createBoundaryTextRange = function(boundaryPosition, isStart) {
                var boundaryNode, boundaryParent, boundaryOffset = boundaryPosition.offset;
                var doc = dom.getDocument(boundaryPosition.node);
                var workingNode, childNodes, workingRange = getBody(doc).createTextRange();
                var nodeIsDataNode = isCharacterDataNode(boundaryPosition.node);

                if (nodeIsDataNode) {
                    boundaryNode = boundaryPosition.node;
                    boundaryParent = boundaryNode.parentNode;
                } else {
                    childNodes = boundaryPosition.node.childNodes;
                    boundaryNode = (boundaryOffset < childNodes.length) ? childNodes[boundaryOffset] : null;
                    boundaryParent = boundaryPosition.node;
                }

                // Position the range immediately before the node containing the boundary
                workingNode = doc.createElement("span");

                // Making the working element non-empty element persuades IE to consider the TextRange boundary to be within
                // the element rather than immediately before or after it
                workingNode.innerHTML = "&#feff;";

                // insertBefore is supposed to work like appendChild if the second parameter is null. However, a bug report
                // for IERange suggests that it can crash the browser: http://code.google.com/p/ierange/issues/detail?id=12
                if (boundaryNode) {
                    boundaryParent.insertBefore(workingNode, boundaryNode);
                } else {
                    boundaryParent.appendChild(workingNode);
                }

                workingRange.moveToElementText(workingNode);
                workingRange.collapse(!isStart);

                // Clean up
                boundaryParent.removeChild(workingNode);

                // Move the working range to the text offset, if required
                if (nodeIsDataNode) {
                    workingRange[isStart ? "moveStart" : "moveEnd"]("character", boundaryOffset);
                }

                return workingRange;
            };

            /*------------------------------------------------------------------------------------------------------------*/

            // This is a wrapper around a TextRange, providing full DOM Range functionality using rangy's DomRange as a
            // prototype

            WrappedTextRange = function(textRange) {
                this.textRange = textRange;
                this.refresh();
            };

            WrappedTextRange.prototype = new DomRange(document);

            WrappedTextRange.prototype.refresh = function() {
                var start, end, startBoundary;

                // TextRange's parentElement() method cannot be trusted. getTextRangeContainerElement() works around that.
                var rangeContainerElement = getTextRangeContainerElement(this.textRange);

                if (textRangeIsCollapsed(this.textRange)) {
                    end = start = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, true,
                        true).boundaryPosition;
                } else {
                    startBoundary = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, true, false);
                    start = startBoundary.boundaryPosition;

                    // An optimization used here is that if the start and end boundaries have the same parent element, the
                    // search scope for the end boundary can be limited to exclude the portion of the element that precedes
                    // the start boundary
                    end = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, false, false,
                        startBoundary.nodeInfo).boundaryPosition;
                }

                this.setStart(start.node, start.offset);
                this.setEnd(end.node, end.offset);
            };

            WrappedTextRange.prototype.getName = function() {
                return "WrappedTextRange";
            };

            DomRange.copyComparisonConstants(WrappedTextRange);

            var rangeToTextRange = function(range) {
                if (range.collapsed) {
                    return createBoundaryTextRange(new DomPosition(range.startContainer, range.startOffset), true);
                } else {
                    var startRange = createBoundaryTextRange(new DomPosition(range.startContainer, range.startOffset), true);
                    var endRange = createBoundaryTextRange(new DomPosition(range.endContainer, range.endOffset), false);
                    var textRange = getBody( DomRange.getRangeDocument(range) ).createTextRange();
                    textRange.setEndPoint("StartToStart", startRange);
                    textRange.setEndPoint("EndToEnd", endRange);
                    return textRange;
                }
            };

            WrappedTextRange.rangeToTextRange = rangeToTextRange;

            WrappedTextRange.prototype.toTextRange = function() {
                return rangeToTextRange(this);
            };

            api.WrappedTextRange = WrappedTextRange;

            // IE 9 and above have both implementations and Rangy makes both available. The next few lines sets which
            // implementation to use by default.
            if (!api.features.implementsDomRange || api.config.preferTextRange) {
                // Add WrappedTextRange as the Range property of the global object to allow expression like Range.END_TO_END to work
                var globalObj = (function(f) { return f("return this;")(); })(Function);
                if (typeof globalObj.Range == "undefined") {
                    globalObj.Range = WrappedTextRange;
                }

                api.createNativeRange = function(doc) {
                    doc = getContentDocument(doc, module, "createNativeRange");
                    return getBody(doc).createTextRange();
                };

                api.WrappedRange = WrappedTextRange;
            }
        }

        api.createRange = function(doc) {
            doc = getContentDocument(doc, module, "createRange");
            return new api.WrappedRange(api.createNativeRange(doc));
        };

        api.createRangyRange = function(doc) {
            doc = getContentDocument(doc, module, "createRangyRange");
            return new DomRange(doc);
        };

        api.createIframeRange = function(iframeEl) {
            module.deprecationNotice("createIframeRange()", "createRange(iframeEl)");
            return api.createRange(iframeEl);
        };

        api.createIframeRangyRange = function(iframeEl) {
            module.deprecationNotice("createIframeRangyRange()", "createRangyRange(iframeEl)");
            return api.createRangyRange(iframeEl);
        };

        api.addShimListener(function(win) {
            var doc = win.document;
            if (typeof doc.createRange == "undefined") {
                doc.createRange = function() {
                    return api.createRange(doc);
                };
            }
            doc = win = null;
        });
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    // This module creates a selection object wrapper that conforms as closely as possible to the Selection specification
    // in the HTML Editing spec (http://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#selections)
    api.createCoreModule("WrappedSelection", ["DomRange", "WrappedRange"], function(api, module) {
        api.config.checkSelectionRanges = true;

        var BOOLEAN = "boolean";
        var NUMBER = "number";
        var dom = api.dom;
        var util = api.util;
        var isHostMethod = util.isHostMethod;
        var DomRange = api.DomRange;
        var WrappedRange = api.WrappedRange;
        var DOMException = api.DOMException;
        var DomPosition = dom.DomPosition;
        var getNativeSelection;
        var selectionIsCollapsed;
        var features = api.features;
        var CONTROL = "Control";
        var getDocument = dom.getDocument;
        var getBody = dom.getBody;
        var rangesEqual = DomRange.rangesEqual;


        // Utility function to support direction parameters in the API that may be a string ("backward" or "forward") or a
        // Boolean (true for backwards).
        function isDirectionBackward(dir) {
            return (typeof dir == "string") ? /^backward(s)?$/i.test(dir) : !!dir;
        }

        function getWindow(win, methodName) {
            if (!win) {
                return window;
            } else if (dom.isWindow(win)) {
                return win;
            } else if (win instanceof WrappedSelection) {
                return win.win;
            } else {
                var doc = dom.getContentDocument(win, module, methodName);
                return dom.getWindow(doc);
            }
        }

        function getWinSelection(winParam) {
            return getWindow(winParam, "getWinSelection").getSelection();
        }

        function getDocSelection(winParam) {
            return getWindow(winParam, "getDocSelection").document.selection;
        }
        
        function winSelectionIsBackward(sel) {
            var backward = false;
            if (sel.anchorNode) {
                backward = (dom.comparePoints(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset) == 1);
            }
            return backward;
        }

        // Test for the Range/TextRange and Selection features required
        // Test for ability to retrieve selection
        var implementsWinGetSelection = isHostMethod(window, "getSelection"),
            implementsDocSelection = util.isHostObject(document, "selection");

        features.implementsWinGetSelection = implementsWinGetSelection;
        features.implementsDocSelection = implementsDocSelection;

        var useDocumentSelection = implementsDocSelection && (!implementsWinGetSelection || api.config.preferTextRange);

        if (useDocumentSelection) {
            getNativeSelection = getDocSelection;
            api.isSelectionValid = function(winParam) {
                var doc = getWindow(winParam, "isSelectionValid").document, nativeSel = doc.selection;

                // Check whether the selection TextRange is actually contained within the correct document
                return (nativeSel.type != "None" || getDocument(nativeSel.createRange().parentElement()) == doc);
            };
        } else if (implementsWinGetSelection) {
            getNativeSelection = getWinSelection;
            api.isSelectionValid = function() {
                return true;
            };
        } else {
            module.fail("Neither document.selection or window.getSelection() detected.");
        }

        api.getNativeSelection = getNativeSelection;

        var testSelection = getNativeSelection();
        var testRange = api.createNativeRange(document);
        var body = getBody(document);

        // Obtaining a range from a selection
        var selectionHasAnchorAndFocus = util.areHostProperties(testSelection,
            ["anchorNode", "focusNode", "anchorOffset", "focusOffset"]);

        features.selectionHasAnchorAndFocus = selectionHasAnchorAndFocus;

        // Test for existence of native selection extend() method
        var selectionHasExtend = isHostMethod(testSelection, "extend");
        features.selectionHasExtend = selectionHasExtend;
        
        // Test if rangeCount exists
        var selectionHasRangeCount = (typeof testSelection.rangeCount == NUMBER);
        features.selectionHasRangeCount = selectionHasRangeCount;

        var selectionSupportsMultipleRanges = false;
        var collapsedNonEditableSelectionsSupported = true;

        var addRangeBackwardToNative = selectionHasExtend ?
            function(nativeSelection, range) {
                var doc = DomRange.getRangeDocument(range);
                var endRange = api.createRange(doc);
                endRange.collapseToPoint(range.endContainer, range.endOffset);
                nativeSelection.addRange(getNativeRange(endRange));
                nativeSelection.extend(range.startContainer, range.startOffset);
            } : null;

        if (util.areHostMethods(testSelection, ["addRange", "getRangeAt", "removeAllRanges"]) &&
                typeof testSelection.rangeCount == NUMBER && features.implementsDomRange) {

            (function() {
                // Previously an iframe was used but this caused problems in some circumstances in IE, so tests are
                // performed on the current document's selection. See issue 109.

                // Note also that if a selection previously existed, it is wiped by these tests. This should usually be fine
                // because initialization usually happens when the document loads, but could be a problem for a script that
                // loads and initializes Rangy later. If anyone complains, code could be added to save and restore the
                // selection.
                var sel = window.getSelection();
                if (sel) {
                    // Store the current selection
                    var originalSelectionRangeCount = sel.rangeCount;
                    var selectionHasMultipleRanges = (originalSelectionRangeCount > 1);
                    var originalSelectionRanges = [];
                    var originalSelectionBackward = winSelectionIsBackward(sel); 
                    for (var i = 0; i < originalSelectionRangeCount; ++i) {
                        originalSelectionRanges[i] = sel.getRangeAt(i);
                    }
                    
                    // Create some test elements
                    var body = getBody(document);
                    var testEl = body.appendChild( document.createElement("div") );
                    testEl.contentEditable = "false";
                    var textNode = testEl.appendChild( document.createTextNode("\u00a0\u00a0\u00a0") );

                    // Test whether the native selection will allow a collapsed selection within a non-editable element
                    var r1 = document.createRange();

                    r1.setStart(textNode, 1);
                    r1.collapse(true);
                    sel.addRange(r1);
                    collapsedNonEditableSelectionsSupported = (sel.rangeCount == 1);
                    sel.removeAllRanges();

                    // Test whether the native selection is capable of supporting multiple ranges.
                    if (!selectionHasMultipleRanges) {
                        // Doing the original feature test here in Chrome 36 (and presumably later versions) prints a
                        // console error of "Discontiguous selection is not supported." that cannot be suppressed. There's
                        // nothing we can do about this while retaining the feature test so we have to resort to a browser
                        // sniff. I'm not happy about it. See
                        // https://code.google.com/p/chromium/issues/detail?id=399791
                        var chromeMatch = window.navigator.appVersion.match(/Chrome\/(.*?) /);
                        if (chromeMatch && parseInt(chromeMatch[1]) >= 36) {
                            selectionSupportsMultipleRanges = false;
                        } else {
                            var r2 = r1.cloneRange();
                            r1.setStart(textNode, 0);
                            r2.setEnd(textNode, 3);
                            r2.setStart(textNode, 2);
                            sel.addRange(r1);
                            sel.addRange(r2);
                            selectionSupportsMultipleRanges = (sel.rangeCount == 2);
                        }
                    }

                    // Clean up
                    body.removeChild(testEl);
                    sel.removeAllRanges();

                    for (i = 0; i < originalSelectionRangeCount; ++i) {
                        if (i == 0 && originalSelectionBackward) {
                            if (addRangeBackwardToNative) {
                                addRangeBackwardToNative(sel, originalSelectionRanges[i]);
                            } else {
                                api.warn("Rangy initialization: original selection was backwards but selection has been restored forwards because the browser does not support Selection.extend");
                                sel.addRange(originalSelectionRanges[i]);
                            }
                        } else {
                            sel.addRange(originalSelectionRanges[i]);
                        }
                    }
                }
            })();
        }

        features.selectionSupportsMultipleRanges = selectionSupportsMultipleRanges;
        features.collapsedNonEditableSelectionsSupported = collapsedNonEditableSelectionsSupported;

        // ControlRanges
        var implementsControlRange = false, testControlRange;

        if (body && isHostMethod(body, "createControlRange")) {
            testControlRange = body.createControlRange();
            if (util.areHostProperties(testControlRange, ["item", "add"])) {
                implementsControlRange = true;
            }
        }
        features.implementsControlRange = implementsControlRange;

        // Selection collapsedness
        if (selectionHasAnchorAndFocus) {
            selectionIsCollapsed = function(sel) {
                return sel.anchorNode === sel.focusNode && sel.anchorOffset === sel.focusOffset;
            };
        } else {
            selectionIsCollapsed = function(sel) {
                return sel.rangeCount ? sel.getRangeAt(sel.rangeCount - 1).collapsed : false;
            };
        }

        function updateAnchorAndFocusFromRange(sel, range, backward) {
            var anchorPrefix = backward ? "end" : "start", focusPrefix = backward ? "start" : "end";
            sel.anchorNode = range[anchorPrefix + "Container"];
            sel.anchorOffset = range[anchorPrefix + "Offset"];
            sel.focusNode = range[focusPrefix + "Container"];
            sel.focusOffset = range[focusPrefix + "Offset"];
        }

        function updateAnchorAndFocusFromNativeSelection(sel) {
            var nativeSel = sel.nativeSelection;
            sel.anchorNode = nativeSel.anchorNode;
            sel.anchorOffset = nativeSel.anchorOffset;
            sel.focusNode = nativeSel.focusNode;
            sel.focusOffset = nativeSel.focusOffset;
        }

        function updateEmptySelection(sel) {
            sel.anchorNode = sel.focusNode = null;
            sel.anchorOffset = sel.focusOffset = 0;
            sel.rangeCount = 0;
            sel.isCollapsed = true;
            sel._ranges.length = 0;
        }

        function getNativeRange(range) {
            var nativeRange;
            if (range instanceof DomRange) {
                nativeRange = api.createNativeRange(range.getDocument());
                nativeRange.setEnd(range.endContainer, range.endOffset);
                nativeRange.setStart(range.startContainer, range.startOffset);
            } else if (range instanceof WrappedRange) {
                nativeRange = range.nativeRange;
            } else if (features.implementsDomRange && (range instanceof dom.getWindow(range.startContainer).Range)) {
                nativeRange = range;
            }
            return nativeRange;
        }

        function rangeContainsSingleElement(rangeNodes) {
            if (!rangeNodes.length || rangeNodes[0].nodeType != 1) {
                return false;
            }
            for (var i = 1, len = rangeNodes.length; i < len; ++i) {
                if (!dom.isAncestorOf(rangeNodes[0], rangeNodes[i])) {
                    return false;
                }
            }
            return true;
        }

        function getSingleElementFromRange(range) {
            var nodes = range.getNodes();
            if (!rangeContainsSingleElement(nodes)) {
                throw module.createError("getSingleElementFromRange: range " + range.inspect() + " did not consist of a single element");
            }
            return nodes[0];
        }

        // Simple, quick test which only needs to distinguish between a TextRange and a ControlRange
        function isTextRange(range) {
            return !!range && typeof range.text != "undefined";
        }

        function updateFromTextRange(sel, range) {
            // Create a Range from the selected TextRange
            var wrappedRange = new WrappedRange(range);
            sel._ranges = [wrappedRange];

            updateAnchorAndFocusFromRange(sel, wrappedRange, false);
            sel.rangeCount = 1;
            sel.isCollapsed = wrappedRange.collapsed;
        }

        function updateControlSelection(sel) {
            // Update the wrapped selection based on what's now in the native selection
            sel._ranges.length = 0;
            if (sel.docSelection.type == "None") {
                updateEmptySelection(sel);
            } else {
                var controlRange = sel.docSelection.createRange();
                if (isTextRange(controlRange)) {
                    // This case (where the selection type is "Control" and calling createRange() on the selection returns
                    // a TextRange) can happen in IE 9. It happens, for example, when all elements in the selected
                    // ControlRange have been removed from the ControlRange and removed from the document.
                    updateFromTextRange(sel, controlRange);
                } else {
                    sel.rangeCount = controlRange.length;
                    var range, doc = getDocument(controlRange.item(0));
                    for (var i = 0; i < sel.rangeCount; ++i) {
                        range = api.createRange(doc);
                        range.selectNode(controlRange.item(i));
                        sel._ranges.push(range);
                    }
                    sel.isCollapsed = sel.rangeCount == 1 && sel._ranges[0].collapsed;
                    updateAnchorAndFocusFromRange(sel, sel._ranges[sel.rangeCount - 1], false);
                }
            }
        }

        function addRangeToControlSelection(sel, range) {
            var controlRange = sel.docSelection.createRange();
            var rangeElement = getSingleElementFromRange(range);

            // Create a new ControlRange containing all the elements in the selected ControlRange plus the element
            // contained by the supplied range
            var doc = getDocument(controlRange.item(0));
            var newControlRange = getBody(doc).createControlRange();
            for (var i = 0, len = controlRange.length; i < len; ++i) {
                newControlRange.add(controlRange.item(i));
            }
            try {
                newControlRange.add(rangeElement);
            } catch (ex) {
                throw module.createError("addRange(): Element within the specified Range could not be added to control selection (does it have layout?)");
            }
            newControlRange.select();

            // Update the wrapped selection based on what's now in the native selection
            updateControlSelection(sel);
        }

        var getSelectionRangeAt;

        if (isHostMethod(testSelection, "getRangeAt")) {
            // try/catch is present because getRangeAt() must have thrown an error in some browser and some situation.
            // Unfortunately, I didn't write a comment about the specifics and am now scared to take it out. Let that be a
            // lesson to us all, especially me.
            getSelectionRangeAt = function(sel, index) {
                try {
                    return sel.getRangeAt(index);
                } catch (ex) {
                    return null;
                }
            };
        } else if (selectionHasAnchorAndFocus) {
            getSelectionRangeAt = function(sel) {
                var doc = getDocument(sel.anchorNode);
                var range = api.createRange(doc);
                range.setStartAndEnd(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);

                // Handle the case when the selection was selected backwards (from the end to the start in the
                // document)
                if (range.collapsed !== this.isCollapsed) {
                    range.setStartAndEnd(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset);
                }

                return range;
            };
        }

        function WrappedSelection(selection, docSelection, win) {
            this.nativeSelection = selection;
            this.docSelection = docSelection;
            this._ranges = [];
            this.win = win;
            this.refresh();
        }

        WrappedSelection.prototype = api.selectionPrototype;

        function deleteProperties(sel) {
            sel.win = sel.anchorNode = sel.focusNode = sel._ranges = null;
            sel.rangeCount = sel.anchorOffset = sel.focusOffset = 0;
            sel.detached = true;
        }

        var cachedRangySelections = [];

        function actOnCachedSelection(win, action) {
            var i = cachedRangySelections.length, cached, sel;
            while (i--) {
                cached = cachedRangySelections[i];
                sel = cached.selection;
                if (action == "deleteAll") {
                    deleteProperties(sel);
                } else if (cached.win == win) {
                    if (action == "delete") {
                        cachedRangySelections.splice(i, 1);
                        return true;
                    } else {
                        return sel;
                    }
                }
            }
            if (action == "deleteAll") {
                cachedRangySelections.length = 0;
            }
            return null;
        }

        var getSelection = function(win) {
            // Check if the parameter is a Rangy Selection object
            if (win && win instanceof WrappedSelection) {
                win.refresh();
                return win;
            }

            win = getWindow(win, "getNativeSelection");

            var sel = actOnCachedSelection(win);
            var nativeSel = getNativeSelection(win), docSel = implementsDocSelection ? getDocSelection(win) : null;
            if (sel) {
                sel.nativeSelection = nativeSel;
                sel.docSelection = docSel;
                sel.refresh();
            } else {
                sel = new WrappedSelection(nativeSel, docSel, win);
                cachedRangySelections.push( { win: win, selection: sel } );
            }
            return sel;
        };

        api.getSelection = getSelection;

        api.getIframeSelection = function(iframeEl) {
            module.deprecationNotice("getIframeSelection()", "getSelection(iframeEl)");
            return api.getSelection(dom.getIframeWindow(iframeEl));
        };

        var selProto = WrappedSelection.prototype;

        function createControlSelection(sel, ranges) {
            // Ensure that the selection becomes of type "Control"
            var doc = getDocument(ranges[0].startContainer);
            var controlRange = getBody(doc).createControlRange();
            for (var i = 0, el, len = ranges.length; i < len; ++i) {
                el = getSingleElementFromRange(ranges[i]);
                try {
                    controlRange.add(el);
                } catch (ex) {
                    throw module.createError("setRanges(): Element within one of the specified Ranges could not be added to control selection (does it have layout?)");
                }
            }
            controlRange.select();

            // Update the wrapped selection based on what's now in the native selection
            updateControlSelection(sel);
        }

        // Selecting a range
        if (!useDocumentSelection && selectionHasAnchorAndFocus && util.areHostMethods(testSelection, ["removeAllRanges", "addRange"])) {
            selProto.removeAllRanges = function() {
                this.nativeSelection.removeAllRanges();
                updateEmptySelection(this);
            };

            var addRangeBackward = function(sel, range) {
                addRangeBackwardToNative(sel.nativeSelection, range);
                sel.refresh();
            };

            if (selectionHasRangeCount) {
                selProto.addRange = function(range, direction) {
                    if (implementsControlRange && implementsDocSelection && this.docSelection.type == CONTROL) {
                        addRangeToControlSelection(this, range);
                    } else {
                        if (isDirectionBackward(direction) && selectionHasExtend) {
                            addRangeBackward(this, range);
                        } else {
                            var previousRangeCount;
                            if (selectionSupportsMultipleRanges) {
                                previousRangeCount = this.rangeCount;
                            } else {
                                this.removeAllRanges();
                                previousRangeCount = 0;
                            }
                            // Clone the native range so that changing the selected range does not affect the selection.
                            // This is contrary to the spec but is the only way to achieve consistency between browsers. See
                            // issue 80.
                            var clonedNativeRange = getNativeRange(range).cloneRange();
                            try {
                                this.nativeSelection.addRange(clonedNativeRange);
                            } catch (ex) {
                            }

                            // Check whether adding the range was successful
                            this.rangeCount = this.nativeSelection.rangeCount;

                            if (this.rangeCount == previousRangeCount + 1) {
                                // The range was added successfully

                                // Check whether the range that we added to the selection is reflected in the last range extracted from
                                // the selection
                                if (api.config.checkSelectionRanges) {
                                    var nativeRange = getSelectionRangeAt(this.nativeSelection, this.rangeCount - 1);
                                    if (nativeRange && !rangesEqual(nativeRange, range)) {
                                        // Happens in WebKit with, for example, a selection placed at the start of a text node
                                        range = new WrappedRange(nativeRange);
                                    }
                                }
                                this._ranges[this.rangeCount - 1] = range;
                                updateAnchorAndFocusFromRange(this, range, selectionIsBackward(this.nativeSelection));
                                this.isCollapsed = selectionIsCollapsed(this);
                            } else {
                                // The range was not added successfully. The simplest thing is to refresh
                                this.refresh();
                            }
                        }
                    }
                };
            } else {
                selProto.addRange = function(range, direction) {
                    if (isDirectionBackward(direction) && selectionHasExtend) {
                        addRangeBackward(this, range);
                    } else {
                        this.nativeSelection.addRange(getNativeRange(range));
                        this.refresh();
                    }
                };
            }

            selProto.setRanges = function(ranges) {
                if (implementsControlRange && implementsDocSelection && ranges.length > 1) {
                    createControlSelection(this, ranges);
                } else {
                    this.removeAllRanges();
                    for (var i = 0, len = ranges.length; i < len; ++i) {
                        this.addRange(ranges[i]);
                    }
                }
            };
        } else if (isHostMethod(testSelection, "empty") && isHostMethod(testRange, "select") &&
                   implementsControlRange && useDocumentSelection) {

            selProto.removeAllRanges = function() {
                // Added try/catch as fix for issue #21
                try {
                    this.docSelection.empty();

                    // Check for empty() not working (issue #24)
                    if (this.docSelection.type != "None") {
                        // Work around failure to empty a control selection by instead selecting a TextRange and then
                        // calling empty()
                        var doc;
                        if (this.anchorNode) {
                            doc = getDocument(this.anchorNode);
                        } else if (this.docSelection.type == CONTROL) {
                            var controlRange = this.docSelection.createRange();
                            if (controlRange.length) {
                                doc = getDocument( controlRange.item(0) );
                            }
                        }
                        if (doc) {
                            var textRange = getBody(doc).createTextRange();
                            textRange.select();
                            this.docSelection.empty();
                        }
                    }
                } catch(ex) {}
                updateEmptySelection(this);
            };

            selProto.addRange = function(range) {
                if (this.docSelection.type == CONTROL) {
                    addRangeToControlSelection(this, range);
                } else {
                    api.WrappedTextRange.rangeToTextRange(range).select();
                    this._ranges[0] = range;
                    this.rangeCount = 1;
                    this.isCollapsed = this._ranges[0].collapsed;
                    updateAnchorAndFocusFromRange(this, range, false);
                }
            };

            selProto.setRanges = function(ranges) {
                this.removeAllRanges();
                var rangeCount = ranges.length;
                if (rangeCount > 1) {
                    createControlSelection(this, ranges);
                } else if (rangeCount) {
                    this.addRange(ranges[0]);
                }
            };
        } else {
            module.fail("No means of selecting a Range or TextRange was found");
            return false;
        }

        selProto.getRangeAt = function(index) {
            if (index < 0 || index >= this.rangeCount) {
                throw new DOMException("INDEX_SIZE_ERR");
            } else {
                // Clone the range to preserve selection-range independence. See issue 80.
                return this._ranges[index].cloneRange();
            }
        };

        var refreshSelection;

        if (useDocumentSelection) {
            refreshSelection = function(sel) {
                var range;
                if (api.isSelectionValid(sel.win)) {
                    range = sel.docSelection.createRange();
                } else {
                    range = getBody(sel.win.document).createTextRange();
                    range.collapse(true);
                }

                if (sel.docSelection.type == CONTROL) {
                    updateControlSelection(sel);
                } else if (isTextRange(range)) {
                    updateFromTextRange(sel, range);
                } else {
                    updateEmptySelection(sel);
                }
            };
        } else if (isHostMethod(testSelection, "getRangeAt") && typeof testSelection.rangeCount == NUMBER) {
            refreshSelection = function(sel) {
                if (implementsControlRange && implementsDocSelection && sel.docSelection.type == CONTROL) {
                    updateControlSelection(sel);
                } else {
                    sel._ranges.length = sel.rangeCount = sel.nativeSelection.rangeCount;
                    if (sel.rangeCount) {
                        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                            sel._ranges[i] = new api.WrappedRange(sel.nativeSelection.getRangeAt(i));
                        }
                        updateAnchorAndFocusFromRange(sel, sel._ranges[sel.rangeCount - 1], selectionIsBackward(sel.nativeSelection));
                        sel.isCollapsed = selectionIsCollapsed(sel);
                    } else {
                        updateEmptySelection(sel);
                    }
                }
            };
        } else if (selectionHasAnchorAndFocus && typeof testSelection.isCollapsed == BOOLEAN && typeof testRange.collapsed == BOOLEAN && features.implementsDomRange) {
            refreshSelection = function(sel) {
                var range, nativeSel = sel.nativeSelection;
                if (nativeSel.anchorNode) {
                    range = getSelectionRangeAt(nativeSel, 0);
                    sel._ranges = [range];
                    sel.rangeCount = 1;
                    updateAnchorAndFocusFromNativeSelection(sel);
                    sel.isCollapsed = selectionIsCollapsed(sel);
                } else {
                    updateEmptySelection(sel);
                }
            };
        } else {
            module.fail("No means of obtaining a Range or TextRange from the user's selection was found");
            return false;
        }

        selProto.refresh = function(checkForChanges) {
            var oldRanges = checkForChanges ? this._ranges.slice(0) : null;
            var oldAnchorNode = this.anchorNode, oldAnchorOffset = this.anchorOffset;

            refreshSelection(this);
            if (checkForChanges) {
                // Check the range count first
                var i = oldRanges.length;
                if (i != this._ranges.length) {
                    return true;
                }

                // Now check the direction. Checking the anchor position is the same is enough since we're checking all the
                // ranges after this
                if (this.anchorNode != oldAnchorNode || this.anchorOffset != oldAnchorOffset) {
                    return true;
                }

                // Finally, compare each range in turn
                while (i--) {
                    if (!rangesEqual(oldRanges[i], this._ranges[i])) {
                        return true;
                    }
                }
                return false;
            }
        };

        // Removal of a single range
        var removeRangeManually = function(sel, range) {
            var ranges = sel.getAllRanges();
            sel.removeAllRanges();
            for (var i = 0, len = ranges.length; i < len; ++i) {
                if (!rangesEqual(range, ranges[i])) {
                    sel.addRange(ranges[i]);
                }
            }
            if (!sel.rangeCount) {
                updateEmptySelection(sel);
            }
        };

        if (implementsControlRange && implementsDocSelection) {
            selProto.removeRange = function(range) {
                if (this.docSelection.type == CONTROL) {
                    var controlRange = this.docSelection.createRange();
                    var rangeElement = getSingleElementFromRange(range);

                    // Create a new ControlRange containing all the elements in the selected ControlRange minus the
                    // element contained by the supplied range
                    var doc = getDocument(controlRange.item(0));
                    var newControlRange = getBody(doc).createControlRange();
                    var el, removed = false;
                    for (var i = 0, len = controlRange.length; i < len; ++i) {
                        el = controlRange.item(i);
                        if (el !== rangeElement || removed) {
                            newControlRange.add(controlRange.item(i));
                        } else {
                            removed = true;
                        }
                    }
                    newControlRange.select();

                    // Update the wrapped selection based on what's now in the native selection
                    updateControlSelection(this);
                } else {
                    removeRangeManually(this, range);
                }
            };
        } else {
            selProto.removeRange = function(range) {
                removeRangeManually(this, range);
            };
        }

        // Detecting if a selection is backward
        var selectionIsBackward;
        if (!useDocumentSelection && selectionHasAnchorAndFocus && features.implementsDomRange) {
            selectionIsBackward = winSelectionIsBackward;

            selProto.isBackward = function() {
                return selectionIsBackward(this);
            };
        } else {
            selectionIsBackward = selProto.isBackward = function() {
                return false;
            };
        }

        // Create an alias for backwards compatibility. From 1.3, everything is "backward" rather than "backwards"
        selProto.isBackwards = selProto.isBackward;

        // Selection stringifier
        // This is conformant to the old HTML5 selections draft spec but differs from WebKit and Mozilla's implementation.
        // The current spec does not yet define this method.
        selProto.toString = function() {
            var rangeTexts = [];
            for (var i = 0, len = this.rangeCount; i < len; ++i) {
                rangeTexts[i] = "" + this._ranges[i];
            }
            return rangeTexts.join("");
        };

        function assertNodeInSameDocument(sel, node) {
            if (sel.win.document != getDocument(node)) {
                throw new DOMException("WRONG_DOCUMENT_ERR");
            }
        }

        // No current browser conforms fully to the spec for this method, so Rangy's own method is always used
        selProto.collapse = function(node, offset) {
            assertNodeInSameDocument(this, node);
            var range = api.createRange(node);
            range.collapseToPoint(node, offset);
            this.setSingleRange(range);
            this.isCollapsed = true;
        };

        selProto.collapseToStart = function() {
            if (this.rangeCount) {
                var range = this._ranges[0];
                this.collapse(range.startContainer, range.startOffset);
            } else {
                throw new DOMException("INVALID_STATE_ERR");
            }
        };

        selProto.collapseToEnd = function() {
            if (this.rangeCount) {
                var range = this._ranges[this.rangeCount - 1];
                this.collapse(range.endContainer, range.endOffset);
            } else {
                throw new DOMException("INVALID_STATE_ERR");
            }
        };

        // The spec is very specific on how selectAllChildren should be implemented so the native implementation is
        // never used by Rangy.
        selProto.selectAllChildren = function(node) {
            assertNodeInSameDocument(this, node);
            var range = api.createRange(node);
            range.selectNodeContents(node);
            this.setSingleRange(range);
        };

        selProto.deleteFromDocument = function() {
            // Sepcial behaviour required for IE's control selections
            if (implementsControlRange && implementsDocSelection && this.docSelection.type == CONTROL) {
                var controlRange = this.docSelection.createRange();
                var element;
                while (controlRange.length) {
                    element = controlRange.item(0);
                    controlRange.remove(element);
                    element.parentNode.removeChild(element);
                }
                this.refresh();
            } else if (this.rangeCount) {
                var ranges = this.getAllRanges();
                if (ranges.length) {
                    this.removeAllRanges();
                    for (var i = 0, len = ranges.length; i < len; ++i) {
                        ranges[i].deleteContents();
                    }
                    // The spec says nothing about what the selection should contain after calling deleteContents on each
                    // range. Firefox moves the selection to where the final selected range was, so we emulate that
                    this.addRange(ranges[len - 1]);
                }
            }
        };

        // The following are non-standard extensions
        selProto.eachRange = function(func, returnValue) {
            for (var i = 0, len = this._ranges.length; i < len; ++i) {
                if ( func( this.getRangeAt(i) ) ) {
                    return returnValue;
                }
            }
        };

        selProto.getAllRanges = function() {
            var ranges = [];
            this.eachRange(function(range) {
                ranges.push(range);
            });
            return ranges;
        };

        selProto.setSingleRange = function(range, direction) {
            this.removeAllRanges();
            this.addRange(range, direction);
        };

        selProto.callMethodOnEachRange = function(methodName, params) {
            var results = [];
            this.eachRange( function(range) {
                results.push( range[methodName].apply(range, params) );
            } );
            return results;
        };
        
        function createStartOrEndSetter(isStart) {
            return function(node, offset) {
                var range;
                if (this.rangeCount) {
                    range = this.getRangeAt(0);
                    range["set" + (isStart ? "Start" : "End")](node, offset);
                } else {
                    range = api.createRange(this.win.document);
                    range.setStartAndEnd(node, offset);
                }
                this.setSingleRange(range, this.isBackward());
            };
        }

        selProto.setStart = createStartOrEndSetter(true);
        selProto.setEnd = createStartOrEndSetter(false);
        
        // Add select() method to Range prototype. Any existing selection will be removed.
        api.rangePrototype.select = function(direction) {
            getSelection( this.getDocument() ).setSingleRange(this, direction);
        };

        selProto.changeEachRange = function(func) {
            var ranges = [];
            var backward = this.isBackward();

            this.eachRange(function(range) {
                func(range);
                ranges.push(range);
            });

            this.removeAllRanges();
            if (backward && ranges.length == 1) {
                this.addRange(ranges[0], "backward");
            } else {
                this.setRanges(ranges);
            }
        };

        selProto.containsNode = function(node, allowPartial) {
            return this.eachRange( function(range) {
                return range.containsNode(node, allowPartial);
            }, true ) || false;
        };

        selProto.getBookmark = function(containerNode) {
            return {
                backward: this.isBackward(),
                rangeBookmarks: this.callMethodOnEachRange("getBookmark", [containerNode])
            };
        };

        selProto.moveToBookmark = function(bookmark) {
            var selRanges = [];
            for (var i = 0, rangeBookmark, range; rangeBookmark = bookmark.rangeBookmarks[i++]; ) {
                range = api.createRange(this.win);
                range.moveToBookmark(rangeBookmark);
                selRanges.push(range);
            }
            if (bookmark.backward) {
                this.setSingleRange(selRanges[0], "backward");
            } else {
                this.setRanges(selRanges);
            }
        };

        selProto.toHtml = function() {
            var rangeHtmls = [];
            this.eachRange(function(range) {
                rangeHtmls.push( DomRange.toHtml(range) );
            });
            return rangeHtmls.join("");
        };

        if (features.implementsTextRange) {
            selProto.getNativeTextRange = function() {
                var sel, textRange;
                if ( (sel = this.docSelection) ) {
                    var range = sel.createRange();
                    if (isTextRange(range)) {
                        return range;
                    } else {
                        throw module.createError("getNativeTextRange: selection is a control selection"); 
                    }
                } else if (this.rangeCount > 0) {
                    return api.WrappedTextRange.rangeToTextRange( this.getRangeAt(0) );
                } else {
                    throw module.createError("getNativeTextRange: selection contains no range");
                }
            };
        }

        function inspect(sel) {
            var rangeInspects = [];
            var anchor = new DomPosition(sel.anchorNode, sel.anchorOffset);
            var focus = new DomPosition(sel.focusNode, sel.focusOffset);
            var name = (typeof sel.getName == "function") ? sel.getName() : "Selection";

            if (typeof sel.rangeCount != "undefined") {
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    rangeInspects[i] = DomRange.inspect(sel.getRangeAt(i));
                }
            }
            return "[" + name + "(Ranges: " + rangeInspects.join(", ") +
                    ")(anchor: " + anchor.inspect() + ", focus: " + focus.inspect() + "]";
        }

        selProto.getName = function() {
            return "WrappedSelection";
        };

        selProto.inspect = function() {
            return inspect(this);
        };

        selProto.detach = function() {
            actOnCachedSelection(this.win, "delete");
            deleteProperties(this);
        };

        WrappedSelection.detachAll = function() {
            actOnCachedSelection(null, "deleteAll");
        };

        WrappedSelection.inspect = inspect;
        WrappedSelection.isDirectionBackward = isDirectionBackward;

        api.Selection = WrappedSelection;

        api.selectionPrototype = selProto;

        api.addShimListener(function(win) {
            if (typeof win.getSelection == "undefined") {
                win.getSelection = function() {
                    return getSelection(win);
                };
            }
            win = null;
        });
    });
    

    /*----------------------------------------------------------------------------------------------------------------*/

    // Wait for document to load before initializing
    var docReady = false;

    var loadHandler = function(e) {
        if (!docReady) {
            docReady = true;
            if (!api.initialized && api.config.autoInitialize) {
                init();
            }
        }
    };

    if (isBrowser) {
        // Test whether the document has already been loaded and initialize immediately if so
        if (document.readyState == "complete") {
            loadHandler();
        } else {
            if (isHostMethod(document, "addEventListener")) {
                document.addEventListener("DOMContentLoaded", loadHandler, false);
            }

            // Add a fallback in case the DOMContentLoaded event isn't supported
            addListener(window, "load", loadHandler);
        }
    }

    return api;
}, this);
/**
 * Selection save and restore module for Rangy.
 * Saves and restores user selections using marker invisible elements in the DOM.
 *
 * Part of Rangy, a cross-browser JavaScript range and selection library
 * https://github.com/timdown/rangy
 *
 * Depends on Rangy core.
 *
 * Copyright 2014, Tim Down
 * Licensed under the MIT license.
 * Version: 1.3.0-alpha.20140921
 * Build date: 21 September 2014
 */
(function(factory, root) {
    if (typeof define == "function" && define.amd) {
        // AMD. Register as an anonymous module with a dependency on Rangy.
        define(["./rangy-core"], factory);
    } else if (typeof module != "undefined" && typeof exports == "object") {
        // Node/CommonJS style
        module.exports = factory( require("rangy") );
    } else {
        // No AMD or CommonJS support so we use the rangy property of root (probably the global variable)
        factory(root.rangy);
    }
})(function(rangy) {
    rangy.createModule("SaveRestore", ["WrappedRange"], function(api, module) {
        var dom = api.dom;

        var markerTextChar = "\ufeff";

        function gEBI(id, doc) {
            return (doc || document).getElementById(id);
        }

        function insertRangeBoundaryMarker(range, atStart) {
            var markerId = "selectionBoundary_" + (+new Date()) + "_" + ("" + Math.random()).slice(2);
            var markerEl;
            var doc = dom.getDocument(range.startContainer);

            // Clone the Range and collapse to the appropriate boundary point
            var boundaryRange = range.cloneRange();
            boundaryRange.collapse(atStart);

            // Create the marker element containing a single invisible character using DOM methods and insert it
            markerEl = doc.createElement("span");
            markerEl.id = markerId;
            markerEl.style.lineHeight = "0";
            markerEl.style.display = "none";
            markerEl.className = "rangySelectionBoundary";
            markerEl.appendChild(doc.createTextNode(markerTextChar));

            boundaryRange.insertNode(markerEl);
            return markerEl;
        }

        function setRangeBoundary(doc, range, markerId, atStart) {
            var markerEl = gEBI(markerId, doc);
            if (markerEl) {
                range[atStart ? "setStartBefore" : "setEndBefore"](markerEl);
                markerEl.parentNode.removeChild(markerEl);
            } else {
                module.warn("Marker element has been removed. Cannot restore selection.");
            }
        }

        function compareRanges(r1, r2) {
            return r2.compareBoundaryPoints(r1.START_TO_START, r1);
        }

        function saveRange(range, backward) {
            var startEl, endEl, doc = api.DomRange.getRangeDocument(range), text = range.toString();

            if (range.collapsed) {
                endEl = insertRangeBoundaryMarker(range, false);
                return {
                    document: doc,
                    markerId: endEl.id,
                    collapsed: true
                };
            } else {
                endEl = insertRangeBoundaryMarker(range, false);
                startEl = insertRangeBoundaryMarker(range, true);

                return {
                    document: doc,
                    startMarkerId: startEl.id,
                    endMarkerId: endEl.id,
                    collapsed: false,
                    backward: backward,
                    toString: function() {
                        return "original text: '" + text + "', new text: '" + range.toString() + "'";
                    }
                };
            }
        }

        function restoreRange(rangeInfo, normalize) {
            var doc = rangeInfo.document;
            if (typeof normalize == "undefined") {
                normalize = true;
            }
            var range = api.createRange(doc);
            if (rangeInfo.collapsed) {
                var markerEl = gEBI(rangeInfo.markerId, doc);
                if (markerEl) {
                    markerEl.style.display = "inline";
                    var previousNode = markerEl.previousSibling;

                    // Workaround for issue 17
                    if (previousNode && previousNode.nodeType == 3) {
                        markerEl.parentNode.removeChild(markerEl);
                        range.collapseToPoint(previousNode, previousNode.length);
                    } else {
                        range.collapseBefore(markerEl);
                        markerEl.parentNode.removeChild(markerEl);
                    }
                } else {
                    module.warn("Marker element has been removed. Cannot restore selection.");
                }
            } else {
                setRangeBoundary(doc, range, rangeInfo.startMarkerId, true);
                setRangeBoundary(doc, range, rangeInfo.endMarkerId, false);
            }

            if (normalize) {
                range.normalizeBoundaries();
            }

            return range;
        }

        function saveRanges(ranges, backward) {
            var rangeInfos = [], range, doc;

            // Order the ranges by position within the DOM, latest first, cloning the array to leave the original untouched
            ranges = ranges.slice(0);
            ranges.sort(compareRanges);

            for (var i = 0, len = ranges.length; i < len; ++i) {
                rangeInfos[i] = saveRange(ranges[i], backward);
            }

            // Now that all the markers are in place and DOM manipulation over, adjust each range's boundaries to lie
            // between its markers
            for (i = len - 1; i >= 0; --i) {
                range = ranges[i];
                doc = api.DomRange.getRangeDocument(range);
                if (range.collapsed) {
                    range.collapseAfter(gEBI(rangeInfos[i].markerId, doc));
                } else {
                    range.setEndBefore(gEBI(rangeInfos[i].endMarkerId, doc));
                    range.setStartAfter(gEBI(rangeInfos[i].startMarkerId, doc));
                }
            }

            return rangeInfos;
        }

        function saveSelection(win) {
            if (!api.isSelectionValid(win)) {
                module.warn("Cannot save selection. This usually happens when the selection is collapsed and the selection document has lost focus.");
                return null;
            }
            var sel = api.getSelection(win);
            var ranges = sel.getAllRanges();
            var backward = (ranges.length == 1 && sel.isBackward());

            var rangeInfos = saveRanges(ranges, backward);

            // Ensure current selection is unaffected
            if (backward) {
                sel.setSingleRange(ranges[0], "backward");
            } else {
                sel.setRanges(ranges);
            }

            return {
                win: win,
                rangeInfos: rangeInfos,
                restored: false
            };
        }

        function restoreRanges(rangeInfos) {
            var ranges = [];

            // Ranges are in reverse order of appearance in the DOM. We want to restore earliest first to avoid
            // normalization affecting previously restored ranges.
            var rangeCount = rangeInfos.length;

            for (var i = rangeCount - 1; i >= 0; i--) {
                ranges[i] = restoreRange(rangeInfos[i], true);
            }

            return ranges;
        }

        function restoreSelection(savedSelection, preserveDirection) {
            if (!savedSelection.restored) {
                var rangeInfos = savedSelection.rangeInfos;
                var sel = api.getSelection(savedSelection.win);
                var ranges = restoreRanges(rangeInfos), rangeCount = rangeInfos.length;

                if (rangeCount == 1 && preserveDirection && api.features.selectionHasExtend && rangeInfos[0].backward) {
                    sel.removeAllRanges();
                    sel.addRange(ranges[0], true);
                } else {
                    sel.setRanges(ranges);
                }

                savedSelection.restored = true;
            }
        }

        function removeMarkerElement(doc, markerId) {
            var markerEl = gEBI(markerId, doc);
            if (markerEl) {
                markerEl.parentNode.removeChild(markerEl);
            }
        }

        function removeMarkers(savedSelection) {
            var rangeInfos = savedSelection.rangeInfos;
            for (var i = 0, len = rangeInfos.length, rangeInfo; i < len; ++i) {
                rangeInfo = rangeInfos[i];
                if (rangeInfo.collapsed) {
                    removeMarkerElement(savedSelection.doc, rangeInfo.markerId);
                } else {
                    removeMarkerElement(savedSelection.doc, rangeInfo.startMarkerId);
                    removeMarkerElement(savedSelection.doc, rangeInfo.endMarkerId);
                }
            }
        }

        api.util.extend(api, {
            saveRange: saveRange,
            restoreRange: restoreRange,
            saveRanges: saveRanges,
            restoreRanges: restoreRanges,
            saveSelection: saveSelection,
            restoreSelection: restoreSelection,
            removeMarkerElement: removeMarkerElement,
            removeMarkers: removeMarkers
        });
    });
    
}, this);
/**
 * @fileoverview jQuery wrapper around the Rich text editor
 * Usage:
 *  1) $(selector).Arte()
 *     Converts the matched elements into rich text editor using default options or returns and existing instance
 *  2) $(selector).Arte({ options });
 *     Converts the matched elements into rich text editor using the options supplied or returns and existing instance
 *  3) $(selector).Arte(command, arguments)
 *     Execute a rich text command with arguments
 */
(function($) {
    $.Arte = $.Arte || {};
    $.fn.Arte = function(options, args) {
        var result = [];
        rangy.init();
        this.each(function() {
            var $this = $(this);
            var editor = $this.data("Arte");
            if (options && typeof(options) === "string") {
                // Most likely this is a method call
                var methodName = options;
                if (this.constructor === $.Arte.TextArea) {
                    editor = this;
                }

                if (!editor) {
                    throw "This is not a rich text field.";
                }

                var returnValue = editor[methodName].call(editor, args);
                result.push(returnValue);
            } else {
                // If $this is not a rich text editor, construct the editor
                if (!editor) {
                    options = options || {};
                    options.element = this;
                    editor = new $.Arte.TextArea(options);
                    $this.data("Arte", editor);
                }
                result.push(editor);
            }
        });
        return $(result);
    };
})(jQuery);

/// dependencies: Arte.js
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.TextArea = function(options) {
        var me = this;
        var configuration = $.Arte.configuration;
        var constants = $.Arte.constants;

        // Backwards compatibility. Use _container instead.
        me.$element = $(options.element);
        me.element = me.$element.get(0);
        // The _container that contains the editable $el. It"s needed to deal with getting $el"s outer value.
        me._container = me.element;

        // Create a mix-in of the user provided values and configuration defined default values
        var initialValues = $.extend({}, configuration.initialValues, options);

        var eventNames = constants.eventNames;
        this.editorType = options.editorType || constants.editorTypes.richText;

        //Store the outer value for comparison of value changes
        this._currentOuterValue = "";

        //Timer used to check for changes to the value, selection, and focus of the textarea
        var pollTimer = null;

        var handleValueChange = function() {
            var newOuterValue = me._container.innerHTML;
            var oldOuterValue = me._currentOuterValue;

            if (newOuterValue !== oldOuterValue) {
                var contents = me.$el.contents();
                if ($.Arte.dom.hasUnsanctionedElements(contents)) {
                    var savedSelection;
                    if (isFocused) {
                        savedSelection = rangy.saveSelection();
                    }
                    $.Arte.dom.handleUnsanctionedElements(contents);
                    if (isFocused) {
                        rangy.restoreSelection(savedSelection);
                    }
                }
                me._currentOuterValue = me._container.innerHTML;
                me.triggerEvent(eventNames.onvaluechange, {
                    newValue: me.value(),
                    src: "internal"
                });
            }
        };

        // Uses polling to trigger value change as user can change the value of the text field in multiple ways.
        // for example (keyboard, IME input, paste, multi-stroke keyboard, and context menu).
        var startPollingForValueChange = function() {
            if (!pollTimer) {
                pollTimer = setInterval(handleValueChange, configuration.pollIntervalInMs);
            }
        };

        // Construct a dom element to host richtext editor
        if (!me.element.hasChildNodes()) {
            if (me.editorType === constants.editorTypes.richText) {
                me.el = document.createElement("div");
                me.el.setAttribute("contenteditable", "true");
            } else {
                me.el = document.createElement("textarea");
                me.el.style.height = "100%";
                me.el.style.width = "100%";
                me.el.style.padding = 0;
                me.el.style.border = 0;
            }
            me._container.appendChild(me.el);
            me.$el = $(me.el);
            // Use an existing DIV or TEXTAREA if it already exists
        } else {
            me.el = me._container.childNodes[0];
            if (me.el.tagName === "DIV") {
                me.el.setAttribute("contenteditable", "true");
            } else if (me.el.tagName !== "TEXTAREA") {
                throw new Error("Cannot make element editable");
            }
            me.$el = $(me.el);
        }

        me.$el.css(initialValues.styles);
        me.el.setAttribute("class", initialValues.classes.join(" "));
        me._container.setAttribute(configuration.textFieldIdentifier, "1");

        /*
         * Whether the element has the focus
         */
        var isFocused = false;

        /*
         * Listen for the dom events on the text area or the content editable element.
         */
        me.$el.on({
            keydown: function(e) {
                me.triggerEvent(eventNames.onkeydown, {
                    originalEvent: e
                });
                e.stopPropagation();
            },
            keyup: function(e) {
                me.triggerEvent(eventNames.onkeyup, {
                    originalEvent: e
                });
                e.stopPropagation();
            },
            keypress: function(e) {
                me.triggerEvent(eventNames.onkeypress, {
                    originalEvent: e
                });
                e.stopPropagation();
            },
            focus: function(e) {
                if (!isFocused) {
                    isFocused = true;
                    me.triggerEvent(eventNames.onfocus, {
                        originalEvent: e
                    });
                }
                startPollingForValueChange();
                e.stopPropagation();
            },
            blur: function(e) {
                handleValueChange(); // Flush any changes that occurred between the last poll and now.
                isFocused = false;
                me.triggerEvent(eventNames.onselectionchange);
                me.triggerEvent(eventNames.onblur, {
                    originalEvent: e
                });

                // Clear the value changed poll timer
                if (pollTimer) {
                    clearInterval(pollTimer);
                    pollTimer = null;
                }
                e.stopPropagation();
            },
            mouseup: function(e) {
                me.triggerEvent(eventNames.onselectionchange);
                me.triggerEvent(eventNames.onmouseup, {
                    originalEvent: e
                });
            },
            mousedown: function(e) {
                me.triggerEvent(eventNames.onmousedown, {
                    originalEvent: e
                });
            },
            click: function(e) {
                me.triggerEvent(eventNames.onclick, {
                    originalEvent: e
                });
            },
            paste: function(e) {
                setTimeout(function() {
                    me.triggerEvent(eventNames.onpaste, {
                        originalEvent: e
                    });
                }, 50);
            }
        });
        $.Arte.pluginManager.init(me);

        me.value(initialValues.value);

        $(me._container).on(options.on);
        me.triggerEvent(eventNames.oncreate);
    };

    $.extend($.Arte.TextArea.prototype, {
        // Get innerHtml of the contentEditable element
        "value": function(value) {
            var constants = $.Arte.constants;
            var prop = this.editorType === constants.editorTypes.richText ? "innerHTML" : "value";
            var currentValue = this.el[prop];

            if (typeof(value) === "undefined") {
                return currentValue;
            }

            if (currentValue === value) {
                return;
            }

            this.el[prop] = value;
            this._currentOuterValue = this._container.innerHTML;
            this.triggerEvent(constants.eventNames.onvaluechange, {
                newValue: value,
                src: "external"
            });
        },
        // Get outerHtml of the contentEditable element
        "outerValue": function(value) {
            if (typeof(value) === "undefined") {
                var clone = this.$element.clone();
                clone.children().removeAttr("contenteditable");
                return clone.html();
            }

            var newElement = $(value)[0];
            this.el.setAttribute("style", newElement.getAttribute("style") || "");
            this.el.setAttribute("class", newElement.getAttribute("class") || "");
            this.value(newElement.innerHTML);
        },
        "focus": function() {
            var me = this;
            var focusHandler = function() {
                me.$el.off("focus", focusHandler);
                $.Arte.util.moveCursorToEndOfElement(me.$el.get(0));
                me.triggerEvent($.Arte.constants.eventNames.onselectionchange);
            };
            me.$el.on("focus", focusHandler);
            me.$el.focus();
        },
        "triggerEvent": function(name, data) {
            this.$element.trigger(name, $.extend(data, {
                textArea: this
            }));
        },
        "destroy": function(options) {
            // Converts the rich text editor to non-editable state and remove rich text state information
            this.$element.removeData("Arte");
            this.$element.removeAttr($.Arte.configuration.textFieldIdentifier);
            this.$element.off();

            this.$el.off();
            this.$el.removeAttr("contentEditable");
            this.triggerEvent($.Arte.constants.eventNames.ondestroy);

            if (options && options.removeContent) {
                this.$element.empty();
            }
        },
        /**
         *  on/off methods to support attaching events handler using a rich text instance
         */
        on: function(type, handler) {
            this.$element.on(type, handler);
        },
        off: function(type, handler) {
            this.$element.off(type, handler);
        }
    });
})(jQuery);

/*
* This file lists the configuration and constants used by ArteJS
*/
(function($) {
    $.Arte = $.Arte || {};

    $.Arte.constants = {
        /*
        * Types of text editors
        */
        editorTypes: {
            richText: "richText",
            plainText: "plainText"
        },

        /*
        * Rich text command type
        */
        commandType: {
            inline: "inline", // command is applied to the selection. e.g. fontWeight, fontStyle
            block: "block", // command is applied to the full block. e.g align, h1
            complex: "complex", // Composite command: OL/UL
            other: "other" // command handles how it is applied. e.g. insert
        },

        /*
        * enumeration of the element types that Arte interacts with
        */
        nodeType: {
            ELEMENT: 1,
            ATTRIBUTE: 2,
            TEXT: 3,
            COMMENT: 8
        },

        /*
        * enumeration of the tags used by Arte
        */
        tagName: {
            LI: "LI",
            OL: "OL",
            UL: "UL",
            BR: "BR",
            DIV: "DIV",
            SPAN: "SPAN",
            P: "P",
            B: "B",
            I: "I",
            U: "U",
            STRONG: "STRONG",
            SUB: "SUB",
            SUP: "SUP",
            BLOCKQUOTE: "BLOCKQUOTE",
            H1: "H1",
            H2: "H2",
            H3: "H3",
            H4: "H4",
            H5: "H5",
            H6: "H6"
        },
        /*
        * List of events raised by Arte
        */
        eventNames: {
            "oninput": "oninput",
            "onfocus": "onfocus",
            "onblur": "onblur",
            "onvaluechange": "onvaluechange",
            "onmousedown": "onmousedown",
            "onmouseup": "onmouseup",
            "onclick": "onclick",
            "onkeydown": "onkeydown",
            "onkeypress": "onkeypress",
            "onkeyup": "onkeyup",
            "onpaste": "onpaste",
            "onselectionchange": "onselectionchange",
            "onbeforecommand": "onbeforecommand",
            "oncommand": "oncommand",
            "oncreate": "oncreate",
            "ondestroy": "ondestroy"
        },

        /*
        * commandAttrType specifies how the command is applied.  For example, by using tagName, styleName or className
        */
        commandAttrType: {
            tagName: "tagName",
            styleName: "styleName",
            className: "className",
            other: "other"  // for example, insert command
        }
    };

    var constants = $.Arte.constants;
    /*
    * Various default configuration options for Arte
    */
    $.Arte.configuration = {
        /*
        * Whether to perform a rich text operation when there is no user selection (for example, the cursor is not inside the text field).
        */
        requireFocus: true,

        /*
        * ClassNameSpace is pre-pended to the name of the class. (for example: classNameSpace-font-weight-bold)
        */
        classNameSpace: "arte",

        /*
        * Default attribute to use when applying a rich text command.
        * Options: See Arte.constants.commandAttrType
        */
        commandAttrType: constants.commandAttrType.styleName,

        /*
        * An attributed added to the dom element to identify that dom element as rich text field
        */
        textFieldIdentifier: "rteTextField",

        /*
        * Class applied to the selection markers by rangy library
        */
        rangySelectionBoundaryClassName: "rangySelectionBoundary",

        /*
        * Default tags to use when applying a rich text command
        * These can be over-ridden in the command configuration for each command
        */
        defaultInlineTag: constants.tagName.SPAN,
        defaultBlockTag: constants.tagName.P,

        /*
        * Interval at which to poll of value change of the rich text editor while the   editor is focused
        */
        pollIntervalInMs: 350,

        handleUnsanctionedTagsOnGetValue: true
    };

    /*
    * Set of initial values applied to rich text editor during creation
    */
    $.Arte.configuration.initialValues = {
        /*
        * Set of initial styles applied to rich text editor
        */
        styles: {
            "min-height": "200px",
            "height": "inherit"
        },

        /*
        * Collection of classes applied to rich text editor
        */
        classes: [],

        /*
        * Initial value of the text editor
        */
        value: "Please enter text ..."
    };

    var configuration = $.Arte.configuration;

    /*
    * ArteJS command configuration
    * Command configuration specifies how a command can be applied and how can we identify if that command has been applied
    */
    $.Arte.configuration.commands = {
        /*
        * Bold command be applied using a tag (B), a style (font-weight=bold), or a class (arte-font-weight-bold)
        * command configuration specifies how to apply command in each case
        */
        bold: {
            // Bold command is inline; it can be applied to a selection
            commandType: constants.commandType.inline,
            // The following three properties are used to identify if bold command is applied
            tagName: constants.tagName.B,
            styleName: "font-weight",
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-weight-[\\S]+"),
            // Default value to use when none is specified.
            defaultValue: {
                "styleName": "bold",
                "className": configuration.classNameSpace + "-font-weight-bold"
            },
            // Tag to use for each type of command applier
            applierTagName: {
                "tagName": constants.tagName.B,
                "className": constants.tagName.SPAN,
                "styleName": constants.tagName.SPAN
            },
            supportsPlainText: true
        },
        italic: {
            tagName: constants.tagName.I,
            applierTagName: {
                "tagName": constants.tagName.I,
                "className": constants.tagName.SPAN,
                "styleName": constants.tagName.SPAN
            },
            styleName: "font-style",
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-style-italic"),
            commandType: constants.commandType.inline,
            defaultValue: {
                styleName: "italic",
                className: configuration.classNameSpace + "-font-style-italic"
            },
            supportsPlainText: true
        },
        underline: {
            tagName: constants.tagName.U,
            applierTagName: {
                "tagName": constants.tagName.U,
                "className": constants.tagName.SPAN,
                "styleName": constants.tagName.SPAN
            },
            styleName: "text-decoration",
            classNameRegex: new RegExp(configuration.classNameSpace + "-text-decoration-[\\S]+"),
            commandType: constants.commandType.inline,
            defaultValue: {
                styleName: "underline",
                className: configuration.classNameSpace + "-text-decoration-underline"
            },
            supportsPlainText: true
        },
        // A command that can only be applied using a tag name
        blockquote: {
            tagName: constants.tagName.BLOCKQUOTE,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h1: {
            tagName: constants.tagName.H1,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h2: {
            tagName: constants.tagName.H2,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h3: {
            tagName: constants.tagName.H3,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h4: {
            tagName: constants.tagName.H4,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h5: {
            tagName: constants.tagName.H5,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        h6: {
            tagName: constants.tagName.H6,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        orderedList: {
            tagName: constants.tagName.OL,
            commandType: constants.commandType.complex,
            commandAttrType: constants.commandAttrType.tagName
        },
        unorderedList: {
            tagName: constants.tagName.UL,
            commandType: constants.commandType.complex,
            commandAttrType: constants.commandAttrType.tagName
        },
        subscript: {
            tagName: constants.tagName.SUB,
            commandType: constants.commandType.inline,
            commandAttrType: constants.commandAttrType.tagName
        },
        superscript: {
            tagName: constants.tagName.SUP,
            commandType: constants.commandType.inline,
            commandAttrType: constants.commandAttrType.tagName
        },
        _li: {
            tagName: constants.tagName.LI,
            commandType: constants.commandType.block,
            commandAttrType: constants.commandAttrType.tagName
        },
        insert: {
            tagName: constants.tagName.SPAN,
            commandType: constants.commandType.other,
            commandAttrType: constants.commandAttrType.other
        },
        // A command that accepts parameters, for example: the value to set as the font-size
        fontSize: {
            styleName: "font-size",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-size-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline,
            supportsPlainText: true
        },
        fontFamily: {
            styleName: "font-family",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-family-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline,
            supportsPlainText: true
        },
        color: {
            styleName: "color",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-font-color-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline,
            supportsPlainText: true
        },
        backgroundColor: {
            styleName: "background-color",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-background-color-[\\S]+"),
            applierTagName: constants.tagName.SPAN,
            commandType: constants.commandType.inline,
            supportsPlainText: true
        },
        textAlign: {
            styleName: "text-align",
            acceptsParams: true,
            classNameRegex: new RegExp(configuration.classNameSpace + "-text-align-[\\S]+"),
            applierTagName: constants.tagName.P,
            commandType: constants.commandType.block,
            supportsPlainText: true
        }
    };

    (function() {
        // Include the commandName in each command configuration
        $.each(configuration.commands, function(key, value) {
            value.commandName = key;
        });
    })();
})(jQuery);

/**
 * @fileoverview manages the plugins for Arte
 */
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.pluginManager = {
        plugins: {},
        /**
         * Register a plugin
         * @param {string} name of the plugin
         * @param {function} constructor function of the plugin
         */
        register: function(name, plugin) {
            this.plugins[name] = plugin;
        },
        /*
         * Initializes the plugin
         * @param {Arte} an instance of Arte
         */
        init: function(richTextEditor) {
            richTextEditor.pluginInstances = richTextEditor.pluginInstances || [];
            for (var pluginName in this.plugins) {
                var pluginInstanse = new this.plugins[pluginName]();
                pluginInstanse.init(richTextEditor);
                richTextEditor.pluginInstances.push(pluginInstanse);
            }
        }
    };
})(jQuery);

/// @dependencies: Arte.js, TextArea.js
/**
 * @fileoverview extends Arte prototype to add rich text commands
 */
(function() {
    var constants = $.Arte.constants;
    var configuration = $.Arte.configuration;
    /**
     * Reference to commandAttrType enumeration
     */
    var commandAttr = constants.commandAttrType;
    /**
     * Determine the command attribute using the options
     */
    var commandAttrType = function(commandName, options) {
        // commandAttrType is selected based on the following precedence
        // 1) As defined in the options
        // 2) Infer from the options
        // 3) Use default
        var commandConfig = configuration.commands[commandName];
        if (commandConfig.commandAttrType) {
            return commandConfig.commandAttrType;
        }

        var attrType = configuration.commandAttrType;
        if (!options) {
            return attrType;
        }

        if (options.commandAttrType) {
            attrType = options.commandAttrType;
        } else {
            if (options.styleName) {
                attrType = commandAttr.styleName;
            } else if (options.className) {
                attrType = commandAttr.className;
            } else if (options.tagName) {
                attrType = commandAttr.tagName;
            }
        }
        return attrType;
    };

    /*
     * Executes a rich text command
     */
    var exec = function(commandName, options) {
        var commandOptions = constructCommandOptions.call(this, commandName, options);

        commandOptions.execute = true;
        this.triggerEvent(constants.eventNames.onbeforecommand, commandOptions);

        if (!commandOptions.execute) { // The client requested the cancelation of this command
            return;
        }

        delete commandOptions.execute;
        $.Arte.RichTextCommandApplier.createAndExecute(commandOptions);
        this.triggerEvent(constants.eventNames.oncommand, commandOptions);
    };

    var getCommandValueOrDefault = function(commandName, attrType, options) {
        if (options && attrType === commandAttr.styleName && options.styleValue) {
            return options.styleValue;
        } else if (options && (attrType === commandAttr.className) && options.className) {
            return options.className;
        } else if (options && options.commandValue) {
            return options.commandValue;
        }

        if (typeof(options) === "string") { // Command value is passed as string.
            return options;
        }

        // If commandValue is not defined, try getting the default value for the command
        var defaultValue = configuration.commands[commandName].defaultValue;
        if (defaultValue) {
            return defaultValue[attrType];
        }
    };

    var getTagNameOrDefault = function(commandName, attrType, options) {
        if (options && options.tagName) {
            return options.tagName;
        }

        var commandConfig = configuration.commands[commandName];
        if (commandConfig.applierTagName) {
            // ApplierTagNames can be configured based on the commandAttrType
            return $.isPlainObject(commandConfig.applierTagName) ? commandConfig.applierTagName[attrType] : commandConfig.applierTagName;
        }

        if (commandConfig.tagName) {
            return commandConfig.tagName;
        }

        // Use the default block/inline tags
        return commandConfig.commandType === constants.commandType.inline ?
            configuration.defaultInlineTag : configuration.defaultBlockTag;
    };

    var constructCommandOptions = function(commandName, options) {
        var attr = commandAttrType(commandName, options);
        var commandConfig = configuration.commands[commandName];

        var commandOptions = {
            textArea: this,
            commandAttrType: attr,
            commandName: commandName,
            tagName: commandConfig.tagName,
            applierTagName: getTagNameOrDefault(commandName, attr, options)
        };

        var commandValue = getCommandValueOrDefault(commandName, attr, options);
        switch (attr) {
            case constants.commandAttrType.className:
                commandOptions.classNameRegex = commandConfig.classNameRegex;
                commandOptions.className = commandValue;
                break;
            case constants.commandAttrType.styleName:
                commandOptions.styleName = commandConfig.styleName;
                commandOptions.styleValue = commandValue;
                break;
        }

        return $.extend(options, commandOptions);
    };

    $.extend($.Arte.TextArea.prototype, {
        "bold": function(options) {
            exec.apply(this, ["bold", options]);
        },
        "italic": function(options) {
            exec.apply(this, ["italic", options]);
        },
        "underline": function(options) {
            exec.apply(this, ["underline", options]);
        },
        "blockquote": function() {
            exec.apply(this, ["blockquote"]);
        },
        "h1": function() {
            exec.apply(this, ["h1"]);
        },
        "h2": function() {
            exec.apply(this, ["h2"]);
        },
        "h3": function() {
            exec.apply(this, ["h3"]);
        },
        "h4": function() {
            exec.apply(this, ["h4"]);
        },
        "h5": function() {
            exec.apply(this, ["h5"]);
        },
        "h6": function() {
            exec.apply(this, ["h6"]);
        },
        "subscript": function() {
            exec.apply(this, ["subscript"]);
        },
        "superscript": function() {
            exec.apply(this, ["superscript"]);
        },
        "fontSize": function(options) {
            exec.apply(this, ["fontSize", options]);
        },
        "fontFamily": function(options) {
            exec.apply(this, ["fontFamily", options]);
        },
        "color": function(options) {
            exec.apply(this, ["color", options]);
        },
        "backgroundColor": function(options) {
            exec.apply(this, ["backgroundColor", options]);
        },
        "unorderedList": function(options) {
            exec.apply(this, ["unorderedList", options]);
        },
        "orderedList": function(options) {
            exec.apply(this, ["orderedList", options]);
        },
        "textAlign": function(options) {
            exec.apply(this, ["textAlign", options]);
        },
        // Apply the styles/classes to the content editable element
        "toggleStyleOnElement": function(options) {
            var element = options.element || this.$el;
            if (options && options.styleName) {
                var styles = $.Arte.dom.getStyles(element);
                if (options.styleValue === styles[options.styleName]) {
                    options.styleValue = "";
                }
                element.css(options.styleName, options.styleValue);
            }

            if (options && options.className) {
                var op = (element.hasClass(options.className)) ? "removeClass" : "addClass";
                element[op](options.className);
            }
        }
    });
})();

/**
 * @fileoverview: Various utility functions
 */
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.util = {
        /*
         * Ensure that if there is a user selection, it is inside of the selected element.
         */
        isSelectionInElement: function(jElement) {
            var selection = rangy.getSelection();
            var range = selection.getAllRanges()[0];
            return range &&
                (range.startContainer === jElement.get(0) || jElement.has(range.startContainer).length !== 0);
        },
        /*
         * Move cursor to the end of the input element
         * @param {htmlElement} element
         */
        moveCursorToEndOfElement: function(element) {
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
        all: function(collection, callback) {
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
        any: function(collection, callback) {
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
        filterCollection: function(collection, callback) {
            var result = [];
            $.each(collection, function(key, value) {
                if (callback(key, value)) {
                    result.push(collection.length ? value : key);
                }
            });
            return result;
        },
        /**
         * Returns selected text nodes
         */
        getSelectedTextNodes: function(allowCollapsedSelection) {
            var selectedNodes = $();
            var range;
            // Is there a user selection
            var userSelection = rangy.getSelection();
            var isSelectionInElement = $.Arte.util.isSelectionInElement(this.$el);

            // User selection is collapsed or the selection is not valid (i.e. something outside of the text field is selected)
            if (userSelection.isCollapsed || !isSelectionInElement) {
                if (allowCollapsedSelection && isSelectionInElement) {
                    // Get the parent of the node with the cursor
                    range = userSelection.getRangeAt(0);
                    selectedNodes.push(range.startContainer);
                    return selectedNodes;
                }

                // In case we don"t have a valid selection,
                range = rangy.createRangyRange();
                range.selectNodeContents(this.$el.get(0));
                selectedNodes = rangy.util.getTextNodes(range);
            } else if (isSelectionInElement) {
                // We have a valid selection
                range = userSelection.getAllRanges()[0];
                selectedNodes = rangy.util.getTextNodes(range);
            }
            return selectedNodes;
        },
        /*
         * Identify the ArteJS command configuration from className, styleName or tagName
         */
        getCommandConfig: function(options) {
            var result = null;
            var commandAttrType = null;
            var configuration = $.Arte.configuration;
            var constants = $.Arte.constants;
            var verifyTag = function(key, value) {
                return value === options.tagName;
            };

            if (options && options.commandName) {
                return configuration.commands[options.commandName];
            }

            /* Infer the command from the properties in the options. */
            for (var command in configuration.commands) {
                var commandConfig = configuration.commands[command];

                if (options.className && commandConfig.classNameRegex && commandConfig.classNameRegex.test(options.className)) {
                    result = commandConfig;
                    commandAttrType = constants.commandAttrType.className;
                } else if (options.styleName && options.styleName === commandConfig.styleName) {
                    result = commandConfig;
                    commandAttrType = constants.commandAttrType.styleName;
                } else if (options.tagName && !(options.className || options.styleName)) {
                    if ($.isPlainObject(commandConfig.tagName)) {
                        if ($.Arte.util.any(commandConfig.tagName, verifyTag)) {
                            result = commandConfig;
                        }
                    } else if (options.tagName === commandConfig.tagName) {
                        result = commandConfig;
                    }
                    commandAttrType = constants.commandAttrType.tagName;
                }
                if (result) {
                    return $.extend({
                        commandAttrType: commandAttrType
                    }, result);
                }
            }
            return null;
        }
    };
})(jQuery);

/**
 * @FileOverview: Dom clean up routines
 * depends on: jQuery-dom-traversal, jQuery-dom-manipulation
 */

(function($) {
    $.Arte = $.Arte || {};
    $.Arte.dom = $.Arte.dom || {};

    // Cache references
    var dom = $.Arte.dom;
    var configuration = $.Arte.configuration;
    var constants = $.Arte.constants;
    var util = $.Arte.util;

    $.extend(configuration, {
        /**
         * A set of tagNames to which a style/class can be styled.
         * If a tagName is not styleable, the styles/classes will be applied to all of its
         * children or the parent depending on the markup.
         */
        styleableTags: {
            SPAN: 1,
            DIV: 1,
            P: 1,
            LI: 1,
            UL: 1,
            OL: 1
        },
        supportedTags: {
            "P": 1,
            "UL": 1,
            "OL": 1,
            "LI": 1,
            "SPAN": 1,
            "BR": 1 // Chrome add BR to keep a space
        }
    });

    $.extend(configuration, {
        cleanup: {
            options: {
                removeNonPrintableCharacters: true,
                removeEmptyElements: true,
                removeRedundantMarkup: true,
                mergeAdjacentLists: true
            },

            invalidTagHandlers: {
                "B": {
                    applierTagName: "span",
                    styleName: "font-weight",
                    styleValue: "bold"
                },
                "I": {
                    applierTagName: "span",
                    styleName: "font-style",
                    styleValue: "italic"
                },
                "U": {
                    applierTagName: "span",
                    styleName: "text-decoration",
                    styleValue: "underline"
                },
                "DIV": {
                    applierTagName: "P"
                }
            },

            /**
             * During the cleanup phase, the elements with tagName specified with Key can be merged
             * with the parent element specified by the values.
             * For example, A SPAN can be merged with SPAN/DIV/P/LI while a LI can't be merged with anything
             */
            mergableTags: {
                SPAN: {
                    SPAN: 1,
                    DIV: 1,
                    P: 1,
                    LI: 1
                },
                DIV: {
                    DIV: 1,
                    P: 1,
                    LI: 1
                },
                P: {
                    DIV: 1,
                    P: 1,
                    LI: 1
                },
                LI: {},
                OL: {},
                UL: {},
                B: {
                    B: 1
                },
                U: {
                    U: 1
                },
                I: {
                    I: 1
                },
                STRONG: {
                    STRONG: 1
                },
                SUB: {
                    SUB: 1
                },
                SUP: {
                    SUP: 1
                },
                H1: {
                    H2: 1,
                    H3: 1,
                    H4: 1,
                    H5: 1,
                    H6: 1
                },
                H2: {
                    H1: 1,
                    H3: 1,
                    H4: 1,
                    H5: 1,
                    H6: 1
                },
                H3: {
                    H1: 1,
                    H2: 1,
                    H4: 1,
                    H5: 1,
                    H6: 1
                },
                H4: {
                    H1: 1,
                    H2: 1,
                    H3: 1,
                    H5: 1,
                    H6: 1
                },
                H5: {
                    H1: 1,
                    H2: 1,
                    H3: 1,
                    H4: 1,
                    H6: 1
                },
                H6: {
                    H1: 1,
                    H2: 1,
                    H3: 1,
                    H4: 1,
                    H5: 1
                }
            },

            /**
             * Collection of invalid characters and character ranges
             */
            invalidCharacterRegex: [
                "\u0000-\u001F", // Control Characters
                "\u0080-\u009F", // Latin-Supplement many control characters in this range
                "\u2000-\u200F", // Invisible Puntuation
                "\uE000-\uF8FF" // Private use
            ]
        }
    });

    var cleanupConfig = configuration.cleanup;

    var mergeLists = function(tagName, lists) {
        var filter = function(index, node) {
            return !$(node).is(":emptyTextOrRangySpan");
        };
        // Start from the last element in the list and start merging backward
        while (lists.length) {
            var currentList = $(lists[lists.length - 1]);
            lists.splice(lists.length - 1, 1);
            var prevNode = dom.prevSiblingIncludingTextNodes(currentList, filter);

            // If the previous element has same list tagName, merge both of these elements
            if (prevNode && prevNode.prop("tagName") === tagName) {
                // Move the current node's li children to previous node
                currentList.children().appendTo(prevNode);
                currentList.remove();
            }
        }
    };

    /**
     * Merge adjacent lists within the set of matched element
     * For example <ul><li>1</li><ul><ul><li>2</li></ul> => <ul><li>1</li><li>2</li></ul>
     */
    var mergeAdjacentLists = function(jNodes) {
        jNodes.each(function() {
            mergeLists(constants.tagName.OL, $(this).find(constants.tagName.OL));
            mergeLists(constants.tagName.UL, $(this).find(constants.tagName.UL));
        });
    };

    var seekDirection = {
        Next: 0,
        Prev: 1
    };
    /**
     * Get a next/prev mergable sibling such the sibling is an element with same tagName, styles, classes and is not block
     * @param {jElement} jQuery element to find the sibling of
     * @param {seekDirection} direction to navigate (Prev/Next)
     * @param {function}  function to provide filtering if finding next/prev elements
     * @return {jElement} next/prev element that is mergable
     */
    var getMergableSibling = function(jElement, direction, filter) {
        var result = $();
        var op = direction == seekDirection.Next ? "nextSiblingIncludingTextNodes" : "prevSiblingIncludingTextNodes";
        var adjacentElement = dom[op](jElement, filter);

        // check if the sibling element is mergable
        if (adjacentElement.length &&
                // Has an element sibling
                adjacentElement.is(":element") &&
                // Not a block element
                !adjacentElement.is(":block") &&
                // has same tag
                jElement.prop("tagName") === adjacentElement.prop("tagName") &&
                // has same style and class
                dom.hasSameStyleAndClass(jElement, adjacentElement)) {
            result.push(adjacentElement[0]);
        }
        return result;
    };

    /**
     * Get previous mergable sibling
     * @param {jNode} jQuery element to find the sibling of
     * @param {function}  function to provide filtering if finding next/prev elements
     * @return {jNode} next/prev element that is mergable
     */
    var prevMergableSibling = function(jElement, filter) {
        return getMergableSibling(jElement, seekDirection.Prev, filter);
    };

    /**
     * Get all of the non-empty and non-rangyspan nodes
     * @param {jNode} jQuery element to find the sibling of
     */
    var getContentNodes = function(jElement) {
        return jElement.contents().filter(function(index, node) {
            return !$(node).is(":emptyTextOrRangySpan");
        });
    };

    /*
     * bubbles the style from the children to the parent if possible
     * Example 1: <div><span style="color: black"> ABC </span></div> => <div style="color: black"><span>ABC</span></div>
     * Normalize the styles: Check if we can push the styles of this child node to the parent ($this).
     * Following are three cases to evaluate:
     * 1. if jElement has only once child, simply push all the styles up to the parent
     * 2. if jElement has multiple children and all children has same style, we should push those styles to the parent
     * 3. if any of the JElement's parents have the same style or class applied, remove it from jElement
     * @param {jElement} jElement
     */
    var bubbleStylesFromChildren = function(jElement, options) {
        var contentNodes = getContentNodes(jElement);

        // If we can't apply styles to jElement, don't process further
        if (!configuration.styleableTags[jElement.prop("tagName")]) {
            return false;
        }

        var candidateNodes = contentNodes.filter(function() {
            return $(this).is(":element"); // Only evaluate non-text
        });

        candidateNodes.each(function() {
            var $this = $(this);
            var styles = dom.getStyles($this);
            var classes = dom.getClasses($this);

            if (contentNodes.length === 1) {
                // jElement has only single child, simply apply the push all the styles to $this
                $.each(styles, function(styleName, styleValue) {
                    jElement.css(styleName, styleValue);
                    $this.css(styleName, "");
                });

                $.each(classes, function(index, className) {
                    var commandConfig = util.getCommandConfig({
                        className: className
                    });
                    if (commandConfig && commandConfig.classNameRegex) {
                        dom.removeClassWithPattern(jElement, commandConfig.classNameRegex);
                    }
                    jElement.addClass(className);
                    contentNodes.removeClass(className);
                });
            } else {
                // jElement has 1+ children,
                $.each(styles, function(styleName, styleValue) {
                    var commandConfig = util.getCommandConfig({
                        styleName: styleName
                    });
                    var styleOptions = {
                        commandName: commandConfig.commandName,
                        styleName: styleName,
                        styleValue: styleValue,
                        topEditableParent: options.topEditableParent
                    };
                    // If all of the children have a style value applied, push it to the node
                    if (dom.closestWithCommandValue(contentNodes, styleOptions).length === contentNodes.length) {
                        // All of the nodes have the styles applied
                        jElement.css(styleName, styleValue);
                        contentNodes.css(styleName, "");
                    }
                });
                $.each(classes, function(index, className) {
                    // If all of the contentNodes have a class, push it to the parent and remove it from all contentNodes
                    if (dom.allHaveClass(contentNodes, className)) {
                        var commandConfig = util.getCommandConfig({
                            className: className
                        });
                        if (commandConfig.classNameRegex) {
                            dom.removeClassWithPattern(jElement, commandConfig.classNameRegex);
                        }
                        jElement.addClass(className);
                        contentNodes.removeClass(className);
                    }
                });
            }
        });
    };

    /*
     * Merge the non-block element children of jElement
     * If two siblings have same class and styles merge them
     */
    var mergeChildren = function(jElement) {
        var contentNodes = getContentNodes(jElement);
        for (var i = 1; i < contentNodes.length; i++) {
            var $current = $(contentNodes[i]);
            if (!$current.is(":element") || $current.is(":block")) {
                continue;
            }

            var prev = prevMergableSibling($current);
            if (prev.get(0)) {
                prev.append($current.contents());
                $current.remove();
            }
        }
    };

    /**
     * Remove the redundant child markup.
     * 1) Non-block children => remove the markup if all the styles/classes are applied
     * 2) A single block child => remove the markup if the parent and child tags can be merged
     * 3) Mix of block/non-block children => remove the markup of non-block children all the styles/classes are applied
     * 4) otherwise no-op
     */
    var mergeChildrenWithSelf = function(node, options) {
        var contentNodes = getContentNodes(node);
        var candidateNodes = contentNodes.filter(function() {
            //Find out which nodes are candidates for evaluation to merge up with the parent
            // don't evaluate the text nodes or the block nodes with siblings
            var $this = $(this);
            var mergableTags = cleanupConfig.mergableTags[$this.prop("tagName")];

            return $this.is(":element") &&
                (!$this.is(":block") || contentNodes.length === 1) && // The only block child
                mergableTags && mergableTags[node.prop("tagName")]; // Merge only whitelisted element types
        });

        candidateNodes.each(function() {
            // Try to merge the child and parent;
            var $this = $(this);
            var styles = dom.getStyles($this);
            var classes = dom.getClasses($this);

            // check if the content nodes's style are applied by some parent
            // if so, we can simply unwrap the child
            var allStylesApplied = util.all(styles, function(styleName, styleValue) {
                var commandConfig = util.getCommandConfig({
                    styleName: styleName
                });
                var parentWithStyle = dom.closestWithCommand($this.parent(), {
                    commandName: commandConfig.commandName,
                    styleName: styleName
                });
                return parentWithStyle.get(0) && (dom.getStyles(parentWithStyle)[styleName] === styleValue);
            });

            var parents = $this.parentsUntil(options.topEditableParent.parentNode);
            var allClassesApplied = util.all(classes, function(index, className) {
                return parents.hasClass(className);
            });

            if (allStylesApplied && allClassesApplied) {
                $this.contents().first().unwrap();
                return;
            }
        });
    };

    /***/
    var removeRedundantStylesfromParent = function(jElement, options) {
        var contentNodes = getContentNodes(jElement);
        // If parent has a style that is applied to all of the children, remove it
        var styles = dom.getStyles(jElement);
        $.each(styles, function(styleName, styleValue) {
            var removeStyle = util.all(contentNodes, function(index, contentNode) {
                return dom.getStyles($(contentNode))[styleName];
            }) || dom.closestWithCommandValue(jElement.parent(), {
                styleName: styleName,
                styleValue: styleValue,
                topEditableParent: options.topEditableParent
            }).length > 0;

            if (removeStyle) {
                jElement.css(styleName, "");
            }
        });

        // If parent has a class that is applied to all of th children, remove it
        var classes = dom.getClasses(jElement);
        $.each(classes, function(index, className) {
            var commandConfig = util.getCommandConfig({
                className: className
            });
            var allNodesHaveClass = commandConfig && commandConfig.classNameRegex && util.all(contentNodes, function(index, contentNode) {
                return dom.hasClassWithPattern($(contentNode), commandConfig.classNameRegex);
            }) || jElement.parents().hasClass(className);
            if (allNodesHaveClass) {
                jElement.removeClass(className);
            }
        });
    };

    /**
     * Cleanup Dom recursively (depth first) using the following steps for each element
     * 1) Move styles from the children to the parent element
     * 2) Remove redundant styles from the element
     * 3) Merge the children
     * 4) Unwrap the children
     */
    var removeRedundantMarkup = function(jNodes, options) {
        jNodes.each(function() {
            // Do not merge with the content editable element or the text nodes with the parent
            var $this = $(this);
            if (!$this.is(":element")) {
                return;
            }

            var nodes = getContentNodes($this);
            removeRedundantMarkup(nodes, options);

            // Step 1: Push the styles towards the top
            bubbleStylesFromChildren($this, options);

            // Step 2: If the parent has a style that is explicitly applied to all of its children, remove the style from the parent
            removeRedundantStylesfromParent($this, options);

            // Step 3: Try to merge all of the siblings
            mergeChildren($this, options);

            // Step 4: Check if we can merge any of the children with the parent node by removing the redundant html
            mergeChildrenWithSelf($this, options);
        });
    };

    var processEmptyElement = function(jNode) {
        var parent = jNode.parent();
        if (jNode.is(":block") &&
            dom.nextSiblingIncludingTextNodes(jNode).length &&
            dom.prevSiblingIncludingTextNodes(jNode).length) {
            // If a div has next and prev, empty div is acting like a line break
            // add a line break.
            jNode.before("<br />");
        }
        jNode.remove();
        if (parent.is(":empty")) {
            processEmptyElement(parent);
        }
    };

    /*
     * Clean up: Recursively remove the empty elements until there are not empty elements left
     * For example: <div> <div> <div> </div> </div> </div>
     */
    var removeEmptyElements = function(jNodes) {
        // Exclude the <br/> and rangy selection marker spans
        var emptyElements = jNodes.find(":empty").not("br").not(":rangySpan");
        emptyElements.each(function() {
            processEmptyElement($(this));
        });
    };

    /**
     * If rangy selection marker span is the only child of some element, remove that element
     */
    var handleRangySelectionMarkers = function(jNodes) {
        jNodes.find("." + configuration.rangySelectionBoundaryClassName).each(function() {
            if ($(this).parent().contents().length === 1) {
                $(this).unwrap();
            }
        });
    };

    /**
     * Remove the empty characters from the HTML dom.
     */
    var invalidCharacterRegex;
    var removeNonPrintableCharacters = function(options) {
        var html = options.topEditableParent.innerHTML;
        invalidCharacterRegex = invalidCharacterRegex || new RegExp("[" + cleanupConfig.invalidCharacterRegex.join("") + "]", "g");
        options.topEditableParent.innerHTML = html.replace(invalidCharacterRegex, "");
    };

    /**
     * Remove any redundant markup
     */
    var cleanup = function(jNodes, options) {
        options = $.extend({}, cleanupConfig.options, options);
        if (!options.topEditableParent) {
            options.topEditableParent = dom.getTopEditableParent(jNodes).get(0);
        }
        handleRangySelectionMarkers(jNodes);
        if (options.removeNonPrintableCharacters) {
            removeNonPrintableCharacters(options);
        }
        if (options.removeEmptyElements) {
            removeEmptyElements(jNodes);
        }
        if (options.mergeAdjacentLists) {
            mergeAdjacentLists(jNodes);
        }
        if (options.removeRedundantMarkup) {
            removeRedundantMarkup(jNodes, options);
        }
    };

    /*
     * Check if there are any unsanctioned tags
     */
    var hasUnsanctionedElements = function(jNodes) {
        for (var i = 0; i < jNodes.length; i++) {
            var node = jNodes[i];
            if (node.nodeType == $.Arte.constants.nodeType.TEXT) {
                continue;
            }
            if (!configuration.supportedTags[node.tagName]) {
                return true;
            }
            if (hasUnsanctionedElements($(node).contents())) {
                return true;
            }
        }
        return false;
    };

    /*
     * Remove all unsanctioned tags
     */
    var handleUnsanctionedElements = function(jNodes) {
        jNodes.each(function() {
            if (this.nodeType == $.Arte.constants.nodeType.TEXT) {
                return;
            }

            var $this = $(this);
            handleUnsanctionedElements($this.contents());

            var tagName = this.tagName;
            if (configuration.supportedTags[tagName]) { // Current tag is supported; do nothing
                return;
            }

            // Unsupported tags, construct a replacement node
            var invalidTagHandlerConfig = cleanupConfig.invalidTagHandlers[tagName] || {
                tagName: "P" /* Just wrap the content in a P tag*/
            };
            var newNode = $.Arte.dom.createContainer(invalidTagHandlerConfig).html($this.html());
            $this.replaceWith(newNode);
        });
    };

    // Public API
    dom.hasUnsanctionedElements = hasUnsanctionedElements;
    dom.handleUnsanctionedElements = handleUnsanctionedElements;
    dom.cleanup = cleanup;

})(jQuery);

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
                    return !$(node).is(":emptyTextOrRangySpan");
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
        emptyText: function(element) {
            return element.nodeType === 3 && (element.nodeValue.match(/^\s*$/ig) !== null);
        },
        rangySpan: function(element) {
            return $(element).hasClass(configuration.rangySelectionBoundaryClassName);
        },
        emptyTextOrRangySpan: function(element) {
            var $element = $(element);
            return $element.is(":emptyText") || $element.is(":rangySpan");
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
                        return !$(node).is(":emptyText");
                    };
                    var thisContent = jNode1.contents().filter(noEmptyTextNodesFilter);
                    var thatContent = jNode2.contents().filter(noEmptyTextNodesFilter);

                    // has same child count
                    isEqual = thisContent.length === thatContent.length;

                    for (var i = 0, l = thisContent.length; i < l && isEqual; i++) {
                        isEqual = thisContent[i].nodeType === 3 ?
                            $.trim(thisContent[i].nodeValue) === $.trim(thatContent[i].nodeValue) :
                            $.Arte.dom.isEqual($(thisContent[i]), $(thatContent[i]));
                    }
                }
            } else {
                isEqual = false;
            }

            return isEqual;
        }
    });

})(jQuery);

rangy.createModule("BlockElementApplier", ["WrappedSelection", "WrappedRange"], function(api) {
    var dom = $.Arte.dom;
    var constants = $.Arte.constants;

    /**
     * An object to holde the result of block surround test operation
     */
    var blockSurroundState = function() {
        this.Surrounded = 0; // All of the blocks in the range are surrounded
        this.UnSurrounded = 1; // All of the blocks in the range are not surrounded
        this.Mixed = 2; // Some of the blocks in the range are surrounded
        this.Invalid = 3; // Invalid State

        this.surroundedIndexes = []; // collection of surrounded ranges
        this.unSurroundedIndexes = []; // collection of unsurrounded ranges

        this._state = "";
        this.computeState = function() {
            // All surrounded
            if (this.surroundedIndexes.length && !this.unSurroundedIndexes.length) {
                this._state = this.Surrounded;
                // All un-surrounded
            } else if (this.unSurroundedIndexes.length && !this.surroundedIndexes.length) {
                this._state = this.UnSurrounded;
                // Some are surrounded and some are not surrounded
            } else if (this.surroundedIndexes.length && this.unSurroundedIndexes.length) {
                this._state = this.Mixed;
                // Something weird happened
            } else {
                this._state = this.Invalid;
            }
            return this._state;
        };

        this.state = function(newState) {
            if (newState) {
                this._state = newState;
            }
            if (!this._state) {
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
    function areRangesBlockSurrounded(ranges, options) {
        var rangeCount = ranges.length;
        var surroundState = new blockSurroundState();
        var nodesByRange = getTopNodesFromRanges(ranges);
        var bucket;

        for (var i = 0; i < rangeCount; i++) {
            bucket = (dom.closestWithCommandValue(nodesByRange[i], options).length > 0) ?
                    surroundState.surroundedIndexes :
                    surroundState.unSurroundedIndexes;
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
    function isBlockSetSurrounded(ranges, blockOptions) {
        // Check if all of the ranges are surrounded by LI.
        var surroundState = areRangesBlockSurrounded(ranges, {
            tagName: constants.tagName.LI,
            commandAttrType: blockOptions.commandAttrType,
            topEditableParent: blockOptions.topEditableParent
        });

        // Make sure in case all the ranges are surrounded, they are surrounded by same list parent;
        // if not, change the state to Mixed
        // In case there are two lists next to each other
        if (surroundState.state() === surroundState.Surrounded) {
            var listElements = $();
            $.each(ranges, function(index, range) {
                var li = $(rangy.util.getTopNodes(range.getNodes())).closest(constants.tagName.LI);
                listElements.push(li.get(0));
            });

            if (!dom.hasSameListParent(listElements)) {
                // Check if all of the list element are part of same list
                // Mixed State => <ol> <li> first </li> </ol> <ol> <li> second </li> <ol>
                surroundState.state(surroundState.Mixed);
            } else {
                // Check if the list tag is not the one we want
                var parent = listElements.first().parent();
                if (parent.prop("tagName") !== blockOptions.applierTagName.toUpperCase()) {
                    surroundState.state(surroundState.UnSurrounded);
                }
            }
        }
        return surroundState;
    }

    /*
     * Given a range and a list, determent how many list items are before, inside and after the range
     */
    function getSelectedListElements(jListParent, blockOptions) {
        var jListElement = jListParent.children();

        // construct a list of nodes that are after and before the selection
        var beforeSelection = $();
        var selection = $();
        var afterSelection = $();
        var target = beforeSelection;

        jListElement.each(function() {
            if (blockOptions.originalRange.intersectsNode(this)) {
                target = afterSelection;
                selection.push(this);
                return true;
            }
            target.push(this);
            return true;
        });

        return {
            tagName: jListParent.prop("tagName"),
            beforeSelection: beforeSelection,
            selection: selection,
            afterSelection: afterSelection
        };
    }

    /**
     * Gets nodes from ranges
     * Note that once the dom is manipulated, the ranges are no longer valid
     * @param {[rangyRanges]} ranges
     * @return object with nodeIndex -> [nodes in the range] mapping
     */
    function getTopNodesFromRanges(ranges) {
        var nodeCollection = {};
        var func = function() {
            nodeCollection[i].push(this);
        };

        for (var i = 0; i < ranges.length; i++) {
            nodeCollection[i] = $();
            $(rangy.util.getTopNodes(ranges[i].getNodes())).each(func);
        }
        return nodeCollection;
    }

    /*
     * If there are partially selected lists at the begining or end of selection, properly close the
     * non selected list elements.
     */
    function closeListsAroundSelection(splitRanges, blockOptions) {
        var blockSurroundedResult = blockOptions.blockSurroundState;

        var wrapUnselectedListItems = function(selectionResult) {
            var wrapWithBlock = dom.wrapWithBlock;
            // close the list before and after the selection
            wrapWithBlock(selectionResult.beforeSelection, {
                applierTagName: selectionResult.tagName
            });
            wrapWithBlock(selectionResult.afterSelection, {
                applierTagName: selectionResult.tagName
            });
        };

        var evaluateSelection = function(selectedElement) {
            var parent = selectedElement.closest(constants.tagName.LI).parent();
            var selectionResult = getSelectedListElements(parent, blockOptions);
            return {
                parent: parent,
                selectionResult: selectionResult
            };
        };

        // Check if the first and/or the last range is surrounded
        var selectionBegin;
        if (blockSurroundedResult.surroundedIndexes[0] === 0) { // first block in the range is surrounded
            selectionBegin = evaluateSelection($(splitRanges[0].startContainer));
        }

        var rangeCount = splitRanges.length;
        var selectionEnd;

        // Last block in the range is surrounded
        if (blockSurroundedResult.surroundedIndexes[blockSurroundedResult.surroundedIndexes.length - 1] === rangeCount - 1) {
            selectionEnd = evaluateSelection($(splitRanges[rangeCount - 1].startContainer));
        }

        // If the first or the last range is surrounded, remove the selected List elements and properly close the lists
        if (selectionBegin) {
            dom.unwrapWithOptions(selectionBegin.parent);
            wrapUnselectedListItems(selectionBegin.selectionResult);
        }

        if (selectionEnd && (!selectionBegin || (selectionBegin.parent[0] !== selectionEnd.parent[0]))) {
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
    function surroundRangeSet(splitRanges, blockOptions) {
        var blockSurroundedResult = blockOptions.blockSurroundState;
        var nodesByBlockRange = getTopNodesFromRanges(splitRanges);
        var wrappedNodes = $();

        closeListsAroundSelection(splitRanges, blockOptions);
        // Create mapping lookup table
        var rangeLookup = {};
        $.each(blockSurroundedResult.surroundedIndexes, function() {
            rangeLookup[this] = 1;
        });

        var addToWrappedNodes = function() {
            wrappedNodes.push(this);
        };

        // Handle the selected elements
        var rangeCount = splitRanges.length;
        for (var i = 0; i < rangeCount; i++) {
            var nodeContainer;
            if (!rangeLookup[i]) {
                // If a selection includes a empty line (ex. <br/>some text) a rangy
                // selection span gets inserted at the  beginning of the block tag
                // in this case we don't want to wrap this into a block.
                if (nodesByBlockRange[i][0].nodeType == 3 && nodesByBlockRange[i][0].nodeValue.charCodeAt(0) == 65279) {
                    continue;
                }

                nodeContainer = dom.wrapWithBlock(nodesByBlockRange[i], {
                    applierTagName: constants.tagName.LI,
                    topEditableParent: blockOptions.topEditableParent
                });
                wrappedNodes.push(nodeContainer[0]);
            } else {
                // Skip over the nodes that we already unwrapped
                var node = nodesByBlockRange[i].first().closest(constants.tagName.LI);
                if (!(node.parents(constants.tagName.OL)[0] || node.parents(constants.tagName.UL)[0])) {
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
    function unSurroundRangeSet(splitRanges, blockOptions) {
        var jParent = $(splitRanges[0].startContainer).closest(constants.tagName.LI).parent();
        var parentTag = jParent.prop("tagName");

        var selectedLIs = getSelectedListElements(jParent, blockOptions);

        // Remove the ul/ol parent
        dom.unwrapWithOptions(jParent);

        // close the list before the selection
        dom.wrapWithOptions(selectedLIs.beforeSelection, {
            applierTagName: parentTag
        });

        // for these nodes, we want to remove the list tags
        dom.unwrapWithOptions(selectedLIs.selection, {
            "insertBr": true,
            "maintainStyles": true
        });

        // close the list after the selection
        dom.wrapWithOptions(selectedLIs.afterSelection, {
            applierTagName: parentTag
        });
    }

    /**
     * Given a set of selections and content ranges, expand the selection ranges to block level elements
     * @param {rangyRange} selectionRange
     * @param {rangyRange} contentRange
     * @return expanded range
     */
    function expandRange(selectionRange, topEditableParent) {
        if (!topEditableParent) {
            return selectionRange;
        }

        var contentEditableRange = rangy.createRangyRange();
        contentEditableRange.selectNodeContents(topEditableParent);
        //Get all ranges within contentRange
        var blocks = contentEditableRange.splitByBlock();
        var clonedSelectionRange = selectionRange.cloneRange();

        //Loop through blocks and find intersections with selection
        for (var i = 0, l = blocks.length; i < l; i++) {
            if (clonedSelectionRange.intersectsRange(blocks[i])) {
                //if begging of the selection is inside the current block, expend the begging of selection to the begging of the block
                if (blocks[i].comparePoint(clonedSelectionRange.startContainer, clonedSelectionRange.startOffset) === 0) {
                    clonedSelectionRange.setStart(blocks[i].startContainer, blocks[i].startOffset);
                }
                //otherwise if end of the selection is inside the current block, expend the end of selection to the end of the block
                if (blocks[i].comparePoint(clonedSelectionRange.endContainer, clonedSelectionRange.endOffset) === 0) {
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
    function toggleSurroundRangeSet(range, options) {
        var blockOptions = new $.Arte.ElementApplierOptions(options);

        var expandedRanges = expandRange(range, options.topEditableParent);

        blockOptions.originalRange = expandedRanges;
        var splitRanges = expandedRanges.splitByBlock();
        var surroundState = isBlockSetSurrounded(splitRanges, blockOptions);
        blockOptions.blockSurroundState = surroundState;

        if (surroundState.state() === surroundState.UnSurrounded ||
            surroundState.state() === surroundState.Mixed) {
            surroundRangeSet(splitRanges, blockOptions);
        } else if (surroundState.state() === surroundState.Surrounded) {
            unSurroundRangeSet(splitRanges, blockOptions);
        }
    }

    /**
     * Toggle surround a selection with list element
     * @param {[rangyRanges]} splitRanges
     * @param {blockSurroundOptions} blockOptions
     * @return an array of new ranges
     */
    function toggleSurroundSelectionSet(options, topEditableParent) {
        var blockOptions = new $.Arte.ElementApplierOptions(options, topEditableParent);
        var selection = rangy.getSelection();
        var range = selection.getRangeAt(0);
        if (range) {
            toggleSurroundRangeSet(range, blockOptions);
        }
    }

    /**
     * Toggle surround each range in split ranges
     * @param {[rangyRanges]} splitRanges
     * @param {blockSurroundOptions} blockOptions
     * @return an array of new ranges
     */
    function toggleSurroundRange(range, options) {
        if (range.isCollapsed) {
            return;
        }

        var blockOptions = new $.Arte.ElementApplierOptions(options);

        var expandedRange = expandRange(range, options.topEditableParent);

        var splitRanges = expandedRange.splitByBlock();
        var surroundState = areRangesBlockSurrounded(splitRanges, blockOptions);
        var nodesByRange = getTopNodesFromRanges(splitRanges);

        // Iterate over each range and surround the content of the range with a block level element
        for (var rangeIndex in nodesByRange) {
            var jNodes = nodesByRange[rangeIndex];
            if (surroundState.state() == surroundState.Surrounded) {
                dom.unwrapBlock(jNodes, blockOptions);
            } else {
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
    function toggleSurroundSelection(options, topEditableParent) {
        var blockOptions = new $.Arte.ElementApplierOptions(options, topEditableParent);
        var selection = rangy.getSelection();
        var range = selection.getRangeAt(0);
        if (range) {
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

(function($) {
    $.Arte = $.Arte || {};
    $.Arte.ElementApplierOptions = function(initOptions) {
        if (initOptions._isProcessed) {
            // Options object is already processed
            return initOptions;
        }

        var constants = $.Arte.constants;
        this.tagName = "";
        this.topEditableParent = "";
        this.commandName = "";
        this.commandAttrType = initOptions.commandAttrType;
        this.textArea = null;
        switch (this.commandAttrType) {
            case constants.commandAttrType.className:
                this.classNameRegex = "";
                this.className = "";
                break;
            case constants.commandAttrType.styleName:
                this.styleName = "";
                this.styleValue = "";
                break;
        }

        for (var prop in initOptions) {
            this[prop] = initOptions[prop];
        }

        if (this.tagName) {
            this.tagName = $("<" + this.tagName + ">").prop("tagName");
        }

        this.attr = {};
        if (this.commandAttrType == constants.commandAttrType.className) {
            this.attr["class"] = this.className;
        }

        if (this.commandAttrType == constants.commandAttrType.styleName) {
            // Construct a style string, so that we can easily apply/remove this from an element
            var div = $("<div>").css(this.styleName, this.styleValue);
            this.attr.style = div[0].style.cssText;
        }

        if (!this.commandName) {
            var commandConfig = $.Arte.util.getCommandConfig(this);
            if (commandConfig) {
                this.commandName = commandConfig.commandName;
                this.commandAttrType = commandConfig.commandAttrType;
            }
        }

        // Adding a field so that we don't do this multiple times.
        this._isProcessed = true;
    };
})(jQuery);

$(document).ready(function() {
    //Make sure that rangy is initialized first.
    rangy.init();
    //Function that takes a given range, and finds all the blocks inside of it.
    //Block is something that is surrounded by a block element on either side.
    //Returns an array of ranges where each range represents all of the text nodes
    //inside a one block element.
    rangy.rangePrototype.splitByBlock = function() {
        var blockRanges = [];
        //clone current range just in case.
        var range = this.cloneRange();
        if (range.collapsed) {
            return range;
        }
        //get all non-empty text nodes from the range as well as all block elements and line breaks
        var nodes = range.getNodes([3, 1], function(node) {
            return isBlockOrLineBreak(node) || (node.nodeType === 3 && !isWhitespaceNode(node));
        });
        var tempRange;
        var currentTopNode = null;
        //loop through the collection of text nodes removing them when we find a new range
        while (nodes.length > 0) {
            //If this is a block element. Skip over it
            if (nodes[0].nodeType === 1) {
                if (!(currentTopNode && $(currentTopNode).has(nodes[0]).length)) {
                    currentTopNode = nodes[0];
                }
                nodes.splice(0, 1);
                continue;
            } else if (currentTopNode && !$(currentTopNode).has(nodes[0]).length) {
                currentTopNode = null;
            }

            //Node has siblings or it's parent is not a block level element
            if (nodes[0].parentNode.childNodes.length > 1 || !isBlockOrLineBreak(getTopParentWithSingleChild(nodes[0]))) {
                //Create a new temporary range.
                tempRange = rangy.createRangyRange();
                tempRange.setStartBefore(nodes[0]);
                for (var i = 0, l = nodes.length; i < l; i++) {
                    //If this is a block element. Skip over it
                    if (nodes[i].nodeType === 1) {
                        continue;
                    }
                    if (isBlockOrLineBreak(nodes[i].nextSibling) ||
                        (!nodes[i].nextSibling && isBlockOrLineBreak(nodes[i].parentNode)) ||
                        (nodes[i + 1] && isBlockOrLineBreak(nodes[i + 1]))) {
                        tempRange.setEndAfter(nodes[i]);
                        break;
                    }

                    // Is the next node within the block parent
                    if (currentTopNode && !$(currentTopNode).has(nodes[i + 1]).length) {
                        tempRange.setEndAfter(nodes[i]);
                        break;
                    }
                }
                //If we didn't find any block elements (i.e. begging of the range is the same as the end)
                //Then set the end to the very last element in the list
                if (tempRange.startContainer === tempRange.endContainer && tempRange.startOffset === tempRange.endOffset) {
                    i--;
                    tempRange.setEndAfter(nodes[i]);
                }
                blockRanges.push(tempRange);
                nodes.splice(0, i + 1);
            } else {
                // Doesn't have siblings
                if (isBlockOrLineBreak(getTopParentWithSingleChild(nodes[0]))) {
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
    var collectTextNodes = function(element, texts) {
        for (var child = element.firstChild; child !== null; child = child.nextSibling) {
            if (child.nodeType === 3) {
                texts.push(child);
            } else if (child.nodeType === 1) {
                collectTextNodes(child, texts);
            }
        }
    };

    var getTopNodes = function(nodes) {
        var newNodeCollection = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var foundParent = false;
            for (var j = 0, len = nodes.length; j < len; j++) {
                //if current node is a child of any other node in the list, skip over it
                if ($.contains(nodes[j], nodes[i])) {
                    foundParent = true;
                    break;
                }
            }
            if (!foundParent) {
                newNodeCollection.push(nodes[i]);
            }
        }
        return newNodeCollection;
    };

    var getTopParentWithSingleChild = function(node) {
        if (node.parentNode.childNodes.length === 1) {
            return getTopParentWithSingleChild(node.parentNode);
        } else {
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
    var isWhitespaceNode = function(node) {
        if (!node || node.nodeType != 3) {
            return false;
        }
        var text = node.data;
        if (text === "" || text === "\uFEFF") {
            return true;
        }
        var parent = node.parentNode;
        if (!parent || parent.nodeType != 1) {
            return false;
        }
        var computedWhiteSpace = getComputedStyleProperty(node.parentNode, "whiteSpace");

        return ((/^[\t\n\r ]+$/).test(text) && (/^(normal|nowrap)$/).test(computedWhiteSpace)) ||
            ((/^[\t\r ]+$/).test(text) && computedWhiteSpace == "pre-line");
    };

    var getComputedStyleProperty;

    if (typeof window.getComputedStyle != "undefined") {
        getComputedStyleProperty = function(el, propName) {
            return rangy.dom.getWindow(el).getComputedStyle(el, null)[propName];
        };
    } else if (typeof document.documentElement.currentStyle != "undefined") {
        getComputedStyleProperty = function(el, propName) {
            return el.currentStyle[propName];
        };
    } else {
        throw new Error("Can't create getComputedStyleProperty");
    }

    var inlineDisplayRegex = /^(none|inline(-block|-table)?)$/i;

    // "A block node is either an Element whose "display" property does not have
    // resolved value "inline" or "inline-block" or "inline-table" or "none", or a
    // Document, or a DocumentFragment."
    var isBlockOrLineBreak = function(node) {
        if (!node) {
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

    function getRangeFromSavedSelection(savedSelection) {
        var rangeInfo = savedSelection.rangeInfos[0];
        if (rangeInfo.collapsed) { // Nothing is selected
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

    function createRangeFromElements(startElement, endElement, excludStartEndElements) {
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
    function getTextNodes(range) {
        if (!range.collapsed) {
            return $(range.getNodes([3])).filter(function() {
                return !isWhitespaceNode(this);
            });
        }
    }

    rangy.util.getRangeFromSavedSelection = getRangeFromSavedSelection;
    rangy.util.createRangeFromElements = createRangeFromElements;
    rangy.util.getTextNodes = getTextNodes;

    rangy.util.isWhitespaceNode = isWhitespaceNode;
    rangy.util.isBlockOrLineBreak = isBlockOrLineBreak;
    rangy.util.getTopNodes = getTopNodes;
    rangy.util.getTopParentWithSingleChild = getTopParentWithSingleChild;

});

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

/**
 * @fileoverview: A plugin to add command to insert and/or replace content
 */
(function(pluginManager) {
    var InsertCommand = function() {
        var publicApi = {
            insert: function(options) {
                $.extend(options, {
                    execute: true
                });
                this.triggerEvent($.Arte.constants.eventNames.onbeforeinsert, options);

                if (!options.execute) {
                    return;
                }

                // Ensure that the selection is valid
                var selectionIsInContentEditable = $.Arte.util.isSelectionInElement(this.$el);
                if (!selectionIsInContentEditable && $.Arte.configuration.requireFocus) {
                    return;
                }

                //var element = document.createTextNode(options.commandValue);
                var element = $("<span>").html(options.commandValue).get(0);
                var selection;
                if (selectionIsInContentEditable) {
                    // If we have a selection, insert the content at the cursor position
                    selection = rangy.getSelection();
                    var range = selection.getAllRanges()[0];
                    if (!selection.isCollapsed) {
                        range.deleteContents();
                    }
                    range.collapse();
                    range.insertNode(element);
                } else {
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

/**
 * @fileoverview: StateDetector detects the command state of user selection
 */
(function(pluginManager) {
    var constants = $.Arte.constants;

    var getValue = function(nodes, commandOptions) {
        var styleValue = null;
        var hasSameValue = true;

        var nodesWithCommand = $.Arte.dom.closestWithCommand(nodes, commandOptions);
        if (nodes.length !== nodesWithCommand.length) {
            // Not all nodes have this command applied
            return null;
        }

        // All nodes should have same style applied
        var commandValue = $.Arte.dom.getCommandValue(nodesWithCommand.first(), commandOptions);

        nodesWithCommand.each(function() {
            hasSameValue = $.Arte.dom.hasCommandValue($(this), commandValue);
            return hasSameValue;
        });

        if (hasSameValue) {
            for (var value in commandValue) {
                styleValue = commandValue[value];
            }
        }

        return styleValue;
    };

    var isApplied = function(nodes, commandOptions) {
        // Special case for OL/UL: Check if the text nodes are surrounded by LIs and the LIs belong to same OL/LI parent
        var tag = commandOptions.tagName;
        if (tag && (tag === constants.tagName.OL || tag === constants.tagName.UL)) {
            return $.Arte.dom.listSurrounded(nodes, {
                singleList: true,
                tagName: tag
            });
        }
        var nodesWithStyleValue = $.Arte.dom.closestWithCommandValue(nodes, commandOptions);
        return nodesWithStyleValue.length === nodes.length;
    };

    var getState = function(selectedNodes, commandName, options) {
        if (!selectedNodes || !selectedNodes.length) {
            return null;
        }
        var commandConfig = $.Arte.configuration.commands[commandName];
        var commandOptions = $.extend({
            commandName: commandName,
            tagName: commandConfig.tagName,
            styleName: commandConfig.styleName,
            styleValue: commandConfig.defaultValue ? commandConfig.defaultValue.styleName : null,
            className: commandConfig.defaultValue ? commandConfig.defaultValue.className : null
        }, options);

        return commandConfig.acceptsParams ? getValue(selectedNodes, commandOptions) : isApplied(selectedNodes, commandOptions);
    };

    var getSelectedNodesState = function(selectedNodes, commandName) {
        if (commandName) {
            return getState(selectedNodes, commandName);
        } else {
            var result = {};
            $.each($.Arte.configuration.commands, function(name, config) {
                if ($.isPlainObject(config) && config.commandType && config.commandType != constants.commandType.other) {
                    result[name] = getState(selectedNodes, name);
                }
            });
            return result;
        }
    };

    // Extend the prototype of the TextArea to expose the public API
    $.extend($.Arte.TextArea.prototype, {
        getState: function(commandName) {
            var selectedNodes = $.Arte.util.getSelectedTextNodes.apply(this, [true]);
            return getSelectedNodesState(selectedNodes, commandName);
        },

        /**
         * Get an array of all the states found within the current selection
         * (ie: if the current selection has both a bold and a non-bold component, get two results representing that)
         * @param {commandName} string. Optional. If provided, only result the state of the given command (ie: fontFamily, bold, etc)
         */
        getAllStates: function(commandName) {
            var selectedNodes = $.Arte.util.getSelectedTextNodes.apply(this, [true]);
            var results = [];

            $.each(selectedNodes, function() {
                var selectedNode = $(this);
                results.push(getSelectedNodesState(selectedNode, commandName));
            });

            return results;
        }
    });

    var stateDetector = function() {
        return {
            /**
             * A callback method for when a Arte is initialized
             * @param {TextArea} textArea.  An instance of a Arte text area
             */
            init: function() {}
        };
    };

    // Register this plugin with the plugin manager
    pluginManager.register("stateDetector", stateDetector);
})($.Arte.pluginManager);

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

/**
 * @fileoverview: A plugin to handle the keyboard events
 */
(function(pluginManager) {
    // Plugin
    var KeyboardEventHandler = function() {
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
        var onKeyPressHandler = function() {};

        /**
         * Construct a key string based on the keyboard commands
         * @param {keyboard event} keyboardEvent
         */
        var getKey = function(keyboardEvent) {
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
        var onKeyDownHandler = function(e, data) {
            var textArea = data.textArea;
            var event = data.originalEvent;
            var key = getKey(event);

            switch (key) {
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
            }
        };

        /**
         * Fires after a key event completes, and text has been altered.
         * @param {Event} e
         */
        var onKeyUpHandler = function(e, data) {
            var textArea = data.textArea;
            var event = data.originalEvent;
            var key = getKey(event);

            switch (key) {
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
                    textArea.triggerEvent($.Arte.constants.eventNames.onselectionchange);
            }
        };

        return {
            init: function(textArea) {
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

(function(pluginManager) {
    $.Arte.configuration.pasteHandler = {
        attributes: {
            "id": 1,
            "style": 1,
            "class": 1
        },
        style: {
            "font": 1,
            "font-style": 1,
            "font-weight": 1,
            "font-family": 1, // TODO: font-family, color, font-size needs to compare against some sanctioned list
            "color": 1,
            "font-size": 1,
            "text-align": 1
        },
        tag: {
            "P": 1,
            "DIV": 1,
            "UL": 1,
            "OL": 1,
            "LI": 1,
            "SPAN": 1
                // What to do with tags not in this list
        },
        nodeType: {
            "1": 1, // Text
            "3": 1 // Element
        },
        invalidTagHandlers: {
            "B": {
                applierTagName: "span",
                styleName: "font-weight",
                styleValue: "bold"
            },
            "I": {
                applierTagName: "span",
                styleName: "font-style",
                styleValue: "italic"
            },
            "U": {
                applierTagName: "span",
                styleName: "text-decoration",
                styleValue: "underline"
            },
            "FONT": {
                applierTagName: "span"
            }
        }
    };

    var configuration = $.Arte.configuration.pasteHandler;
    var classNameSpace = $.Arte.configuration.classNameSpace;

    var getReplacementNode = function(jNode) {
        var nodeType = jNode.get(0).nodeType;
        if (!configuration.nodeType[nodeType]) { // Remove unsupported nodes
            jNode.remove();
            return null;
        }

        // Additional node type based processing
        if (nodeType == $.Arte.constants.nodeType.TEXT) {
            var nodeValue = jNode.get(0).nodeValue;
            // Remove the html comment text
            nodeValue = nodeValue.replace(/<!--[\S\s]*?-->/ig, "");

            // Remove empty nodes
            if (nodeValue === "" || !nodeValue.match(/\S+/ig) || nodeValue.match(/^[\xA0]+$/ig)) {
                jNode.remove();
                return null;
            }

            // Remove multiple spaces and new line characters
            jNode.get(0).nodeValue = nodeValue.replace(/\n/ig, "").replace(/[\xA0|\s+]{2,}/ig, " ");
            return null;
        }
        var content = jNode.html();
        if (!content) {
            jNode.remove();
            return null;
        }

        var tagName = jNode.prop("tagName");
        if (configuration.tag[tagName]) {
            // This is a supported tag, remove unsupported attributes
            var attr = jNode.prop("attributes");
            for (var i = 0; i < attr.length; i++) {
                if (!configuration.attributes[attr[i].name]) {
                    try {
                        // IE7 returns events/properties as attributes, removing those throw exception
                        jNode.removeAttr(attr[i].name);
                    } catch (e) {}
                }
            }

            // Remove unrecognized class
            var classes = $.Arte.dom.getClasses(jNode);
            $.each(classes, function(index, className) {
                if (className.indexOf(classNameSpace) !== 0) {
                    jNode.removeClass(className);
                }
            });

            var cssText = "";
            $.each($.Arte.dom.getStyles(jNode), function(style, value) {
                var keepStyle = configuration.style[style];
                if (keepStyle) {
                    switch (style) {
                        case "font-size":
                            keepStyle = value.match(/\d+\s?px/);
                            break;
                        case "color":
                            keepStyle = value.match(/#[a-fA-F0-9]{6}/) || value.match(/rgb\(\d+,\s*\d+\,\s*\d+\)/);
                            break;
                        default:
                            break;
                    }
                }

                if (keepStyle) {
                    cssText += style + ": " + value + "; ";
                }
            });
            jNode.get(0).style.cssText = cssText;

            return null;
        }

        // Unsupported tags, construct a replacement node
        var invalidTagHandlerConfig = configuration.invalidTagHandlers[jNode.prop("tagName")] || {
            tagName: "DIV" /* Just wrap the content in a div*/
        };
        var newNode = $.Arte.dom.createContainer(invalidTagHandlerConfig).html(jNode.html());
        return newNode;
    };

    var handleUnsanctionedTags = function(nodes) {
        nodes.each(function() {
            var $this = $(this);
            handleUnsanctionedTags($this.contents());

            var replacementNode = getReplacementNode($this);
            if (replacementNode) {
                $this.replaceWith(replacementNode);
            }
        });
    };

    // Set of events raised by this plugin
    $.extend($.Arte.constants.eventNames, {
        "onbeforehandlepaste": "onbeforehandlepaste",
        "onhandlepaste": "onhandlepaste"
    });

    var pasteHandler = function() {
        return {
            init: function(textArea) {
                textArea.$element.on({
                    "onpaste": function(e, data) {
                        var options = {
                            execute: true
                        };
                        textArea.triggerEvent($.Arte.constants.eventNames.onbeforehandlepaste, options);
                        if (!options.execute) {
                            return;
                        }
                        handleUnsanctionedTags(data.textArea.$el.children());
                        textArea.triggerEvent($.Arte.constants.eventNames.onbeforehandlepaste, options);
                    }
                });
            }
        };
    };

    pluginManager.register("pasteHandler", pasteHandler);
})($.Arte.pluginManager);

(function($) {
    $.fn.ArteToolbar = function(options) {
        if (options && typeof(options) === "object") {
            options = $.extend({}, $.Arte.Toolbar.Defaults, options);
        }
        var result = $();
        this.each(function() {
            var toolbar = $(this).data("ArteToolbar");
            if (options && typeof(options) === "string") {
                // Most likely this is a method call
                var methodName = options;
                if (this.constructor === $.Arte.Toolbar) {
                    toolbar = this;
                }

                if (!toolbar) {
                    throw "This is not a arte toolbar.";
                }

                var returnValue = toolbar[methodName].call(toolbar);
                result.push(returnValue);
            } else {
                if (!toolbar) {
                    $.extend(options, {
                        element: $(this)
                    });
                    toolbar = new $.Arte.Toolbar(options);
                    $(this).data("ArteToolbar", toolbar);
                }
                result.push(toolbar);
            }
        });
        return result;
    };

    $.Arte.Toolbar = function(options) {
        var me = this;

        me.$el = options.element;

        me.$el.on({
            "click mousedown mouseup": function(e) {
                e.stopPropagation();
                e.preventDefault();
            }
        });

        // Clear the selection if user clicks outside of the editor
        $("body").on({
            click: function() {
                me.selectionManager.clear();
                me.refresh();
            }
        });

        var buttons = [];
        // Initialize and render each of the button
        $.each(options.buttons, function(index, buttonName) {
            var config = $.Arte.Toolbar.configuration.buttons[buttonName];
            var button = new config.js(me, buttonName, config);
            button.render();

            buttons.push(button);
        });

        // Create the containers for the inline dialog and tooltip
        var classes = $.Arte.Toolbar.configuration.classes;
        $("<div>").addClass(classes.dialog.container).appendTo(me.$el);
        $("<div>").addClass(classes.tooltip.container).appendTo(me.$el);

        // public api
        this.refresh = function() {
            var selectedField = me.selectionManager.getSelectedEditors()[0];
            var state = (selectedField) ? selectedField.getState() : {};
            $.each(buttons, function() {
                this.refresh(state);
            });
        };

        this.destroy = function() {
            me.$el.removeData("ArteToolbar");

            $.each(buttons, function() {
                this.unrender();
            });
            $("." + classes.dialog.container).remove();
            $("." + classes.tooltip.container).remove();
            me.$el.off();
        };

        // Setup the selection manager
        me.selectionManager = new $.Arte.Toolbar.SelectionManager();
        me.selectionManager.initialize({
            editor: options.editor
        });
        me.selectionManager.on({
            selectionchanged: me.refresh
        });

        me.refresh();
    };
})(jQuery);

/// dependencies: Toolbar
(function($) {
    $.Arte.Toolbar.Button = function(toolbar, buttonName, config) {
        var me = this;
        me.element = null;
        me.commandName = config.commandName;
        var configuration = $.Arte.Toolbar.configuration;
        var classes = configuration.classes;
        var buttonClasses = classes.button;

        this.isApplicable = function() {
            var editors = toolbar.selectionManager.getEditors(config.supportedTypes);
            return editors && editors.length;
        };

        this.isEnabled = function() {
            if (!configuration.requireEditorFocus) {
                return true;
            }

            var selectedEditors = toolbar.selectionManager.getSelectedEditors(config.supportedTypes);
            return (selectedEditors && selectedEditors.length);
        };

        this.executeCommand = function(commandValue) {
            if (this.isEnabled()) {
                var commandAttrType = (config && config.commandAttrType) ?
                    config.commandAttrType :
                    $.Arte.Toolbar.configuration.commandAttrType;

                var value = commandValue || (config.commandValue ? config.commandValue[commandAttrType] : "");

                if (!value && !config.supportsTagName && config.commandValue) {
                    commandAttrType = $.Arte.Toolbar.configuration.altCommandAttrType;
                    value = config.commandValue[commandAttrType];
                }

                var commandOptions = {
                    commandName: config.commandName,
                    commandValue: value,
                    commandAttrType: commandAttrType
                };

                var selectedEditors = toolbar.selectionManager.getSelectedEditors();
                if (!selectedEditors.length && !configuration.requireEditorFocus) {
                    selectedEditors = toolbar.selectionManager.getEditors();
                }

                $.each(selectedEditors, function() {
                    this[commandOptions.commandName].call(this, commandOptions);
                });
                toolbar.refresh();
            }
        };

        this.render = function() {
            var inner = $("<span>").addClass(buttonName).addClass(buttonClasses.inner);
            me.$el = $("<a>").attr("href", "#").addClass(buttonClasses.outer).html(inner);
            me.$el.on({
                mouseover: function(e) {
                    me.showTooltip(e);
                },
                mouseout: function(e) {
                    me.hideTooltip(e);
                },
                mousedown: function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                },
                click: function(e) {
                    me.executeCommand.apply(me);
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            me.$el.appendTo(toolbar.$el);
        };

        this.unrender = function() {
            me.$el.off();
            me.$el.remove();
        };

        var isApplied = function(state) {
            if (config.commandName === "textAlign") {
                var defaultValue = config.commandValue[$.Arte.Toolbar.configuration.commandAttrType] ||
                    config.commandValue[$.Arte.Toolbar.configuration.altCommandAttrType];
                return state === defaultValue;
            }
            return state;
        };

        this.refresh = function(state) {
            if (this.isApplicable()) {
                this.$el.show();
            } else {
                this.$el.hide();
                return;
            }

            if (this.isEnabled()) {
                me.$el.removeClass(buttonClasses.disabled);

                var op = isApplied(state[config.commandName]) ? "addClass" : "removeClass";
                me.$el[op](buttonClasses.selected);
            } else {
                me.$el.addClass(buttonClasses.disabled);
                me.$el.removeClass(buttonClasses.selected);
            }
        };

        this.showTooltip = function(mouseEvent) {
            if (me.$el.hasClass(buttonClasses.disabled)) {
                return;
            }

            var tooltip = toolbar.$el.find("." + classes.tooltip.container);
            tooltip.html(config.tooltip || this.commandName);

            // position the tooltip
            var elementOffset = toolbar.$el.offset();
            var x = mouseEvent.pageX - elementOffset.left + 15;
            var y = mouseEvent.pageY - elementOffset.top + 5;

            tooltip.css({
                top: y,
                left: x
            });
            tooltip.show();
        };
        this.hideTooltip = function() {
            if (me.$el.hasClass(buttonClasses.disabled)) {
                return;
            }

            toolbar.$el.find("." + classes.tooltip.container).hide();
        };
    };
})(jQuery);

(function($) {
    $.Arte.Toolbar.ButtonWithDialog = function(toolbar, buttonName, config) {
        var me = this;
        $.Arte.Toolbar.Button.call(this, toolbar, buttonName, config);

        var dialogClasses = $.Arte.Toolbar.configuration.classes.dialog;

        this.executeCommand = function() {
            if (me.isEnabled()) {
                me.showPopup();
            }
        };

        this.getOkCancelControl = function() {
            var wrapper = $("<div>").addClass(dialogClasses.okCancel);
            $("<a>").attr("href", "#").addClass(dialogClasses.button + " ok").html("&#x2713").appendTo(wrapper);
            $("<a>").attr("href", "#").addClass(dialogClasses.button + " cancel").html("&#x2717").appendTo(wrapper);
            return wrapper;
        };

        this.showPopup = function() {
            var dialogContainer = $("." + dialogClasses.container);
            var contentWrapper = $("<div>").addClass(dialogClasses.contentWrapper).appendTo(dialogContainer);
            contentWrapper.append(me.getDialogContent());
            contentWrapper.append(me.getOkCancelControl());
            dialogContainer.on("mousedown ", function(e) {
                e.stopPropagation();
            });
            var savedSelection = rangy.saveSelection();

            me.addContent();

            contentWrapper.find(".ok").on("click", function() {
                rangy.restoreSelection(savedSelection);
                me.onOk();
                me.closePopup();
            });

            contentWrapper.find(".cancel").on("click", function() {
                rangy.restoreSelection(savedSelection);
                me.closePopup();
            });

            dialogContainer.show({
                duration: 200,
                complete: function() {
                    contentWrapper.css("margin-top", -1 * contentWrapper.height() / 2);
                }
            });
        };

        this.closePopup = function() {
            var dialogContainer = $("." + dialogClasses.container);
            dialogContainer.children().each(function() {
                this.remove();
            });
            dialogContainer.hide();
        };
        return me;
    };
})(jQuery);

(function() {
    $.Arte.Toolbar.InsertLink = function(toolbar, buttonName, config) {
        var dialogClasses = $.Arte.Toolbar.configuration.classes.dialog;
        var insertLinkClasses = dialogClasses.insertLink;

        $.Arte.Toolbar.ButtonWithDialog.call(this, toolbar, buttonName, config);

        var insertContent = function(contentToInsert) {
            $.each(toolbar.selectionManager.getSelectedEditors(), function() {
                this.insert.call(this, {
                    commandValue: contentToInsert
                });
            });
        };

        this.getDialogContent = function() {
            var textToShow = $("<div>").addClass(dialogClasses.insertLink.textToShow);
            $("<span>").html("Text to Show: ").addClass(dialogClasses.label).appendTo(textToShow);
            $("<input>").addClass(insertLinkClasses.input + " textToShow").attr({
                type: "text"
            }).appendTo(textToShow);

            var urlInput = $("<div>").addClass(dialogClasses.insertLink.urlInput);
            $("<span>").html("Url: ").addClass(dialogClasses.label).appendTo(urlInput);
            $("<input>").addClass(insertLinkClasses.input + " url").attr({
                type: "text"
            }).appendTo(urlInput);

            var dialogContent = $("<div>").addClass(dialogClasses.content).append(textToShow).append(urlInput);
            return dialogContent;
        };

        this.onOk = function() {
            var textToShow = $("." + dialogClasses.container + " ." + dialogClasses.insertLink.textToShow + " input").val();
            var url = $("." + dialogClasses.container + " ." + dialogClasses.insertLink.urlInput + " input").val();
            if (url) {
                var html = $("<a>").attr("href", url).html(textToShow || url);
                insertContent(html.get(0).outerHTML);
            }
        };

        this.addContent = function() {
            $("." + dialogClasses.container + " .textToShow").val(rangy.getSelection().toHtml());
        };

    };
})(jQuery);

(function() {
    $.Arte.Toolbar.InsertImage = function(toolbar, buttonName, config) {
        var dialogClasses = $.Arte.Toolbar.configuration.classes.dialog;
        var insertLinkClasses = dialogClasses.insertLink;
        $.Arte.Toolbar.ButtonWithDialog.call(this, toolbar, buttonName, config);

        var insertContent = function(contentToInsert) {
            $.each(toolbar.selectionManager.getSelectedEditors(), function() {
                this.insert.call(this, {
                    commandValue: contentToInsert
                });
            });
        };

        this.getDialogContent = function() {
            var dialogContent = $("<div>").addClass("input-prepend input-append");
            $("<span>").html("Text to Show: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " textToShow").attr({
                type: "text"
            }).appendTo(dialogContent).css({
                height: "auto"
            });
            $("<span>").html("Url: ").addClass(insertLinkClasses.label).appendTo(dialogContent);
            $("<input>").addClass(insertLinkClasses.input + " url").attr({
                type: "text"
            }).appendTo(dialogContent).css({
                height: "auto"
            });
            return dialogContent;
        };

        this.onOk = function() {
            var contentToInsert = $("." + dialogClasses.container + " .url").val();
            if (contentToInsert) {
                var html = $("<img>").attr("src", contentToInsert);
                insertContent(html.get(0).outerHTML);
            }
        };

        this.addContent = function() {
            $("." + dialogClasses.container + " .textToShow").val(rangy.getSelection().toHtml());
        };
    };
})(jQuery);

(function($) {
    $.Arte.Toolbar.ButtonWithDropDown = function(toolbar, buttonName, config) {
        var classes = $.Arte.Toolbar.configuration.classes;
        $.Arte.Toolbar.Button.call(this, toolbar, buttonName, config);
        var me = this;
        this.render = function() {
            var element = $("<select>").addClass(classes.select).addClass(this.name);

            $.each(config.options, function(index, option) {
                var display;
                var value;
                if ($.isPlainObject(option)) {
                    display = option.display;
                    value = option.value;
                } else {
                    display = option;
                    value = typeof(option) === "string" ? option.toLowerCase() : option;
                }

                switch (buttonName) {
                    case "color":
                        // Browser apply colors differently (i.e. RGB, Hex etc.)
                        value = $("<div>").css("color", value).css("color");
                        break;
                    case "fontSize":
                        // Add, px to font size if it doesn't exist
                        if (value && !isNaN(+value) && !/px$/.test(value)) {
                            value += "px";
                        }
                        break;
                    case "fontFamily":
                        // Enforce adding quotes to multi-word font families or the one that start with number.
                        if (!value.match(/^\".+\"$/) && value.match(/^(?:\d.+|.+\s.+)$/)) {
                            value = "\'" + value + "\'";
                        }
                        break;
                }
                element.append($("<option>").attr("value", value).html(display));
            });
            element.appendTo(toolbar.$el);

            element.on({
                change: function() {
                    me.executeCommand.apply(me, [this.value]);
                },
                click: function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                },
                mousedown: function(e) {
                    e.stopPropagation();
                },
                mouseover: function(e) {
                    me.showTooltip(e);
                },
                mouseout: function(e) {
                    me.hideTooltip(e);
                }
            });

            this.$el = element;
        };
        this.unrender = function() {
            me.$el.off();
            me.$el.remove();
        };

        this.refresh = function(state) {
            if (this.isApplicable()) {
                this.$el.show();
            } else {
                this.$el.hide();
                return;
            }

            var op = this.isEnabled() ? "removeAttr" : "attr";
            this.$el[op]("disabled", true);

            var value = state[config.commandName];
            this.$el.val(value);
        };
    };
})(jQuery);

/* File overview: configuration for the toolbar */
(function($) {
    $.Arte.Toolbar = $.Arte.Toolbar || {};
    var buttonBase = $.Arte.Toolbar.Button;
    var buttonWithDropDown = $.Arte.Toolbar.ButtonWithDropDown;
    var commandAttrType = $.Arte.constants.commandAttrType;
    var editorTypes = $.Arte.constants.editorTypes;
    // Button Configuration
    $.Arte.Toolbar.configuration = {
        requireEditorFocus: true,
        // By default, this toolbar will apply rich text commands using styles
        commandAttrType: commandAttrType.styleName,
        // In case a command can't be applied using the commandAttrType, try applying the command using the altCommandAttrType
        altCommandAttrType: commandAttrType.styleName,
        buttons: {
            "bold": {
                js: buttonBase, // Button js to render and manage this button
                commandName: "bold", // Command to execute
                commandValue: { // command values for each command attribut type
                    "styleName": "bold",
                    "className": "arte-font-weight-bold"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                supportsTagName: true,
                tooltip: "Bold"
            },
            "italic": {
                js: buttonBase,
                commandName: "italic",
                commandValue: {
                    "styleName": "italic",
                    "className": "arte-font-style-italic"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                supportsTagName: true,
                tooltip: "Italic"
            },
            "underline": {
                js: buttonBase,
                commandName: "underline",
                commandValue: {
                    "styleName": "underline",
                    "className": "arte-text-decoration-underline"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                supportsTagName: true,
                tooltip: "Underline"
            },
            "blockquote": {
                js: buttonBase,
                commandName: "blockquote",
                supportedTypes: [editorTypes.richText],
                tooltip: "Blockquote"
            },
            "textAlignLeft": {
                js: buttonBase,
                icon: "../content/Icons/icons/text_align_left.png",
                commandName: "textAlign",
                commandValue: {
                    "styleName": "left",
                    "className": "arte-text-align-left"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Text align left"
            },
            "textAlignCenter": {
                js: buttonBase,
                icon: "../content/Icons/icons/text_align_center.png",
                commandName: "textAlign",
                commandValue: {
                    "styleName": "center",
                    "className": "arte-text-align-center"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Text align center"
            },
            "textAlignRight": {
                js: buttonBase,
                icon: "../content/Icons/icons/text_align_right.png",
                commandName: "textAlign",
                commandValue: {
                    "styleName": "right",
                    "className": "arte-text-align-right"
                },
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Text align right"
            },
            "h1": {
                js: buttonBase,
                commandName: "h1",
                icon: "../content/Icons/icons/text_heading_1.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H1"
            },
            "h2": {
                js: buttonBase,
                commandName: "h2",
                icon: "../content/Icons/icons/text_heading_2.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H2"
            },
            "h3": {
                js: buttonBase,
                commandName: "h3",
                icon: "../content/Icons/icons/text_heading_3.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H3"
            },
            "h4": {
                js: buttonBase,
                commandName: "h4",
                icon: "../content/Icons/icons/text_heading_4.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H4"
            },
            "h5": {
                js: buttonBase,
                commandName: "h5",
                icon: "../content/Icons/icons/text_heading_5.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H5"
            },
            "h6": {
                js: buttonBase,
                commandName: "h6",
                icon: "../content/Icons/icons/text_heading_6.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "H6"
            },
            "subscript": {
                js: buttonBase,
                commandName: "subscript",
                icon: "../content/Icons/icons/text_subscript.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "Subscript"
            },
            "superscript": {
                js: buttonBase,
                commandName: "superscript",
                icon: "../content/Icons/icons/text_superscript.png",
                supportedTypes: [editorTypes.richText],
                tooltip: "Superscript"
            },
            "fontSize": {
                js: buttonWithDropDown,
                icon: null,
                commandName: "fontSize",
                options: ["", 8, 10, 12, 15, 20],
                /*
                Alternate way of specifying the options where the display is different that the actual values
                options: [
                    { display: "", value: "" },
                    { display: "Smaller", value: 8 },
                    { display: "Small", value: 10 },
                    { display: "Medium", value: 12 },
                    { display: "Large", value: 15 },
                    { display: "Larger", value: 20 }
                ],
                Another way of specifying the options where the display is different that the actual values
                options: [
                    { display: "", value: "" },
                    { display: "Smaller", value: "arte-font-weight-8" },
                    { display: "Small", value: "arte-font-weight-10" },
                    { display: "Medium", value: "arte-font-weight-12" },
                    { display: "Large", value: "arte-font-weight-15" },
                    { display: "Larger", value: "arte-font-weight-20" }
                ],
                */
                acceptsParams: true,
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Font size"
            },
            "fontFamily": {
                js: buttonWithDropDown,
                icon: null,
                commandName: "fontFamily",
                options: ["", "Arial", "curier new", "Georgia", "Times New Roman"],
                acceptsParams: true,
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Font family"
            },
            "color": {
                js: buttonWithDropDown,
                icon: null,
                commandName: "color",
                options: ["", "Black", "Blue", "Green", "Red"],
                acceptsParams: true,
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Color"
            },
            "unorderedList": {
                js: buttonBase,
                commandName: "unorderedList",
                supportedTypes: [editorTypes.richText],
                tooltip: "Unordered list"
            },
            "orderedList": {
                js: buttonBase,
                commandName: "orderedList",
                supportedTypes: [editorTypes.richText],
                tooltip: "Ordered list"
            },
            "backgroundColor": {
                acceptsParams: true,
                js: buttonWithDropDown,
                commandName: "backgroundColor",
                options: ["", "Black", "Blue", "Green", "Red"],
                supportedTypes: [editorTypes.richText],
                tooltip: "Background Color"
            },
            "undo": {
                js: buttonBase,
                commandName: "undo",
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Undo"
            },
            "redo": {
                js: buttonBase,
                commandName: "redo",
                supportedTypes: [editorTypes.richText, editorTypes.plainText],
                tooltip: "Redo"
            },
            "toolbarLineBreak": {
                // Inserts a line break into the toolbar.
                js: function() {
                    return {
                        render: function(parentElement) {
                            $("<div>").appendTo(parentElement);
                        },
                        refresh: function() {}
                    };
                }
            },
            "insertLink": {
                commandName: "insert",
                js: $.Arte.Toolbar.InsertLink,
                supportedTypes: [editorTypes.richText],
                tooltip: "Insert link"
            },
            "insertImage": {
                commandName: "insert",
                js: $.Arte.Toolbar.InsertImage,
                supportedTypes: [editorTypes.richText],
                tooltip: "Insert Image"
            }
        },
        // Set of classes used to control the look-n-feel of the toolbar buttons
        classes: {
            "button": {
                "outer": "btn",
                "inner": "btn-inner",
                "disabled": "disabled",
                "selected": "selected"
            },
            "select": {
                "inner": "select"
            },
            "dialog": {
                "container": "inline-dialog",
                "contentWrapper": "content-wrapper",
                "content": "dialog-content",
                "okCancel": "ok-cancel",
                "label": "label",
                "button": "btn",
                "insertLink": {
                    "button": "btn",
                    "textToShow": "text-to-show",
                    "urlInput": "url-input"
                },
                "insertImage": {

                }
            },
            "tooltip": {
                "container": "tooltip"
            }
        }
    };
})(jQuery);

(function($) {
    $.Arte.Toolbar = $.Arte.Toolbar || {};
    $.Arte.Toolbar.SelectionManager = function() {
        var editors = $();
        var selectedEditors = [];

        this.getSelectedEditors = function(types) {
            if (types) {
                return $.Arte.util.filterCollection(selectedEditors, function(index, textField) {
                    return $.Arte.util.any(types, function(i, type) {
                        return textField.editorType === type;
                    });
                });
            }

            return selectedEditors;
        };

        this.getEditors = function(types) {
            if (types) {
                return $.Arte.util.filterCollection(editors, function(index, textField) {
                    return $.Arte.util.any(types, function(i, type) {
                        return textField.editorType === type;
                    });
                });
            }
            return editors;
        };

        this.initialize = function(options) {
            var me = this;
            var elements = options && options.editor ? $(options.editor) :
                $("[" + $.Arte.configuration.textFieldIdentifier + "]");

            editors = $.map(elements, function(element) {
                return $(element).Arte().get(0);
            });

            $.each(editors, function() {
                this.on({
                    onfocus: function(e, data) {
                        me.clear();
                        selectedEditors.push(data.textArea);
                        $(me).trigger("selectionchanged", e);
                    },
                    onselectionchange: function(e) {
                        $(me).trigger("selectionchanged", e);
                    }
                });
            });
        };

        this.clear = function() {
            selectedEditors.splice(0, selectedEditors.length);
        };
        this.on = function(type, handler) {
            $(this).on(type, handler);
        };
        this.off = function(type, handler) {
            $(this).off(type, handler);
        };
    };
})(jQuery);
