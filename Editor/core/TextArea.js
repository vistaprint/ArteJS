/// dependencies: Arte.js
(function ($) {
    $.Arte = $.Arte || {};
    $.Arte.TextArea = function (options) {
        var me = this;
        var configuration = $.Arte.configuration;
        var constants = $.Arte.constants;

        me.$element = $(options.element);
        // Create a mix-in of the user provided values and configuration defined default values
        var initialValues = $.extend({}, configuration.initialValues, options);

        var eventNames = constants.eventNames;
        this.editorType = options.editorType || constants.editorTypes.richText;

        //Stores the internal value (innerHTML) of the field
        this._currentValue = "";
        //Store the outer value for comparison of value changes
        this._currentOuterValue = "";

        //Timer used to check for changes to the value, selection, and focus of the textarea
        var pollTimer = null;

        var handleValueChange = function() {
            var oldOuterValue = me._currentOuterValue;
            var newOuterValue = me.outerValue(); // This will set this._currentOuterValue
            if (newOuterValue != oldOuterValue) {
                var oldValue = me._currentValue;
                var newValue = me.value(); // This sets this._currentValue
                me.triggerEvent(eventNames.onvaluechange, { newValue: newValue, oldValue: oldValue, src: "internal" });
            }
        }

        // Uses polling to trigger value change as user can change the value of the text field in multiple ways.
        // for example (keyboard, IME input, paste, multi-stroke keyboard, and context menu).
        var startPollingForValueChange = function () {
            if (!pollTimer) {
                pollTimer = setInterval(handleValueChange, configuration.pollIntervalInMs);
            }
        };

        // Construct a dom element to host richtext editor or use if one already exist
        if (me.$element.children().length === 0) {
            me.$el = (me.editorType === constants.editorTypes.richText) ?
                $("<div>").attr({ contentEditable: "true" }) :
                me.$el = $("<textarea>").css({ height: "100%", width: "100%", padding: "0px", border: "0px" });
            me.$element.append(me.$el);
        }
        else {
            me.$el = me.$element.children().first();
            if (me.$el.is("div")) {
                me.$el.attr({ contentEditable: "true" });
            }
        }
        me.$el.css(initialValues.styles);
        $.each(initialValues.classes, function (index, className) {
            me.$el.addClass(className);
        });
        
        me.$element.attr(configuration.textFieldIdentifier, "1");

        /*
        * Whether the element has the focus
        */
        var isFocused = false;

        /*
        * Listen for the dom events on the text area or the content editable element.
        */
        me.$el.on({
            keydown: function (e) {
                me.triggerEvent(eventNames.onkeydown, { originalEvent: e });
                e.stopPropagation();
            },
            keyup: function (e) {
                me.triggerEvent(eventNames.onkeyup, { originalEvent: e });
                e.stopPropagation();
            },
            keypress: function (e) {
                me.triggerEvent(eventNames.onkeypress, { originalEvent: e });
                e.stopPropagation();
            },
            focus: function (e) {
                if (!isFocused) {
                    isFocused = true;
                    me.triggerEvent(eventNames.onfocus, { originalEvent: e });
                }
                startPollingForValueChange();
                e.stopPropagation();
            },
            blur: function (e) {
                handleValueChange(); // Flush any changes that occurred between the last poll and now.
                isFocused = false;
                me.triggerEvent(eventNames.onselectionchange);
                me.triggerEvent(eventNames.onblur, { originalEvent: e });

                // Clear the value changed poll timer
                if (pollTimer) {
                    clearInterval(pollTimer);
                    pollTimer = null;
                }
                e.stopPropagation();
            },
            mouseup: function (e) {
                me.triggerEvent(eventNames.onselectionchange);
                me.triggerEvent(eventNames.onmouseup, { originalEvent: e });
            },
            mousedown: function (e) {
                me.triggerEvent(eventNames.onmousedown, { originalEvent: e });
            },
            click: function (e) {
                me.triggerEvent(eventNames.onclick, { originalEvent: e });
            },
            paste: function (e) {
                setTimeout(function () {
                    me.triggerEvent(eventNames.onpaste, { originalEvent: e });
                }, 50);
            }
        });
        $.Arte.pluginManager.init(me);

        me.value(initialValues.value);
        me.outerValue(); // This sets the internal this._currentOuterValue

        me.$element.on(options.on);
        me.triggerEvent(eventNames.oncreate);
    };

    $.extend($.Arte.TextArea.prototype, {
        // Get innerHtml of the contentEditable element    
        "value": function (value, options) {
            var constants = $.Arte.constants;
            var op = this.editorType === constants.editorTypes.richText ? "html" : "val";
           
            if (typeof (value) === "undefined") {
                if ($.Arte.configuration.handleUnsanctionedTagsOnGetValue) {
                    // Save current selection
                    var savedSelection = rangy.saveSelection();
                    $.Arte.dom.handleUnsanctionedElements(this.$el.contents());
                    rangy.restoreSelection(savedSelection);
                }
                this._currentValue = this.$el[op]();
                return this._currentValue;
            }

            if (this._currentValue === value && (!options || !options.forceApply)) {
                return;
            }

            var oldValue = this._currentValue;
            this._currentValue = value;
            // Set the inner text 
            this.$el[op](value);
            this.triggerEvent(constants.eventNames.onvaluechange, { newValue: this._currentValue, oldValue: oldValue, src: "external" });
        },
        // Get outerHtml of the contentEditable
        "outerValue": function (value) {
            if (typeof (value) === "undefined") {
                var clone = this.$element.clone();
                clone.children().removeAttr("contenteditable");
                this._currentOuterValue = clone.html();
                return this._currentOuterValue;
            }
            var newElement = $(value);
            
            if ($.Arte.dom.isEqual(this.$el, newElement)) { 
                return;
            }
            
            this.$el.removeAttr("style"); // Clear the styles
            this.$el.attr("style", newElement.attr("style"));

            this.$el.removeAttr("class");
            this.$el.attr("class", newElement.attr("class"));

            this.value(newElement.html(), { forceApply: true });
            this._currentOuterValue = this.outerValue();
        },
        "focus": function () {
            var me = this;
            var focusHandler = function () {
                me.$el.off("focus", focusHandler);
                $.Arte.util.moveCursorToEndOfElement(me.$el.get(0));
                me.triggerEvent($.Arte.constants.eventNames.onselectionchange);
            };

            me.$el.on("focus", focusHandler);
            me.$el.focus();
        },
        "triggerEvent": function (name, data) {
            this.$element.trigger(name, $.extend(data, { textArea: this }));
        },
        "destroy": function (options) {
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
        on: function (type, handler) {
            this.$element.on(type, handler);
        },
        off: function (type, handler) {
            this.$element.off(type, handler);
        }
    });
})(jQuery);
