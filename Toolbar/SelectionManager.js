(function ($) {
    $.Arte.Toolbar = $.Arte.Toolbar || {};
    $.Arte.Toolbar.SelectionManager = function () {
        return {
            selection: [],
            isValidSelection: function () {
                var userSelection = rangy.getSelection();
                var range = userSelection.getAllRanges()[0];
                if (range) {
                    var textFields = this.getSelectedFields();
                    return $.Arte.util.any(textFields, function (index, textField) {
                        return textField.$el.get(0) === range.startContainer || textField.$el.has(range.startContainer).get(0);
                    });
                }
                return false;
            },
            getSelectedFields: function (types) {
                if (types) {
                    return $.Arte.util.filterCollection(this.selection, function (index, textField) {
                        return $.Arte.util.any(types, function (i, type) {
                            return textField.editorType === type;
                        });
                    });
                }

                return this.selection;
            },
            initialize: function (options) {
                var me = this;
                var elements = options && options.editor ? $(options.editor) :
                    $("[" + $.Arte.configuration.textFieldIdentifier + "]");

                elements.each(function () {
                    $(this).on({
                        onfocus: function (e, data) {
                            me.selection.splice(0, me.selection.length);
                            me.selection.push(data.textArea);
                            $(me).trigger("selectionchanged", e);
                        },
                        onselectionchange: function (e) {
                            $(me).trigger("selectionchanged", e);
                        }
                    });
                });
            },
            clear: function () {
                this.selection.splice(0, this.selection.length);
            },
            on: function (type, handler) {
                $(this).on(type, handler);
            },
            off: function (type, handler) {
                $(this).off(type, handler);
            }
        };
    };
})(jQuery);