$(document).ready(function()
{
    module("rangy.rangy.blockElementApplier.blockSurround");
    unitTestHelper.executeTestCollection(blockSurroundUnitTestData, function(testData)
    {
        var range = unitTestHelper.createRange(testData);
        rangy.toggleSurroundRange(range, testData.blockOptions);
        if (testData.cleanup)
        {
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        }
    });
    complexBlockSurroundUnitTests();

    module("rangy.rangy.blockElementApplier.blockSetSurround");
    unitTestHelper.executeTestCollection(blockSetSurroundUnitTestsData, function(testData)
    {
        var range = unitTestHelper.createRange(testData);
        rangy.toggleSurroundRangeSet(range, testData.blockOptions);
        if (testData.cleanup)
        {
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        }
    });

    complexBlockSetSurroundUnitTests();

});

var options = { applierTagName: "P", commandAttrType: $.Arte.constants.commandAttrType.styleName, styleName: "text-align", styleValue: "left" };

var blockSurroundUnitTestData = [
     {
         name: 'leftAlign',
         rangeContentId: 'r ',
         blockOptions: options,
         cleanup: 'true',
         rawContent: '<p id="r">SomeText</p>',
         expectedContent: '<div style="text-align: left">SomeText</div>'
     },
     {
         name: 'leftAlignLineWithTextAroundSpan',
         rangeContentId: 'r',
         blockOptions: options,
         cleanup: 'true',
         rawContent: 'Line 1<span id="r"> Line 2 </span> Line 3',
         expectedContent: '<div style="text-align: left;">Line 1 Line 2  Line 3</div>'
     },
        {
            name: 'leftAlignDiv',
            rangeContentId: 'r',
            blockOptions: options,
            cleanup: 'true',
            rawContent: '<div id="r"> Line 2 </div>',
            expectedContent: '<div style="text-align: left">Line 2</div>'
        },
        {
            name: 'leftAlignDivWithSpan',
            rangeContentId: 'r',
            blockOptions: options,
            cleanup: 'true',
            rawContent: '<div><span id="r">Line 2</span></div>',
            expectedContent: '<div style="text-align: left">Line 2</div>'
        },
        {
            // Tests if the empty spaces are maintained around the html elements
            name: 'leftAlignDivWithSpanAndSpaces',
            rangeContentId: 'r',
            blockOptions: options,
            cleanup: 'true',
            rawContent: '<div> <span id="r"> Line 2 </span> </div>',
            expectedContent: '<div style="text-align: left">  Line 2  </div>'
        },

        {
            name: 'leftAlignDivInDivWithSpan',
            rangeContentId: 'r',
            blockOptions: options,
            cleanup: 'true',
            rawContent: '<div><div > <span id="r"> Line 2 </span> </div></div>',
            expectedContent: '<div style="text-align: left"> Line 2 </div>'
        },
        {
            name: 'centerAlign',
            rangeContentId: 'r',
            blockOptions: $.extend({}, options, { styleValue: "center" }),
            cleanup: 'true',
            rawContent: '<p id="r">SomeText</p>',
            expectedContent: '<div style="text-align: center">SomeText</div>'
        },
        {
            name: 'rightAlign',
            rangeContentId: 'r',
            blockOptions: $.extend({}, options, { styleValue: "right" }),
            cleanup: 'true',
            rawContent: '<p id="r">SomeText</p>',
            expectedContent: '<div style="text-align: right">SomeText</div>'
        }
    ];




