QUnit.module("commands - richText", {
    beforeEach: function() {
        this.element = $("#test-element");
        this.arte = new Arte(this.element, {
            editorType: "richText"
        });
    }
});

// Commands that return tags
var tagCommands = {
        bold: "b",
        italic: "i",
        underline: "u",
        blockquote: "blockquote",
        h1: "h1",
        h2: "h2",
        h3: "h3",
        h4: "h4",
        h5: "h5",
        h6: "h6"
    };

var spanCommands = {
        fontSize: ["10px", "20px"],
        fontFamily: ["Verdana", "monospace"],
        color: ["rgb(0, 0, 0)", "rgb(255, 255, 255)"],
        backgroundColor: ["rgb(255, 255, 255)", "rgb(0, 0, 0)"],
        textAlign: ["center", "right"]
    };

$.each(tagCommands, function(command, tag) {
    QUnit.test(command + " - no selection", function(t) {
        var arte = this.arte;

        t.expect(3);

        arte.value("foo");

        // TODO: set selection cursor on the last character.
        arte[command]();
        t.strictEqual(
            arte.value(),
            "foo<" + tag + "></" + tag + ">",
            "creates " + command + " tags"
        );

        // TODO: assert cursor is inside <tag></tag>

        arte[command]();
        t.strictEqual(arte.value(), "foo", "revert " + command + " tags");
    });

    QUnit.test(command + " - selected text", function(t) {
        var arte = this.arte;

        t.expect(5);

        arte.value("foo bar baz");

        // TODO: select "bar "

        arte[command]();
        t.strictEqual(
            arte.value(),
            "foo <" + tag + ">bar </" + tag + ">baz",
            "set " + command + " tags in selection"
        );

        // TODO: assert "<tag>bar </tag>" is now selected
        // TODO: assert cursor position starts on previous "bar " started

        // TODO: select "bar ba"
        arte[command]();
        t.strictEqual(
            arte.value(),
            "foo <" + tag + ">bar ba</" + tag + ">z",
            "extend " + command + " tags to selection"
        );

        // expecting "<tag>bar ba</tag>" is now selected
        arte[command]();
        t.strictEqual(
            arte.value(),
            "foo bar baz",
            "revert " + command + " tags"
        );
        // TODO: assert "bar ba" is now selected
    });
});

$.each(spanCommands, function(command, values) {
    QUnit.test(command + " - no selection", function(t) {
        var arte = this.arte;

        arte.value("foo");

        arte.element.css(command, values[0]);
        t.strictEqual(arte[command](), values[0], "return");

        arte[command](values[1]);
        t.strictEqual(arte.element.css(command), values[1], "set");
    });

    QUnit.test("fontFamily - selected text", function(t) {
        var arte = this.arte;
        var spanTag;

        arte.value("foo bar baz");

        // TODO: select "bar "

        arte[command](values[0]);
        spanTag = arte.element.find("span");
        t.strictEqual(spanTag.length, 1, "sets a span tag");
        t.strictEqual(spanTag.css(command), values[0]);
        t.strictEqual(spanTag.html(), "bar ");

        arte[command](values[1]);
        spanTag = arte.element.find("span");
        t.strictEqual(spanTag.length, 1, "keeps the span tag");
        t.strictEqual(spanTag.css(command), values[1]);
        t.strictEqual(spanTag.html(), "bar ");
    });
});

QUnit.test("unorderedList", function() {
    var arte = this.arte;

    arte.unorderedList();
});

QUnit.test("orderedList", function() {
    var arte = this.arte;

    arte.orderedList();
});

QUnit.test("superscript", function() {
    var arte = this.arte;

    arte.superscript();
});

QUnit.test("subscript", function() {
    var arte = this.arte;

    arte.subscript();
});
