/// dependencies: Toolbar
(function ($) {
    $.Arte.Toolbar.Button = function (toolbar, buttonName, config) {
        this.element = null;
        this.commandName = config.commandName;

        this.isEnabled = function () {
            var selectedTextField = toolbar.selectionManager.getSelectedFields(this.supportedTypes);
            return selectedTextField && selectedTextField.length;
        };

        this.executeCommand = function (commandValue) {
            if (this.isEnabled()) {
                var commandAttrType = (config && config.commandAttrType) ?
                    config.commandAttrType :
                    $.Arte.Toolbar.configuration.commandAttrType;

                var value = commandValue;
                if (config.acceptsParams) {
                    value = config.getValue(commandAttrType, value);
                } else {
                    value = config.commandValue ? config.commandValue[commandAttrType] : "";
                }
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

            var inner = $("<span>").addClass(buttonName + " toolbar-button");
            this.element = $("<a>").attr("href", "#").addClass("btn").html(inner);
            this.element.on({
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

            this.element.appendTo(parent);
        };
        var isApplied = function (state) {
            if (config.commandName === "textAlign") {
                var defaultValue = config.commandValue[$.Arte.Toolbar.configuration.commandAttrType];
                return state === defaultValue;
            }
            return state;
        };

        this.refresh = function (state) {
            var buttonStateClass = $.Arte.Toolbar.configuration.buttonStateClass;

            if (this.isEnabled()) {
                this.element.removeClass(buttonStateClass.disabled);

                var op = isApplied(state[config.commandName]) ? "addClass" : "removeClass";
                this.element[op](buttonStateClass.selected);
            } else {
                this.element.addClass(buttonStateClass.disabled);
            }
        };
    };
})(jQuery);