function complexBlockSurroundUnitTests()
{
    var complexBlockSurroundUnitTestData = {
        leftAlignLineWithBr: {
            name: 'leftAlignLineWithBr',
            blockOptions: options,
            cleanup: 'true',
            rawContent: 'Line <br/>',
            expectedContent: '<div style="text-align: left">Line </div>'
        },
        rightAlignLeftAlign: {
            name: 'rightAlignLeftAlign',
            blockOptions: $.extend({}, options, { styleValue: "right" }),
            cleanup: 'true',
            rangeContentId: 'editableDiv',
            rawContent: '<p id="r">SomeText</p>',
            expectedContent: '<div style="text-align: left">SomeText</div>'
        },
        rightAlignCenterAlign: {
            name: 'rightAlignCenterAlign',
            rangeContentId: 'editableDiv',
            blockOptions: $.extend({}, options, { styleValue: "right" }),
            cleanup: 'true',
            rawContent: '<p id="r">SomeText</p>',
            expectedContent: '<div style="text-align: center">SomeText</div>'
        },
        rightAlignRightAlign: {
            name: 'rightAlignRightAlign',
            rangeContentId: 'editableDiv ',
            blockOptions: $.extend({}, options, { styleValue: "right" }),
            cleanup: 'true',
            rawContent: '<p id="r">SomeText</p>',
            expectedContent: '<div>SomeText</div>'
        },
        rightAlignDivWithTextSibling: {
            name: 'rightAlignDivWithTextSibling',
            rangeContentId: 'r',
            blockOptions: $.extend({}, options, { styleValue: "right" }),
            cleanup: 'true',
            rawContent: '<div id="r"> SomeText </div>Line 6',
            expectedContent: '<div><div id="r" style="text-align: right"> SomeText </div>Line 6</div>'
        }
    };

    test(complexBlockSurroundUnitTestData.leftAlignLineWithBr.name, function()
    {
        unitTestHelper.executeTest(complexBlockSurroundUnitTestData.leftAlignLineWithBr, function(data)
        {
            var nodes = $("#editableDiv").contents();
            var range = rangy.createRangyRange();
            range.selectNodeContents(nodes[0]);
            rangy.toggleSurroundRange(range, data.blockOptions);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        });
    });

    test(complexBlockSurroundUnitTestData.rightAlignLeftAlign.name, function()
    {
        unitTestHelper.executeTest(complexBlockSurroundUnitTestData.rightAlignLeftAlign, function(data)
        {
            var range = unitTestHelper.createRange(data);
            rangy.toggleSurroundRange(range, data.blockOptions);
            data.blockOptions = $.extend({}, data.blockOptions, { styleValue: "left" });
            range = unitTestHelper.createRange(data);
            rangy.toggleSurroundRange(range, data.blockOptions);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        });
    });

    test(complexBlockSurroundUnitTestData.rightAlignCenterAlign.name, function()
    {
        unitTestHelper.executeTest(complexBlockSurroundUnitTestData.rightAlignCenterAlign, function(data)
        {
            var range = unitTestHelper.createRange(data);
            rangy.toggleSurroundRange(range, data.blockOptions);
            data.blockOptions = $.extend({}, data.blockOptions, { styleValue: "center" });
            range = unitTestHelper.createRange(data);
            rangy.toggleSurroundRange(range, data.blockOptions);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        });
    });

    test(complexBlockSurroundUnitTestData.rightAlignRightAlign.name, function()
    {
        unitTestHelper.executeTest(complexBlockSurroundUnitTestData.rightAlignRightAlign, function(data)
        {
            var range = unitTestHelper.createRange(data);
            rangy.toggleSurroundRange(range, data.blockOptions);
            range = unitTestHelper.createRange(data);
            rangy.toggleSurroundRange(range, data.blockOptions);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        });
    });

    test(complexBlockSurroundUnitTestData.rightAlignDivWithTextSibling.name, function()
    {
        unitTestHelper.executeTest(complexBlockSurroundUnitTestData.rightAlignDivWithTextSibling, function(data)
        {
            var range = unitTestHelper.createRange(data);
            rangy.toggleSurroundRange(range, data.blockOptions);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        });
    });
}

var blockSetSurroundHtml = function()
{
    return ['<ol>',
            '<li id="l1">Line 1</li>',
            '<li id="l2">Line 2</li>',
            '</ol>',
            '<div id="l3">Line 3</div>',
            '<ol>',
            '<li id="l4">Line 4</li>',
            '<li id="l5">Line 5</li>',
            '</ol>',
            '<div id="l6">Line 6</div>',
            '<div id="l7">Line 7</div>'];
};

var blockSetUnsurroundHtml = function()
{
    return ['<ol>',
            '<li id="l1">Line 1</li>',
            '<li id="l2">Line 2</li>',
            '<li id="l3">Line 3</li>',
            '<li id="l4">Line 4</li>',
            '<li id="l5">Line 5</li>',
            '</ol>'];
};

