jQuery(function($) {
    $.extend(Arte.prototype, {
        /**
        * Triggers the event passed in on the contentEditable element with data provided
        * @params {string} name - name of the event you want to trigger
        * @params {object} data - extra parameters to pass into the event handler
         */
        triggerEvent: function() {
            $.fn.trigger.apply(this.element, arguments);
            return this;
        },

        on: function() {
            $.fn.on.apply(this.element, arguments);
        },

        off: function() {
            $.fn.off.apply(this.element, arguments);
        },

        __initEvents: function() {
            var arte = this;

            this.on("keydown keyup keypress focus", function(ev) {
                arte.triggerEvent({
                    type: "arte-" + ev.type,
                    originalEvent: ev
                });
                ev.stopPropagation();
            });

            this.on("blur", function(ev) {
                arte.triggerEvent("arte-selectionchange");
                arte.triggerEvent({
                    type: "arte-blur",
                    originalEvent: ev
                });

                ev.stopPropagation();
            });

            this.on("mouseup", function(ev) {
                arte.triggerEvent("arte-selectionchange");
                arte.triggerEvent({
                    type: "arte-mouseup",
                    originalEvent: ev
                });
            });

            arte.on("mousedown click paste", function(ev) {
                arte.triggerEvent({
                    type: "arte-" + ev.type,
                    originalEvent: ev
                });
            });
        }
    });
});
