(function ($) {
    $.Arte.Toolbar.ButtonWithDropDown = function (toolbar, buttonName, config) {
        $.extend(this, new $.Arte.Toolbar.Button(toolbar, buttonName, config));
        this.render = function (parent) {
            var me = this;

            var element = $("<select>").addClass(".toolbar-button").addClass(this.name);

            $.each(config.options, function (index, option) {
                var value = typeof (option) === "string" ? option.toLowerCase() : option;

                switch (buttonName) {
                    case "color":
                        // Browser apply colors differently (i.e. RGB, Hex etc.)
                        value = $("<div>").css("color", value).css("color");
                        break;
                    case "fontSize":
                        // Add, px to font size if it doesn't exist
                        if (!/px$/.test(value)) {
                            value += "px";
                        }
                        break;
                    case "fontFamily":
                        // Enforce adding quotes to multi-word font families or the one that start with number.
                        if (!value.match(/^\".+\"$/) && value.match(/^(?:\d.+|.+\s.+)$/)) {
                            value = "\'" + value + "\'";
                        }
                        break;
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
            var op = this.isEnabled() ? "removeAttr" : "attr";
            this.element[op]("disabled", true);

            var value = state[config.commandName];

            // Perform a reverse lookup from className to actual value
            if ($.Arte.Toolbar.configuration.commandAttrType === $.Arte.constants.commandAttrType.className) {
                value = $.Arte.Toolbar.configuration.ClassNameReverseLookup[config.commandName][value];
            }

            this.element.val(value);
        };
    };
})(jQuery);