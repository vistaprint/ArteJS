(function ($) {
    $.Arte.Toolbar.ButtonWithDropDown = function (toolbar, buttonName, config) {
        $.extend(this, new $.Arte.Toolbar.Button(toolbar, buttonName, config));
        this.render = function (parent) {
            var me = this;

            var element = $("<select>").addClass(".toolbar-button").addClass(this.name);
            $.each(config.options, function (index, option) {
                var value = typeof (option) === "string" ? option.toLowerCase() : option;
                if (buttonName === "color") {
                    // Browser apply colors differently (i.e. RGB, Hex etc.)
                    value = $("<div>").css("color", value).css("color");
                }
                element.append($("<option>").attr("value", value).html(option));
            });
            element.appendTo(parent);


            element.on({
                change: function () {
                    me.executeCommand.apply(me, [this.value]);
                },
                click: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                },
                mousedown: function (e) {
                    e.stopPropagation();
                }
            });

            this.element = element;
        };

        this.refresh = function (state) {
            var value = state[config.commandName];

            if (value) {
                value = value.replace(/\'/ig, ""); // remove quotes 
                value = value.replace(/px/ig, ""); // remove px from fontSize
            }

            // Perform a reverse lookup from className to actual value
            if ($.Arte.Toolbar.configuration.commandAttrType === $.Arte.constants.commandAttrType.className) {
                var lookupTable = $.Arte.Toolbar.configuration.ClassNameLookup[config.commandName];
                $.each(lookupTable, function (key, val) {
                    if (value === val) {
                        value = key;
                        return false;
                    }
                });
            }

            this.element.val(value);
        };
    };
})(jQuery);