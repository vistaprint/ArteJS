/// dependencies: Toolbar
(function ($) {
    $.Arte.Toolbar.Button = function (toolbar, buttonName, config) {
        var me = this;
        me.element = null;
        me.commandName = config.commandName;
        var configuration = $.Arte.Toolbar.configuration;
        var classes = configuration.classes;
        var buttonClasses = classes.button;

        this.isApplicable = function ()
        {
            var editors = toolbar.selectionManager.getEditors(config.supportedTypes);
            return editors && editors.length;
        }

        this.isEnabled = function () {
            if (!configuration.requireEditorFocus) {
                return true;
            }
            
            var selectedEditors = toolbar.selectionManager.getSelectedEditors(config.supportedTypes);
            return (selectedEditors && selectedEditors.length);
        };

        this.executeCommand = function (commandValue) {
            if (this.isEnabled()) {
                var commandAttrType = (config && config.commandAttrType) ?
                    config.commandAttrType :
                    $.Arte.Toolbar.configuration.commandAttrType;

                var value = commandValue || (config.commandValue ? config.commandValue[commandAttrType] : "");

                if (!value && config.commandValue) {
                    commandAttrType = $.Arte.constants.commandAttrType.styleName;
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

                $.each(selectedEditors, function () {
                    this[commandOptions.commandName].call(this, commandOptions);
                });
                toolbar.refresh();
            }
        };

        this.render = function () {
            var inner = $("<span>").addClass(buttonName).addClass(buttonClasses.inner);
            me.$el = $("<a>").attr("href", "#").addClass(buttonClasses.outer).html(inner);
            me.$el.on({
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

            me.$el.appendTo(toolbar.$el);
        };

        this.unrender = function () {
            me.$el.off();
            me.$el.remove();
        };

        var isApplied = function (state) {
            if (config.commandName === "textAlign") {
                var defaultValue = config.commandValue[$.Arte.Toolbar.configuration.commandAttrType];
                return state === defaultValue;
            }
            return state;
        };

        this.refresh = function (state) {
            if (this.isApplicable())
            {
                this.$el.show();
            } else
            {
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

        this.showTooltip = function (mouseEvent) {
            if (me.$el.hasClass(buttonClasses.disabled)) {
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
            if (me.$el.hasClass(buttonClasses.disabled)) {
                return;
            }

            toolbar.$el.find("." + classes.tooltip.container).hide();
        };
    };
})(jQuery);