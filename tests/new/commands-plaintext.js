QUnit.module("commands - plaintext", {
    beforeEach: function() {
        this.element = $("#test-element");
        this.arte = new Arte(this.element);
    }
});

QUnit.test("bold", function(t) {
    var arte = this.arte;

    arte.element.css("fontWeight", 400);

    arte.bold();

    // Crossbrowser support
    var validBold = [
        "bold", "700"
    ];
    t.ok(validBold.indexOf(arte.element.css("fontWeight")) >= 0);

    arte.bold();
    t.equal(arte.element.css("fontWeight"), "400");
});

QUnit.test("italic", function(t) {
    var arte = this.arte;

    arte.element.css("fontStyle", "normal");

    arte.italic();
    t.strictEqual(arte.element.css("fontStyle"), "italic");

    arte.italic();
    t.strictEqual(arte.element.css("fontStyle"), "normal");
});

QUnit.test("underline", function(t) {
    var arte = this.arte;

    arte.element.css("textDecoration", "none");

    arte.underline();
    t.strictEqual(arte.element.css("textDecoration"), "underline");

    arte.underline();
    t.strictEqual(arte.element.css("textDecoration"), "none");
});

QUnit.test("fontSize", function(t) {
    var arte = this.arte;

    arte.element.css("fontSize", "10px");

    t.equal(arte.fontSize(), "10px");

    arte.fontSize(20);
    t.equal(arte.element.css("fontSize"), "20px");

    arte.fontSize(15);
    t.equal(arte.element.css("fontSize"), "15px");

    t.equal(arte.fontSize(), "15px");
});

QUnit.test("fontFamily", function(t) {
    var arte = this.arte;

    arte.element.css("fontFamily", "Verdana");

    t.strictEqual(arte.fontFamily(), "Verdana");

    arte.fontFamily("Arial");
    t.strictEqual(arte.element.css("fontFamily"), "Arial");
});

QUnit.test("color", function(t) {
    var arte = this.arte;

    arte.element.css("color", "#000");
    t.strictEqual(arte.color(), "rgb(0, 0, 0)");

    arte.color("#fff");
    t.strictEqual(arte.element.css("color"), "rgb(255, 255, 255)");
});

QUnit.test("backgroundColor", function(t) {
    var arte = this.arte;

    arte.element.css("backgroundColor", "black");
    t.strictEqual(arte.backgroundColor(), "rgb(0, 0, 0)");

    arte.backgroundColor("#fff");
    t.strictEqual(arte.element.css("backgroundColor"), "rgb(255, 255, 255)");
});

QUnit.test("unorderedList", function(t) {
    var arte = this.arte;

    t.throws(
        function() {
            arte.unorderedList();
        },
        /Can't create lists on plain text editors/,
        "Throws and error after trying to create lists on plaintext editors"
    );
});

QUnit.test("orderedList", function(t) {
    var arte = this.arte;

    t.throws(
        function() {
            arte.orderedList();
        },
        /Can't create lists on plain text editors/,
        "Throws and error after trying to create lists on plaintext editors"
    );
});

QUnit.test("textAlign", function(t) {
    var arte = this.arte;

    arte.element.css("textAlign", "center");
    t.strictEqual(arte.textAlign(), "center");

    arte.textAlign("left");
    t.strictEqual(arte.element.css("textAlign"), "left");
});

QUnit.test("blockquote", function(t) {
    t.throws(
        function() {
            this.arte.blockquote();
        },
        "arte.blockquote() throws an error on plain text editors"
    );
});

QUnit.test("h1", function(t) {
    t.throws(
        function() {
            this.arte.h1();
        },
        "arte.h1() throws an error on plain text editors"
    );
});

QUnit.test("h2", function(t) {
    t.throws(
        function() {
            this.arte.h2();
        },
        "arte.h2() throws an error on plain text editors"
    );
});

QUnit.test("h3", function(t) {
    t.throws(
        function() {
            this.arte.h3();
        },
        "arte.h3() throws an error on plain text editors"
    );
});

QUnit.test("h4", function(t) {
    t.throws(
        function() {
            this.arte.h4();
        },
        "arte.h4() throws an error on plain text editors"
    );
});

QUnit.test("h5", function(t) {
    t.throws(
        function() {
            this.arte.h5();
        },
        "arte.h5() throws an error on plain text editors"
    );
});

QUnit.test("h6", function(t) {
    t.throws(
        function() {
            this.arte.h6();
        },
        "arte.h6() throws an error on plain text editors"
    );
});

QUnit.test("superscript", function(t) {
    t.throws(
        function() {
            this.arte.superscript();
        },
        "arte.superscript() throws an error on plain text editors"
    );
});

QUnit.test("subscript", function(t) {
    t.throws(
        function() {
            this.arte.subscript();
        },
        "arte.subscript() throws an error on plain text editors"
    );
});
