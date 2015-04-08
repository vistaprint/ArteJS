/**
 * @fileoverview Rich text editor
 * Usage:
 *  1) var arte = Arte(element);
 *     Converts the first matched element into a rich text editor using default options and returns an existing instance
 * @returns {an Arte object}
 *  2) var arte = Arte(element, { options });
 *     Converts the first matched elements into a rich text editor using the options supplied and returns an existing instance
 * @returns {an Arte object}
 *
 */

jQuery(function($) {
    function Arte(element, options) {
        if (!(this instanceof Arte)) {
            return new Arte(element, options);
        }

        this.container = $(element).first();
        this.options = $.extend({
                editorType: "plainText",
                styles: {
                    "min-height": "200px",
                    "height": "inherit"
                },
                classes: [],
                value: "Please enter text ..."
                // TODO: set all default values here
            }, options);

        if (!this.container.length) {
            throw "Arte requires a DOM element";
        }

        // NEW: replace element reference to the new made element
        // after it's initialized
        this.element = this.__initialize();

        this.__initEvents();

        this.__type = this.options.editorType;

        return this;
    }

    // Export Arte
    window.Arte = Arte;

    Arte.prototype = {
        __initialize: function() {
            var newElement;

            if (this.options.editorType === "richText") {
                newElement = $("<div/>", {
                        class: "arte-richtext",
                        contenteditable: true
                    })
                    .html(this.options.value);
            } else {
                newElement = $("<textarea/>", {
                        class: "arte-plaintext",
                        style: {
                            height: "100%",
                            width: "100%",
                            padding: 0,
                            border: 0
                        }
                    })
                    .val(this.options.value);
            }

            newElement
                // Apply default style
                .css(this.options.styles)
                // add custom classes
                .addClass(this.options.classes.join(" "))
                // insert newElement to the element container
                .appendTo(this.container);

            return newElement;
        },

        /* Methods */

        /**
         * Get or Set content of the element
         * @params {string} value string to set content of element
         * @returns {string} returns 'innerHTML' of the contentEditable element
         * if in rich text mode or 'value' of the element if in plaintext mode
         */
        value: function() {
            if (this.__type === "plainText") {
                return $.fn.val.apply(this.element, arguments);
            } else {
                return $.fn.html.apply(this.element, arguments);
            }
        },

        /**
         * Gets outerHtml of the element
         * @returns {string} returns 'outerHTML' of the element
         */
        outerValue: function() {
            return this.element.get(0).outerHTML;
        },

        /**
         * Calls a focus event on the contentEditable element, moves the cursor
         * to the end of that element, and fires an onselectionchange event
         */
        focus: function() {
            var elem = this.element[0];
            var range;
            var sel;

            this.element.trigger("focus");

            // Moves the cursor to the end of the element
            if (elem.selectionStart >= 0) {
                // Works only on textarea elements
                elem.selectionStart = elem.selectionEnd = elem.value.length;
            } else if (typeof elem.createTextRange !== "undefined") {
                // Fallback for textarea elements without support to selectionStart
                range = elem.createTextRange();
                range.collapse(false);
                range.select();
            } else if (this.__type === "richText" && document.createRange && window.getSelection) {
                // Works only on contenteditable
                range = document.createRange();
                sel = window.getSelection();

                while (elem.lastChild) {
                    elem = elem.lastChild;
                }
                range.setStart(elem, elem.nodeValue.length);
                range.collapse(true);

                sel.removeAllRanges();
                sel.addRange(range);
            }

            return this;
        },

        destroy: function(options) {
            this.triggerEvent("arte-destroy");

            if (options && options.removeContent) {
                this.element.empty();
            } else {
                this.element.remove();
            }
        }
    };

});
