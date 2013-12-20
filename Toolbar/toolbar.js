(function($) {
    $.fn.ArteToolbar = function(options) {
        if (options && typeof(options) === "object") {
            options = $.extend({}, $.Arte.Toolbar.Defaults, options);
        }
        var result = $();
        this.each(function() {
            var toolbar = $(this).data("Toolbar");
            if (options && typeof (options) === "string") {
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
            }
            else {
                if (!toolbar) {
                    $.extend(options, { element: $(this) });
                    toolbar = new $.Arte.Toolbar(options);
                    $(this).data("Toolbar", toolbar);
                }
                result.push(toolbar);
            }
        });
        return result;
    };


    $.Arte.Toolbar = function (options) {
        var me = this;
        
        var $el = options.element;

        $el.on({
            "click mousedown mouseup": function (e) {
                e.stopPropagation();
                e.preventDefault();
            }
        });

        $("body").on({
            click: function () {
                me.selectionManager.clear();
                me.refresh();
            }
        });

        me.selectionManager = new $.Arte.Toolbar.SelectionManager();
        me.selectionManager.initialize({ editor: options.editor });
        me.selectionManager.on({
            selectionchanged: me.refresh
        });

        var buttons = [];
        // Initialize and render each of the button
        $.each(options.buttons, function (index, buttonName) {
            var config = $.Arte.Toolbar.configuration.buttons[buttonName];
            var button = new config.js(me, buttonName, config);
            button.render($el);

            buttons.push(button);
        });
        var classes = $.Arte.Toolbar.configuration.classes;
        $("<div>").addClass(classes.dialog.container).appendTo(me.$el);
        $("<div>").addClass(classes.tooltip.container).appendTo(me.$el);

        // public api
        this.refresh = function () {
            var selectedField = me.selectionManager.getSelectedFields()[0];
            var state = (selectedField) ? selectedField.getState() : {};
            $.each(buttons, function () {
                this.refresh(state);
            });
        };

        this.destroy = function () {
            $.each(buttons, function () {
                this.unrender();
            });
            $("." + classes.dialog.container).remove();
            $("." + classes.tooltip.container).remove();
            $el.off();
        };

        me.refresh();
    };
})(jQuery);