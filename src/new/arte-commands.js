jQuery(function($) {
    var commands = {
        bold: function() {
            var weight = this.element.css("fontWeight");

            if (weight === "bold" || weight > 500) {
                this.element.css("fontWeight", 400);
            } else {
                this.element.css("fontWeight", 700);
            }
        },
        italic: function() {
            var style = this.element.css("fontStyle");

            if (style === "italic") {
                this.element.css("fontStyle", "normal");
            } else {
                this.element.css("fontStyle", "italic");
            }
        },
        underline: function() {
            var decoration = this.element.css("textDecoration");

            if (decoration === "underline") {
                this.element.css("textDecoration", "none");
            } else {
                this.element.css("textDecoration", "underline");
            }
        },
        fontSize: function(value) {
            if (value) {
                return this.element.css("fontSize", value);
            } else {
                return this.element.css("fontSize");
            }
        },
        fontFamily: function(value) {
            if (value) {
                return this.element.css("fontFamily", value);
            } else {
                return this.element.css("fontFamily");
            }
        },
        color: function(value) {
            if (value) {
                return this.element.css("color", value);
            } else {
                return this.element.css("color");
            }
        },
        backgroundColor: function(value) {
            if (value) {
                return this.element.css("backgroundColor", value);
            } else {
                return this.element.css("backgroundColor");
            }
        },
        textAlign: function(value) {
            if (value) {
                return this.element.css("textAlign", value);
            } else {
                return this.element.css("textAlign");
            }
        },
        unorderedList: function() {
            if (this.__type === "plainText") {
                throw new Error("Can't create lists on plain text editors");
            }
        },
        orderedList: function() {
            if (this.__type === "plainText") {
                throw new Error("Can't create lists on plain text editors");
            }
        },
        blockquote: function() {
            if (this.__type === "plainText") {
                throw new Error("Can't create elements on plain text editor");
            }
        },
        h1: function() {
            if (this.__type === "plainText") {
                throw new Error("Can't create elements on plain text editor");
            }
        },
        h2: function() {
            if (this.__type === "plainText") {
                throw new Error("Can't create elements on plain text editor");
            }
        },
        h3: function() {
            if (this.__type === "plainText") {
                throw new Error("Can't create elements on plain text editor");
            }
        },
        h4: function() {
            if (this.__type === "plainText") {
                throw new Error("Can't create elements on plain text editor");
            }
        },
        h5: function() {
            if (this.__type === "plainText") {
                throw new Error("Can't create elements on plain text editor");
            }
        },
        h6: function() {
            if (this.__type === "plainText") {
                throw new Error("Can't create elements on plain text editor");
            }
        },
        subscript: function() {
            if (this.__type === "plainText") {
                throw new Error("Can't create elements on plain text editor");
            }
        },
        superscript: function() {
            if (this.__type === "plainText") {
                throw new Error("Can't create elements on plain text editor");
            }
        }
    };

    $.each([
            "bold", "italic", "underline",
            "fontSize", "fontFamily",
            "color", "backgroundColor",
            "unorderedList", "orderedList",
            "textAlign"
        ], function() {
            var command = this;
            Arte.prototype[command] = function(options) {
                return this.exec(command, options);
            };
        });

    $.each([
            "blockquote",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "subscript", "superscript",
        ], function() {
            var command = this;
            Arte.prototype[command] = function() {
                return this.exec(command);
            };
        });

    $.extend(Arte.prototype, {
        exec: function(command, options) {
            var result;

            this.triggerEvent({
                type: "arte-beforecommand",
                options: options,
                command: command
            });

            result = commands[command].call(this, options);

            this.triggerEvent({
                type: "arte-command",
                options: options,
                command: command
            });

            return result;
        }
    });
});
