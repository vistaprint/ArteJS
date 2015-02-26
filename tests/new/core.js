QUnit.module("initialization", {
    beforeEach: function() {
        this.element = $("#test-element");
    }
});

QUnit.test("basic", function(t) {
    var arte = new Arte(this.element);

    t.ok(arte.element.hasClass("arte-plaintext"));
    t.strictEqual(arte.element.val(), "Please enter text ...", "sets default value");
    t.strictEqual(arte.element.height(), 200, "sets basic height");
});

QUnit.test("without the new", function(t) {
    var arte = Arte(this.element);

    t.ok(arte instanceof Arte);
});

QUnit.test("multiple elements", function(t) {
    var elem;
    var multiple = $("<div/><div/>")
            .addClass("foo")
            // Appends the new elements so we get a proper height value
            .appendTo(this.element);

    var arte = Arte(multiple);

    elem = multiple.first();

    t.strictEqual(elem.children(arte.elem).length, 1, "Arte obj contains only the affected element");
    t.strictEqual(arte.container.length, 1, "Arte obj contains only the affected element");

    t.strictEqual(multiple.last().html(), $("<div.foo/>").html(), "Other elements than first are not affected");
});

QUnit.test("no element", function(t) {
    var elem = $("#i-dont-exist");
    t.throws(
        function() {
            Arte(elem);
        },
        /Arte requires a DOM element/,
        "Arte will throw an error if it doesnt't receive an existing element"
    );
});

QUnit.test("custom options", function(t) {
    var arte = new Arte(this.element, {
            styles: {
                "height": "100px"
            },

            // Collection of classes applied to rich text editor
            classes: ["foo"],

            // Initial value of the text editor
            value: "Custom text",

            editorType: "richText"
        });

    t.ok(arte.element.attr("contenteditable"), "richText creates a contenteditable elem");
    t.ok(arte.element.hasClass("arte-richtext"));
    t.strictEqual(arte.element.text(), "Custom text", "sets custom text");
    t.strictEqual(arte.element.height(), 100, "sets custom height");
    t.ok(arte.element.hasClass("foo"), "Custom class");
});

QUnit.test("rich text initializes with a html content", function(t) {
    var arte = new Arte(this.element, {
            value: "<p>foo</p><div></div>",
            editorType: "richText"
        });

    // catches <p> and <div>
    t.strictEqual(arte.element.children().length, 2);
    t.strictEqual(arte.element.children('p').text(), "foo");
});
