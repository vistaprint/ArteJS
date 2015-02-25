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
        /**
         * Get or Set innerHtml of the contentEditable element
         * @params {string} value string to set innerHTML of element to
         * @returns {string} returns 'innerHTML' of the contentEditable element
         * if in rich text mode or 'value' of the element if in plaintext mode
         * if getting value, otherwise returns nothing
         */
        "value": function(value) {
            var constants = $.Arte.constants;
            var prop = this.editorType === constants.editorTypes.richText ? "innerHTML" : "value";
            var currentValue = this.el[prop];

            if (typeof (value) === "undefined") {
                return currentValue;
            }

            if (currentValue === value) {
                return;
            }

            //TODO should we return this so that we can chain things?
            this.el[prop] = value;
            this._currentOuterValue = this._container.innerHTML;
            this.triggerEvent(constants.eventNames.onvaluechange, {
                newValue: value,
                src: "external"
            });
        },

        /**
         * Gets or sets outerHtml of the contentEditable element
         * @params {string} value html string to set outerHTML of element to
         * @returns {string} returns 'outerHTML' of the contentEditable element with contentEditable tag removed
         */
        "outerValue": function(value) {
            if (typeof (value) === "undefined") {
                var clone = this.$element.clone();
                clone.children().removeAttr("contenteditable");
                return clone.html();
            }

            var newElement = $(value)[0];
            this.el.setAttribute("style", newElement.getAttribute("style") || "");
            this.el.setAttribute("class", newElement.getAttribute("class") || "");
            this.value(newElement.innerHTML);
        },

        /**
         * Calls a focus event on the contentEditable element, moves the cursor
         * to the end of that element, and fires an onselectionchange event
         */
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

        /**
        * Triggers the event passed in on the contentEditable element with data provided
        * @params {string} name - name of the event you want to trigger
        * @params {object} data - extra parameters to pass into the event handler
         */
        "triggerEvent": function(name, data) {
            this.$element.trigger(name, $.extend(data, {
                textArea: this
            }));
        },

        /**
        * Removes Arte from this element (Converts the rich text editor to non-editable state and remove rich text state information)
        * @params {Object} options - pass in 'removeContent' in options object to also clear the element of all text and formatting
        */
        "destroy": function(options) {
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
         *  Listen to events on the Arte.TextAreas element (same as adding events directly to the element)
         */
        on: function(type, handler) {
            this.$element.on(type, handler);
        },

        /**
         *  Stop listening to events on the Arte.TextAreas element (same as adding events directly to the element)
         */
        off: function(type, handler) {
            this.$element.off(type, handler);
        }
    });
})(jQuery);
