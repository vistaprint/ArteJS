(function($) {
    $.fn.ArteToolbar = function(options) {
        if (options && typeof(options) === "object") {
            options = $.extend({}, $.Arte.Toolbar.Defaults, options);
        }

        this.each(function() {
            var toolbar;
            if (options && typeof(options) === "object") {
                $.extend(options, { element: $(this) });
                toolbar = new $.Arte.Toolbar(options);
                $(this).data("Toolbar", toolbar);
            }
        });
        return this;
    };


    $.Arte.Toolbar = function (options) {
        var me = this;
        var classes = $.Arte.Toolbar.configuration.classes;
        this.$el = options.element;
        function render() {
            me.$el.on({
                "click mousedown mouseup": function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
            $.each(buttons, function () {
                this.render(me.$el);
            });

            // Add a container for inline dialogs
            $("<div>").addClass(classes.dialog.container).appendTo(me.$el);
            $("<div>").addClass(classes.tooltip.container).appendTo(me.$el);
        }

        var buttons = [];
        this.add = function (button) {
            buttons.push(button);
        };

        this.selectionManager = new $.Arte.Toolbar.SelectionManager();

        // Initialize each of the button
        $.each(options.buttons, function (index, buttonName) {
            var config = $.Arte.Toolbar.configuration.buttons[buttonName];
            var button = new config.js(me, buttonName, config);
            me.add(button);
        });

        render();

        this.refresh = function () {
            var selectedField = me.selectionManager.getSelectedFields()[0];
            var state = (selectedField) ? selectedField.getState() : {};
            $.each(buttons, function () {
                    this.refresh(state);
                });
        };

        $("body").on({
            click: function () {
                me.selectionManager.clear();
                me.refresh();
            }
        });

        this.selectionManager.on({
            selectionchanged: me.refresh
        });

        this.selectionManager.initialize({ editor: options.editor });
        me.refresh();
    };
})(jQuery);