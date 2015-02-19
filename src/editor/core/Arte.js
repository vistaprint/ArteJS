/**
 * @fileoverview jQuery wrapper around the Rich text editor
 * Usage:
 *  1) $(selector).Arte()
 *     Converts the matched elements into rich text editor using default options or returns and existing instance
 *  2) $(selector).Arte({ options });
 *     Converts the matched elements into rich text editor using the options supplied or returns and existing instance
 *  3) $(selector).Arte(command, arguments)
 *     Execute a rich text command with arguments
 */
(function($) {
    $.Arte = $.Arte || {};
    $.fn.Arte = function(options, args) {
        var result = [];
        rangy.init();
        this.each(function() {
            var $this = $(this);
            var editor = $this.data("Arte");
            if (options && typeof(options) === "string") {
                // Most likely this is a method call
                var methodName = options;
                if (this.constructor === $.Arte.TextArea) {
                    editor = this;
                }

                if (!editor) {
                    throw "This is not a rich text field.";
                }

                var returnValue = editor[methodName].call(editor, args);
                result.push(returnValue);
            } else {
                // If $this is not a rich text editor, construct the editor
                if (!editor) {
                    options = options || {};
                    options.element = this;
                    editor = new $.Arte.TextArea(options);
                    $this.data("Arte", editor);
                }
                result.push(editor);
            }
        });
        return $(result);
    };
})(jQuery);
