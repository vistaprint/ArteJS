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

QUnit.test("no element", function(assert) {
    var result = $("#i-dont-exist").Arte();
    assert.equal(result, false, "an empty jQuery object doesn't create an Arte object");
});

QUnit.test("multiple elements", function(assert) {
    var multiple = $("<div/><div/>").addClass("foo");

    multiple.Arte();

    assert.strictEqual(multiple.first().html(),
        "<div class=\"\" style=\"min-height: 200px; height: inherit;\" contenteditable=\"true\">Please enter text ...</div>",
        "only the first element is affected");
    assert.strictEqual(multiple.last().html(), "", "the last element is not affected");
});

QUnit.test("commands", function(assert) {
    var arte = this.element.Arte();

    arte.Arte("bold");

    assert.equal(arte.Arte("bold"), undefined);
});