var defaultBlockSetOption = { applierTagName: "OL" };
var blockSetSurroundUnitTestsData = [
// Wrap scenarios
        {
        name: 'wrapSimple',
        rawContent: blockSetSurroundHtml().join(' '),
        startBeforeId: 'l7',
        endAfterId: 'l7',
        blockOptions: defaultBlockSetOption,
        cleanup: 'true',
        expectedContent: "<div>" + blockSetSurroundHtml().splice(0, 10).join(' ') + '<ol><li>Line 7</li></ol>' + "</div>"
    },
        {
            name: 'wrapWithTwoSiblingLists',
            rawContent: blockSetSurroundHtml().join(' '),
            startBeforeId: 'l3',
            endAfterId: 'l3',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            expectedContent: "<div>" + blockSetSurroundHtml().splice(0, 3).join(' ') + '<li>Line 3</li>' + blockSetSurroundHtml().splice(6, 5).join(' ') + "</div>"
        },
        {
            name: 'wrapWithPartialSiblingLists',
            rawContent: blockSetSurroundHtml().join(' '),
            startBeforeId: 'l1',
            endAfterId: 'l5',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            expectedContent: "<div>" + blockSetSurroundHtml().splice(0, 3).join(' ') + '<li>Line 3</li>' + blockSetSurroundHtml().splice(6, 5).join(' ') + "</div>"
        },
        {
            name: 'wrapWithPartialSiblingLists2',
            rawContent: blockSetSurroundHtml().join(' '),
            startBeforeId: 'l2',
            endAfterId: 'l4',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            expectedContent: "<div>" + blockSetSurroundHtml().splice(0, 3).join(' ') + '<li>Line 3</li>' + blockSetSurroundHtml().splice(6, 5).join(' ') + "</div>"
        },
        {
            name: 'wrapWithPartialSiblingListFront',
            rawContent: blockSetSurroundHtml().join(' '),
            startBeforeId: 'l2',
            endAfterId: 'l3',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            expectedContent: "<div>" + blockSetSurroundHtml().splice(0, 3).join(' ') + '<li>Line 3</li>' + blockSetSurroundHtml().splice(6, 5).join(' ') + "</div>"
        },
        {
            name: 'wrapWithPartialSiblingListBack',
            rawContent: blockSetSurroundHtml().join(' '),
            startBeforeId: 'l3',
            endAfterId: 'l4',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            expectedContent: "<div>" + blockSetSurroundHtml().splice(0, 3).join(' ') + '<li>Line 3</li>' + blockSetSurroundHtml().splice(6, 5).join(' ') + "</div>"
        },
        {
            name: 'wrapWithFullSiblingListFront',
            rawContent: blockSetSurroundHtml().join(' '),
            startBeforeId: 'l1',
            endAfterId: 'l3',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            expectedContent: "<div>" + blockSetSurroundHtml().splice(0, 3).join(' ') + '<li>Line 3</li>' + blockSetSurroundHtml().splice(6, 5).join(' ')
        },
        {
            name: 'wrapWithFullSiblingListBack',
            rawContent: blockSetSurroundHtml().join(' '),
            startBeforeId: 'l3',
            endAfterId: 'l5',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            expectedContent: "<div>" + blockSetSurroundHtml().splice(0, 3).join(' ') + '<li>Line 3</li>' + blockSetSurroundHtml().splice(6, 5).join(' ') + "</div>"
        },
        {
            name: 'wrapWithFullyEnclosedList',
            rawContent: blockSetSurroundHtml().join(' '),
            startBeforeId: 'l1',
            endAfterId: 'l7',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            expectedContent: "<div>" + blockSetSurroundHtml().splice(0, 3).join(' ') + '<li>Line 3</li>' + blockSetSurroundHtml().splice(6, 2).join(' ') +
            '<li>Line 6</li>' + '<li>Line 7</li>' + '</ol>' + "</div>"
        },
// Uhwrap scenarios
        {
        name: 'unwrapWhole',
        rawContent: blockSetUnsurroundHtml().join(' '),
        startBeforeId: 'l1',
        endAfterId: 'l5',
        blockOptions: defaultBlockSetOption,
        cleanup: 'true',
        expectedContent: "<div>" + 'Line 1 <br> Line 2 <br> Line 3 <br> Line 4 <br> Line 5' + "</div>"
    },
        {
            name: 'unwrapPartialFront',
            rawContent: blockSetUnsurroundHtml().join(' '),
            startBeforeId: 'l1',
            endAfterId: 'l2',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            expectedContent: "<div>" + 'Line 1 <br> Line 2 <ol>' + blockSetUnsurroundHtml().splice(3, 4).join(' ') + "</div>"
        },
        {
            name: 'unwrapPartialBack',
            rawContent: blockSetUnsurroundHtml().join(' '),
            startBeforeId: 'l4',
            endAfterId: 'l5',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            expectedContent: "<div>" + blockSetUnsurroundHtml().splice(0, 4).join(' ') + '</ol> Line 4 <br> Line 5' + "</div>"
        },
        {
            name: 'unwrapPartialMiddle',
            rawContent: blockSetUnsurroundHtml().join(' '),
            startBeforeId: 'l3',
            endAfterId: 'l3',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            expectedContent: "<div>" + blockSetUnsurroundHtml().splice(0, 3).join(' ') + '</ol> Line 3 <ol>' + blockSetUnsurroundHtml().splice(4, 3).join(' ') + "</div>"
        }
    ];


