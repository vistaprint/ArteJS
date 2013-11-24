$(function () {
    // data-command behavior
    $("[data-command]").on({
        "mousedown": function (e) {
            return false;
        },
        "click": function (e) {
            var $this = $(this);
            var commandName = $this.attr("data-command");
            var commandValue = $this.attr("data-command-value");
            $(".editor").Arte(commandName, commandValue);

            return false;
        }
    });

    // data-select behavior
    $("[data-select]").on({
        "mousedown": function (e) {
            e.stopPropagation();
        },
        "change": function (e) {
            var $this = $(this);
            var commandName = $this.attr("data-select");
            var commandValue = $this.val();
            $(".editor").Arte(commandName, commandValue);

            return false;
        }
    });

    // Refreshes the toolbar based on the state of the selected text
    function refreshToolbar() {
        var state = $(".editor").Arte("getState").get(0);
        $("[data-command]").each(function () {
            var $this = $(this);
            var commandName = $this.attr("data-command");

            if (commandName && state[commandName] !== undefined) {
                var op = state[commandName] ? "addClass" : "removeClass";
                $this[op]("selected");
            }
        });

        $("[data-select]").each(function () {
            var $this = $(this);
            var commandName = $this.attr("data-select");

            if (commandName && state[commandName] !== undefined) {
                $this.val(state[commandName]);
            }
        });
    }

    // state of undo/redo buttons
    function refreshUndoRedo() {
        var undoOp = $(".editor").Arte("hasUndo") ? "addClass" : "removeClass";
        var redoOp = $(".editor").Arte("hasRedo") ? "addClass" : "removeClass";

        $("[data-command='undo']")[undoOp]("disabled");
        $("[data-command='redo']")[redoOp]("disabled");
    }

    // Initialize an instance of Arte with some initial values
    $(".editor").Arte({
        value: "This is the initial value of the text editor ..",
        // Listen to a set of interesting events
        on: {
            onvaluechange: function (e, data) {
                refreshUndoRedo();
            },
            onselectionchange: function (e, data) {
                refreshToolbar();
            },
            oncommand: function (e, data) {
                refreshToolbar();
            }
        }
    });
});