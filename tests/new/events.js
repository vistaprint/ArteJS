QUnit.module("events", {
    beforeEach: function() {
        this.element = $("#test-element");
    }
});

QUnit.test("keydown", function(t) {
    var arte = new Arte(this.element);

    t.expect(2);

    arte.on("arte-keydown", function() {
        t.ok(true, "triggered");
    });

    arte.on("keydown", function(ev) {
        t.ok(ev.isPropagationStopped());
    });

    arte.element.trigger("keydown");
});

QUnit.test("keyup", function(t) {
    var arte = new Arte(this.element);

    t.expect(2);

    arte.on("arte-keyup", function() {
        t.ok(true, "triggered");
    });

    arte.on("keyup", function(ev) {
        t.ok(ev.isPropagationStopped());
    });

    arte.element.trigger("keyup");
});

QUnit.test("keypress", function(t) {
    var arte = new Arte(this.element);

    t.expect(2);

    arte.on("arte-keypress", function() {
        t.ok(true, "triggered");
    });

    arte.on("keypress", function(ev) {
        t.ok(ev.isPropagationStopped());
    });

    arte.element.trigger("keypress");
});

QUnit.test("focus", function(t) {
    var arte = new Arte(this.element);

    t.expect(2);

    arte.on("arte-focus", function() {
        t.ok(true, "triggered");
    });

    arte.on("focus", function(ev) {
        t.ok(ev.isPropagationStopped());
    });

    arte.element.trigger("focus");
});

QUnit.test("blur", function(t) {
    var arte = new Arte(this.element);

    t.expect(3);

    arte.on("arte-blur", function() {
        t.ok(true, "triggered");
    });

    arte.on("blur", function(ev) {
        t.ok(ev.isPropagationStopped());
    });

    arte.on("arte-selectionchange", function() {
        t.ok(true, "triggered arte-selectionchange");
    });

    arte.element.trigger("blur");
});

QUnit.test("mouseup", function(t) {
    var arte = new Arte(this.element);

    t.expect(3);

    arte.on("arte-mouseup", function() {
        t.ok(true, "triggered");
    });

    arte.on("mouseup", function(ev) {
        t.ok(!ev.isPropagationStopped());
    });

    arte.on("arte-selectionchange", function() {
        t.ok(true, "triggered arte-selectionchange");
    });

    arte.element.trigger("mouseup");
});

QUnit.test("mousedown", function(t) {
    var arte = new Arte(this.element);

    t.expect(2);

    arte.on("arte-mousedown", function() {
        t.ok(true, "triggered");
    });

    arte.on("mousedown", function(ev) {
        t.ok(!ev.isPropagationStopped());
    });

    arte.on("arte-selectionchange", function() {
        t.ok(false, "can't trigger arte-selectionchange");
    });

    arte.element.trigger("mousedown");
});

QUnit.test("click", function(t) {
    var arte = new Arte(this.element);

    t.expect(2);

    arte.on("arte-click", function() {
        t.ok(true, "triggered");
    });

    arte.on("click", function(ev) {
        t.ok(!ev.isPropagationStopped());
    });

    arte.on("arte-selectionchange", function() {
        t.ok(false, "can't trigger arte-selectionchange");
    });

    arte.element.trigger("click");
});

QUnit.test("paste", function(t) {
    var arte = new Arte(this.element);

    t.expect(2);

    arte.on("arte-paste", function() {
        t.ok(true, "triggered");
    });

    arte.on("paste", function(ev) {
        t.ok(!ev.isPropagationStopped());
    });

    arte.on("arte-selectionchange", function() {
        t.ok(false, "can't trigger arte-selectionchange");
    });

    arte.element.trigger("paste");
});

QUnit.test("original events", function(t) {
    var i;
    var arte = new Arte(this.element);
    var originalEvents = "keydown keyup keypress focus blur mouseup mousedown click paste".split(" ");
    var event;
    var eventCallback = function(ev) {
            t.strictEqual(ev.originalEvent.type, event, "sends original event");
        };

    for (i = 0; i < originalEvents.length; i++) {
        event = originalEvents[i];
        arte.on("arte-" + event, eventCallback);
        arte.triggerEvent(event);
    }
});
