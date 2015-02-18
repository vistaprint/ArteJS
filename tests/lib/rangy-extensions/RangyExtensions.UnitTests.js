$(document).ready(function() {
    var jElement;
    var setUp = function() {
        jElement = $(
            "<div class='testRegion'>First <b>line of</b> the text<br />Second line with br break<br />" +
            "<p>A new paragraph line</p><div>A line enclosed into a div element</div>Line between div and paragraph" +
            "<p>Line that starts with paragraph but ends with br<br />Line that starts with br but ends with paragraph</p>" +
            "<ul><li>Line that is enclosed into li</li><li><div>Line inside li and div</div></li></ul>" +
            "<p><b>A paragraph with a b tag</b></p><b><p>A bolded paragraph</p></b><p>First line of <b>Paragraph<br />" +
            "With br at </b>the new line</p>A new line with an empty b tag at the end<b></b><br/>" +
            "A new line with a b tag at the <b>end</b><br/>A last line in the parent div. " +
            "<span>with a span at the end</span></div>"
        );
        jElement.appendTo(TEST_ELEMENT_SELECTOR);
    };

    var tearDown = function tearDown() {
        jElement.remove();
    };

    QUnit.module("rangy.rangy-extensions");

    QUnit.test("rangy.splitByBlock", function(assert) {
        setUp();

        var range = rangy.createRangyRange();
        range.selectNodeContents($(".testRegion")[0]);
        var allRanges = range.splitByBlock();
        assert.equal(allRanges.length, 16, "");
        tearDown();
    });
});
