(function($) {
    $.Arte.Toolbar.ButtonWithDropDown = function(toolbar, buttonName, config) {
        var classes = $.Arte.Toolbar.configuration.classes;
        $.Arte.Toolbar.Button.call(this, toolbar, buttonName, config);
        var me = this;
        this.render = function() {
            var element = $("<select>").addClass(classes.select).addClass(this.name);

            $.each(config.options, function(index, option) {
                var display;
                var value;
                if ($.isPlainObject(option)) {
                    display = option.display;
                    value = option.value;
                } else {
                    display = option;
                    value = typeof(option) === "string" ? option.toLowerCase() : option;
                }

                switch (buttonName) {
                    case "color":
                        // Browser apply colors differently (i.e. RGB, Hex etc.)
                        value = $("<div>").css("color", value).css("color");
                        break;
                    case "fontSize":
                        // Add, px to font size if it doesn't exist
                        if (value && !isNaN(+value) && !/px$/.test(value)) {
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
                element.append($("<option>").attr("value", value).html(display));
            });
            element.appendTo(toolbar.$el);

            element.on({
                change: function() {
                    me.executeCommand.apply(me, [this.value]);
                },
                click: function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                },
                mousedown: function(e) {
                    e.stopPropagation();
                },
                mouseover: function(e) {
                    me.showTooltip(e);
                },
                mouseout: function(e) {
                    me.hideTooltip(e);
                }
            });

            this.$el = element;
        };
        this.unrender = function() {
            me.$el.off();
            me.$el.remove();
        };

        this.refresh = function(state) {
            if (this.isApplicable()) {
                this.$el.show();
            } else {
                this.$el.hide();
                return;
            }

            var op = this.isEnabled() ? "removeAttr" : "attr";
            this.$el[op]("disabled", true);

            var value = state[config.commandName];
            this.$el.val(value);
        };
    };
})(jQuery);
