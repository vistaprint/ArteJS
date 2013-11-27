/// dependencies: Toolbar
(function ($) {
    $.Arte.Toolbar.Button = function (toolbar, buttonName, config) {
        this.element = null;
        this.commandName = config.commandName;
        var buttonClasses = $.Arte.Toolbar.configuration.classes.button;
        
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
            this.element = $("<a>").attr("href", "#").addClass(buttonClasses.outer).html(inner);
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
            if (this.isEnabled()) {
                this.element.removeClass(buttonClasses.disabled);

                var op = isApplied(state[config.commandName]) ? "addClass" : "removeClass";
                this.element[op](buttonClasses.selected);
            } else {
                this.element.addClass(buttonClasses.disabled);
                this.element.removeClass(buttonClasses.selected);
            }
        };
    };
})(jQuery);