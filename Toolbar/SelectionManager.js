(function($) {
    $.Arte.Toolbar = $.Arte.Toolbar || {};
    $.Arte.Toolbar.SelectionManager = function() {
        var editors = $();
        var selectedEditors = [];

        var isValidSelection = function() {
            var userSelection = rangy.getSelection();
            var range = userSelection.getAllRanges()[0];
            if (range) {
                var textFields = this.getSelectedFields();
                return $.Arte.util.any(textFields, function(index, textField) {
                    return textField.$el.get(0) === range.startContainer || textField.$el.has(range.startContainer).get(0);
                });
            }
            return false;
        };

        this.getSelectedEditors = function(types) {
            if (types) {
                return $.Arte.util.filterCollection(selectedEditors, function(index, textField) {
                    return $.Arte.util.any(types, function(i, type) {
                        return textField.editorType === type;
                    });
                });
            }

            return selectedEditors;
        };

        this.getEditors = function(types) {
            if (types) {
                return $.Arte.util.filterCollection(editors, function(index, textField) {
                    return $.Arte.util.any(types, function(i, type) {
                        return textField.editorType === type;
                    });
                });
            }
            return editors;
        };

        this.initialize = function(options) {
            var me = this;
            var elements = options && options.editor ? $(options.editor) :
                $("[" + $.Arte.configuration.textFieldIdentifier + "]");

            editors = $.map(elements, function(element) {
                return $(element).Arte().get(0);
            });

            $.each(editors, function() {
                this.on({
                    onfocus: function(e, data) {
                        me.clear();
                        selectedEditors.push(data.textArea);
                        $(me).trigger("selectionchanged", e);
                    },
                    onselectionchange: function(e) {
                        $(me).trigger("selectionchanged", e);
                    }
                });
            });
        };

        this.clear = function() {
            selectedEditors.splice(0, selectedEditors.length);
        };
        this.on = function(type, handler) {
            $(this).on(type, handler);
        };
        this.off = function(type, handler) {
            $(this).off(type, handler);
        };
    };
})(jQuery);