function complexBlockSetSurroundUnitTests()
{
    var complexBlockSetSurroundUnitTestsData = {
        wrapWithBrBetweenTwoTextNodes: {
            name: 'wrapWithBrBetweenTwoTextNodes',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            rawContent: 'Line 1 <br> Line 2 <br> <ol><li>Line 3</li></ol>',
            expectedContent: "<div>" + '<ol><li>Line 1</li></ol> Line 2 <br> <ol><li>Line 3</li></ol>' + "</div>"
        },
        wrapWithBrBeforeOl: {
            name: 'wrapWithBrBeforeOl',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            rawContent: 'Line 1 <br> Line 2 <br><ol><li>Line 3</li></ol>',
            expectedContent: "<div>" + 'Line 1 <br><ol><li> Line 2 </li> <li>Line 3</li></ol>' + "</div>"
        },
        wrapWithSpanBetweenOlAndSelection: {
            name: 'wrapWithSpanBetweenOlAndSelection',
            rangeContentId: 'r',
            blockOptions: defaultBlockSetOption,
            cleanup: 'true',
            rawContent: '<ol><li>SomeContent</li></ol> <span>a </span>  <span id="r">selection</span>',
            expectedContent: "<div>" + '<ol><li>SomeContent</li><li> <span>a </span>  <span id="r">selection</span></li></ol>' + "</div>"
        }
    };

    test(complexBlockSetSurroundUnitTestsData.wrapWithBrBetweenTwoTextNodes.name, function()
    {
        unitTestHelper.executeTest(complexBlockSetSurroundUnitTestsData.wrapWithBrBetweenTwoTextNodes, function(data)
        {
            // create a range from first text node
            var nodes = $("#editableDiv").contents();
            var range = rangy.createRangyRange();
            range.selectNodeContents(nodes[0]);
            rangy.toggleSurroundRangeSet(range, data.blockOptions);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        });
    });
    test(complexBlockSetSurroundUnitTestsData.wrapWithBrBeforeOl.name, function()
    {
        unitTestHelper.executeTest(complexBlockSetSurroundUnitTestsData.wrapWithBrBeforeOl, function(data)
        {
            // create a range from second text node
            var nodes = $("#editableDiv").contents();
            var range = rangy.createRangyRange();
            range.selectNodeContents(nodes[2]);
            rangy.toggleSurroundRangeSet(range, data.blockOptions);
            $.Arte.dom.cleanup($('[contenteditable="true"]'));
        });
    });

    //    test(complexBlockSetSurroundUnitTestsData.wrapWithSpanBetweenOlAndSelection.name, function () {
    //        executeTest(complexBlockSetSurroundUnitTestsData.wrapWithSpanBetweenOlAndSelection, function (data) {
    //            // create a range from second text node
    //            var range = createRange(data);
    //            rangy.toggleSurroundRangeSet(range, { tagName: "ol" });
    //        });
    //    });
}
