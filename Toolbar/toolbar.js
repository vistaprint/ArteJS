(function($) {
    $.fn.ArteToolbar = function(options) {
        if (options && typeof(options) === "object") {
            options = $.extend({}, $.Arte.Toolbar.Defaults, options);
        }
        var result = $();
        this.each(function() {
            var toolbar = $(this).data("ArteToolbar");
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
                    $(this).data("ArteToolbar", toolbar);
                }
                result.push(toolbar);
            }
        });
        return result;
    };


    $.Arte.Toolbar = function (options) {
        var me = this;
        
        me.$el = options.element;

        me.$el.on({
            "click mousedown mouseup": function (e) {
                e.stopPropagation();
                e.preventDefault();
            }
        });

        // Clear the selection if user clicks outside of the editor
        $("body").on({
            click: function () {
                me.selectionManager.clear();
                me.refresh();
            }
        });

        var buttons = [];
        // Initialize and render each of the button
        $.each(options.buttons, function (index, buttonName) {
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
        this.refresh = function () {
            var selectedField = me.selectionManager.getSelectedFields()[0];
            var state = (selectedField) ? selectedField.getState() : {};
            $.each(buttons, function () {
                this.refresh(state);
            });
        };

        this.destroy = function () {
            $el.removeData("ArteToolbar");

            $.each(buttons, function () {
                this.unrender();
            });
            $("." + classes.dialog.container).remove();
            $("." + classes.tooltip.container).remove();
            $el.off();
        };

        // Setup the selection manager
        me.selectionManager = new $.Arte.Toolbar.SelectionManager();
        me.selectionManager.initialize({ editor: options.editor });
        me.selectionManager.on({
            selectionchanged: me.refresh
        });

        me.refresh();
    };
})(jQuery);