/// dependencies: Toolbar
(function ($) {
    $.Arte.Toolbar.Button = function (toolbar, buttonName, config) {
        this.element = null;
        this.commandName = config.commandName;
        var classes = $.Arte.Toolbar.configuration.classes;
        var buttonClasses = classes.button;
        
        this.isEnabled = function () {
            var selectedTextField = toolbar.selectionManager.getSelectedFields(this.supportedTypes);
            return selectedTextField && selectedTextField.length;
        };

        this.executeCommand = function (commandValue) {
            if (this.isEnabled()) {
                var commandAttrType = (config && config.commandAttrType) ?
                    config.commandAttrType :
                    $.Arte.Toolbar.configuration.commandAttrType;

                var value = commandValue || (config.commandValue ? config.commandValue[commandAttrType] : "");

                var commandOptions = {
                    commandName: config.commandName,
                    commandValue: value,
                    commandAttrType: commandAttrType
                };

                $.each(toolbar.selectionManager.getSelectedFields(), function () {
                    this[commandOptions.commandName].call(this, commandOptions);
                });
                toolbar.refresh();
            }
        };

        this.render = function (parent) {
            var me = this;

            var inner = $("<span>").addClass(buttonName).addClass(buttonClasses.inner);
            this.$el = $("<a>").attr("href", "#").addClass(buttonClasses.outer).html(inner);
            this.$el.on({
                mouseover: function (e) { me.showTooltip(e); },
                mouseout: function (e) { me.hideTooltip(e); },
                mousedown: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                },
                click: function (e) {
                    me.executeCommand.apply(me);
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            this.$el.appendTo(parent);
        };
        var isApplied = function (state) {
            if (config.commandName === "textAlign") {
                var defaultValue = config.commandValue[$.Arte.Toolbar.configuration.commandAttrType];
                return state === defaultValue;
            }
            return state;
        };

        this.refresh = function (state) {
            if (this.isEnabled()) {
                this.$el.removeClass(buttonClasses.disabled);

                var op = isApplied(state[config.commandName]) ? "addClass" : "removeClass";
                this.$el[op](buttonClasses.selected);
            } else {
                this.$el.addClass(buttonClasses.disabled);
                this.$el.removeClass(buttonClasses.selected);
            }
        };

        this.showTooltip = function (mouseEvent) {
            if (this.$el.hasClass(buttonClasses.disabled)) {
                return;
            }

            var tooltip = toolbar.$el.find("." + classes.tooltip.container);
            tooltip.html(config.tooltip || this.commandName);

            // position the tooltip
            var elementOffset = toolbar.$el.offset();
            var x = mouseEvent.pageX - elementOffset.left + 15;
            var y = mouseEvent.pageY - elementOffset.top + 5;

            tooltip.css({ top: y, left: x });
            tooltip.show();
        };
        this.hideTooltip = function (mouseEvent) {
            if (this.$el.hasClass(buttonClasses.disabled)) {
                return;
            }

            toolbar.$el.find("." + classes.tooltip.outer).hide();
        };
    };
})(jQuery);