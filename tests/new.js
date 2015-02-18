QUnit.module("Basics", {
    beforeEach: function() {
        this.element = $("#test-element");
    }
});

QUnit.test("simple usage", function(assert) {
    this.element.Arte();
    assert.strictEqual(this.element.html(),
        "<div class=\"\" style=\"min-height: 200px; height: inherit;\" contenteditable=\"true\">Please enter text ...</div>");
});

QUnit.test("ArteJS returns something", function(assert) {
    var object = this.element.Arte();

    // Breaking
    assert.ok(object instanceof Arte, "Object is an instance of Arte");
});
