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
        this.currentValue = "";

        //Timer used to check for changes to the value, selection, and focus of the textarea
        var pollTimer = null;

        // Uses polling to trigger value change as user can change the value of the text field in multiple ways.
        // for example (keyboard, IME input, paste, multi-stroke keyboard, and context menu).
        var startPollingForValueChange = function () {
            if (!pollTimer) {
                pollTimer = setInterval(function () {
                    if (me.outerValue() != me.currentValue) {
                        var newValue = me.outerValue();
                        me.triggerEvent(eventNames.onvaluechange, { newValue: newValue, oldValue: me.currentValue });
                        me.currentValue = newValue;
                    }
                }, options.pollIntervalInMs);
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
                e.stopPropagation();
            },
            mousedown: function (e) {
                me.triggerEvent(eventNames.onmousedown, { originalEvent: e });
                e.stopPropagation();
            },
            click: function (e) {
                me.triggerEvent(eventNames.onclick, { originalEvent: e });
                e.stopPropagation();
                e.preventDefault();
            },
            paste: function (e) {
                setTimeout(function () {
                    me.triggerEvent(eventNames.onpaste, { originalEvent: e });
                }, 50);
            }
        });
        $.Arte.pluginManager.init(me);

        me.value(initialValues.value);
        me.currentValue = me.outerValue();

        me.$element.on(options.on);
        me.triggerEvent(eventNames.oncreate);
    };

    $.extend($.Arte.TextArea.prototype, {
        // Get innerHtml of the contentEditable element    
        "value": function (value) {
            var constants = $.Arte.constants;
            var op = this.editorType === constants.editorTypes.richText ? "html" : "val";
            this.currentValue = this.$el[op]();
            if (typeof (value) === "undefined") {
                return this.currentValue;
            }

            // Set the inner text 
            this.$el[op](value);
            this.triggerEvent(constants.eventNames.onvaluechange, { newValue: value, oldValue: this.currentValue });
        },
        // Get outerHtml of the contentEditable
        "outerValue": function (value) {
            if (typeof (value) === "undefined") {
                var clone = this.$element.clone();
                clone.children().removeAttr("contenteditable");
                return clone.html();
            }
            var newElement = $(value);

            this.$el.removeAttr("style"); // Clear the styles
            this.$el.attr("style", newElement.attr("style"));

            this.$el.removeAttr("class");
            this.$el.attr("class", newElement.attr("class"));

            this.value(newElement.html());
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