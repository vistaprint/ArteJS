QUnit.module("initialization", {
    beforeEach: function() {
        this.element = $("#test-element");
    }
});

QUnit.test("basic", function(assert) {
    this.element.Arte();
    assert.ok(this.element.prop("contenteditable"), "turns into a contenteditable item");
    assert.strictEqual(this.element.text(), "Please enter text ...", "set's default text");
    assert.strictEqual(this.element.height(), 200, "set's basic height");
});

QUnit.test("multiple elements", function(assert) {
    var elem;
    var multiple = $("<div/><div/>")
            .addClass("foo")
            // Appends the new elements so we get a proper height value
            .appendTo(this.element);

    multiple.Arte();

    elem = multiple.first();

    assert.ok(elem.prop("contenteditable"), "turns into a contenteditable item");
    assert.strictEqual(elem.text(), "Please enter text ...", "set's default text");
    assert.strictEqual(elem.height(), 200, "set's basic height");

    elem = multiple.last();

    assert.ok(elem.prop("contenteditable"), "turns into a contenteditable item");
    assert.strictEqual(elem.text(), "Please enter text ...", "set's default text");
    assert.strictEqual(elem.height(), 200, "set's basic height");
});

QUnit.test("no element", function(assert) {
    var elem = $("#i-dont-exist");
    var result = elem.Arte();
    assert.equal(result, elem, "an empty jQuery object doesn't create an Arte object");
});

QUnit.module("commands", {
    beforeEach: function() {
        this.element = $("#test-element");
    }
});

QUnit.test("bold", function(assert) {
    var arte;

    arte = this.element.Arte();

    arte.text("foo");

    arte.Arte("bold");

    assert.equal(arte.html(), undefined);
    assert.equal(this.element.html(), undefined);
});
