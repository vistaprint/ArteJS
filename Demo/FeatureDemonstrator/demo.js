(function () {
    // List of buttons 
    var buttons = [
        "bold",
        "italic",
        "underline",
        //"blockquote",
        //"textAlignLeft",
        "textAlignCenter",
        //"textAlignRight",
        "h1",
        "h2",
        //"h3",
        //"h4",
        //"h5",
        //"h6",
        "subscript",
        "superscript",
        "unorderedList",
        "orderedList",
        "undo",
        "redo",
        "fontSize",
        //"fontFamily",
        "color",
        //"backgroundColor",
        //"insertLink"
    ];
    
    // Read the data from the editor and update the other displays
    function update() {
        var editor = $(".editor").Arte().get(0);
        $(".result").html(editor.outerValue());
        $(".resultHtml").text(editor.outerValue());
    };

    function logEventToConsole(e, data) {
        var count = $(".console").children().length;
        var dataClone = $.extend(true, {}, data);
        delete dataClone.textArea; // remove these circular objects
        delete dataClone.originalEvent; 
        var content = $("<div>").text(count + ": " + e.type + "=> " + JSON.stringify(dataClone));
        $(".console").prepend(content);
    }
    
    var editorEventHandlers = {
        "onvaluechange": function (e, data) {
            update();
            logEventToConsole(e, data);
        },
        "onfocus": logEventToConsole,
        "onblur": logEventToConsole,
        "onmousedown": logEventToConsole,
        "onmouseup": logEventToConsole,
        "onclick": logEventToConsole,
        "onkeydown": logEventToConsole,
        "onkeypress": logEventToConsole,
        "onkeyup": logEventToConsole,
        "onpaste": logEventToConsole,
        "onselectionchange": logEventToConsole,
        "onbeforecommand": logEventToConsole,
        "oncommand": logEventToConsole,
        "oncreate": logEventToConsole,
        "ondestroy": logEventToConsole
    }


    var createEditorAndToolbar = function () {
        $(".editor").Arte({
            editorType: $(".editorIsPlainText").is(":checked") ? $.Arte.constants.editorTypes.plainText : $.Arte.constants.editorTypes.richText,
            on: editorEventHandlers,
            styles: {
                height: "200px",
                overflow: "auto"
            }
        });

        $(".editor").Arte("value", $.Arte.configuration.initialValues.value);

        $(".toolbar").ArteToolbar({
            buttons: buttons
        });

        update();
    };

    var destroyEditorAndToolbar = function () {
        $(".editor").Arte("destroy", { removeContent: true });
        $(".toolbar").ArteToolbar("destroy");
    };
    
    var ResetConfiguration = function () {
        // Editor configurations
        if ($(".editorIsPlainText").is(":checked"))
        {
            $("[name=attrType][value=styleName]").prop("checked", true);
            $("[name=attrType][value=tagName]").parent().hide();
        } else
        {
            $("[name=attrType][value=tagName]").parent().show();
        }

        var commandAttrType = $("[name=attrType]:checked").val();
        $.Arte.configuration.commandAttrType = commandAttrType;
        $.Arte.configuration.requireFocus = $(".requireFocus").is(":checked");

        // Toolbar configurations
        $.Arte.Toolbar.configuration.commandAttrType = commandAttrType;
        $.Arte.Toolbar.configuration.requireEditorFocus = $(".requireEditorFocus").is(":checked");

        $(".console").empty();
    };

    $(".configuration input").on("change", function (e) {
        console.log("configuration clicked. " + e.target + ", time: " + e.originalEvent.timeStamp);
        destroyEditorAndToolbar();
        ResetConfiguration();
        createEditorAndToolbar();
    });

    $(function () {
        $.Arte.configuration.allowOpsOnCollapsedSelection = false;
        $.extend(true, $.Arte.Toolbar.configuration, {
            classes: {
                "button": {
                    "selected": "btn-success"
                },
                "dialog":
                {
                    "insertLink": {
                        "label": "add-on",
                        "input": "input-medium"
                    }
                }
            }
        });

        // Check the initial values
        // Editor Configuration
        $("[value=" + $.Arte.configuration.commandAttrType + "]").prop("checked", true);
        $(".requireFocus").prop("checked", $.Arte.Toolbar.configuration.requireFocus);

        // Toolbar configuration
        $(".requireEditorFocus").prop("checked", $.Arte.Toolbar.configuration.requireEditorFocus);

        createEditorAndToolbar();
    });
})();