QUnit.module("methods", {
    beforeEach: function() {
        this.element = $("#test-element");
    }
});

// value, outerValue, focus, triggerEvent, destroy, on, off

QUnit.test("Arte.prototype.value - plainText", function(t) {
    var arte = new Arte(this.element);

    t.strictEqual(arte.value(), "Please enter text ...", "returns a value");

    arte.value("<p><em>foo</em><span></span><br/></p>");

    t.strictEqual(arte.value(), "<p><em>foo</em><span></span><br/></p>", "set a new value");
});

QUnit.test("Arte.prototype.value - richText", function(t) {
    var arte = new Arte(this.element, {
        editorType: "richText"
    });

    t.strictEqual(arte.value(), "Please enter text ...", "returns a value");

    arte.value("<p><em>foo</em><span></span><br></p>");

    t.strictEqual(arte.value(), "<p><em>foo</em><span></span><br></p>", "set a new value");
});

QUnit.test("Arte.prototype.outerValue", function(t) {
    var arte = new Arte(this.element, {
        editorType: "richText"
    });

    var outerHTML = arte.element[0].outerHTML;

    t.strictEqual(arte.outerValue(), outerHTML, "returns an outer value");
});

QUnit.test("Arte.prototype.focus", function(t) {
    var arte = new Arte(this.element, {
        editorType: "richText"
    });

    arte.element
        .blur()
        .focus(function() {
            t.ok(true, "focus");
        });

    t.expect(1);

    arte.focus();

    // TODO: test cursor position
});

QUnit.test("Arte.prototype.triggerEvent", function(t) {
    var arte = new Arte(this.element);

    t.expect(2);

    arte.on("my-custom-event", function() {
        t.ok(true, "triggered custom event");
    });

    arte.element.on("my-custom-event", function() {
        t.ok(true, "triggered custom event on jQuery element");
    });

    arte.triggerEvent("my-custom-event");
});

QUnit.test("Arte.prototype.destroy", function(t) {
    var arte = new Arte(this.element);

    arte.on("after-destroy", function() {
        t.ok(false, "can't trigger any event after destroying");
    });

    arte.destroy();

    arte.triggerEvent("after-destroy");

    t.strictEqual($(document).find(arte.element).length, 0);
});

QUnit.test("Arte.prototype.destroy - removeContent", function(t) {
    var arte = new Arte(this.element);

    t.expect(3);

    arte.destroy({removeContent: true});

    arte.on("after-destroy", function() {
        t.ok(true, "just removed contents");
    });

    arte.triggerEvent("after-destroy");

    t.strictEqual(this.element.find(arte.element).length, 1);
    t.strictEqual(arte.element.html(), "");
});

QUnit.test("Arte.prototype.on", function(t) {
    var arte = new Arte(this.element);

    arte.on("custom-event", function() {
        t.ok(true, "attachs a custom event on arte object");
    });

    arte.element.trigger("custom-event");
});

QUnit.test("Arte.prototype.off", function(t) {
    var arte = new Arte(this.element);

    t.expect(0);

    arte.on("custom-event", function() {
        t.ok(false, "dettachs a custom event on arte object");
    });

    arte.off("custom-event");

    arte.element.trigger("custom-event");
});
