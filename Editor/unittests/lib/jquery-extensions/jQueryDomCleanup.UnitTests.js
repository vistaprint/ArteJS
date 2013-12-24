$(document).ready(function()
{
    var suiteName = "jQuery-dom-cleanup";
    module(suiteName + ".style");
    unitTestHelper.executeTestCollection(stylesCleanupTestData, function(testData)
    {
        $.Arte.dom.cleanup($("#editableDiv"));
    });

    module(suiteName + ".class");
    unitTestHelper.executeTestCollection(classCleanupTestData, function(testData)
    {
        $.Arte.dom.cleanup($("#editableDiv"));
    });

    module(suiteName + ".tag");
    unitTestHelper.executeTestCollection(tagBasedStylesCleanupTestData, function(testData)
    {
        $.Arte.dom.cleanup($("#editableDiv"));
    });

    module(suiteName + ".convertDivToP");
    unitTestHelper.executeTestCollection(convertDivToPTestData, function(testData)
    {
        $.Arte.dom.convertDivsToP($("#editableDiv").children());
    });

    module(suiteName + ".removeEmptyElements");
    unitTestHelper.executeTestCollection(removeEmptyElementsTestData, function(testData)
    {
        $.Arte.dom.removeEmptyElements($("#editableDiv"));
    });
});


var stylesCleanupTestData = [
        {
            name: "mergeTwoSiblings",
            rawContent: "<span> abc </span><span> def </span>",
            expectedContent: "abc  def"
        },
        {
            name: "mergeThreeSiblings",
            rawContent: "<span> abc </span><span> def </span><span>ghi</span>",
            expectedContent: "abc  def ghi"
        },
        {
            name: "mergeSpanSiblingsWithStyles",
            rawContent: "<div id='s'><span style='color:red'> abc </span><span style='color:red'> def </span></div>",
            expectedContent: "<div id='s' style='color:red'> abc  def </div>"
        },
        {
            name: "mergeSpanSiblingsWithDifferentStylesNegative",
            rawContent: "<span style='color:red'> abc </span><span style='color:blue'> def </span>",
            expectedContent: "<span style='color:red'> abc </span><span style='color:blue'> def </span>"
        },
        {
            name: "mergeSpanSiblingsWithMixedStylesNegative",
            rawContent: "<span style='color:red'> abc </span><span style='color:blue'> def </span><span style='color:red'> abc </span>",
            expectedContent: "<span style='color:red'> abc </span><span style='color:blue'> def </span><span style='color:red'> abc </span>"
        },
        {
            name: "mergeSpanSiblingsWithMixedStyles",
            rawContent: "<span style='color:red'> abc </span><span style='color:red'> abc </span><span style='color:blue'> def </span>",
            expectedContent: "<span style='color:red'> abc  abc </span><span style='color:blue'> def </span>"
        },
        {
            name: "mergeSpanSiblingsWithEmptyTextNodeInTheMiddle",
            rawContent: "<div id='s'><span style='color:red'> abc </span>  <span style='color:red'> def </div>",
            expectedContent: "<div id='s' style='color:red'> abc    def </div>"
        },
        {
            name: "mergeSpanSiblingsWithNonEmptyTextNodeInTheMiddle",
            rawContent: "<span style='color:red'> abc </span> a text node   <span style='color:red'> abc </span>",
            expectedContent: "<span style='color:red'> abc </span> a text node   <span style='color:red'> abc </span>"
        },
        {
            name: "mergeDivsNegative",
            rawContent: "<div> abc </div><div> def </div>",
            expectedContent: "<div><div> abc </div><div>  def </div></div>"
        },
// Merge with parents
        {
        name: "mergeSpanChildrenAndParentDiv",
        rawContent: "<div><span>abc</span><span>def</span></div>",
        expectedContent: "abcdef"
    },
        {
            name: "mergeMultipleChildrenAndParent",
            rawContent: "<div><span>abc</span><span>def</span></div><div><span>abc</span><span>def</span></div>",
            expectedContent: "<div><div>abcdef</div><div>abcdef</div></div>"
        },
        {
            name: "mergeSpanWithParentSpan",
            rawContent: "<span ><span>abc</span></span>",
            expectedContent: "abc"
        },
        {
            name: "mergeSubsetOfSpansWithParentSpan",
            rawContent: "<span ><span style='color: red;'>abc</span><span>def</span></span>",
            expectedContent: "<span style='color: red;'>abc</span>def"
        }, {
            name: "mergeSpanWithStylesWithParentDivWithStyle",
            rawContent: "<div id='s' style='color: red;'><span style='color: red;'>abc</span></div>",
            expectedContent: "<div id='s' style='color: red;'>abc</div>"
        },
        {
            name: "mergeSpansWithStylesWithParentDivWithMultipleStyles",
            rawContent: "<div id='s' style='color: red; font-weight: bold;'><span style='color: red;'>abc</span></div>",
            expectedContent: "<div id='s' style='color: red; font-weight: bold;'>abc</div>"
        },
        {
            name: "mergeSpansWithMultipleStylesWithParentDivWithStyleNegative",
            rawContent: "<div id='s' style='color: red; '><span style='color: red; font-weight: bold;'>abc</span></div>",
            expectedContent: "<div id='s' style='color: red; font-weight: bold;'>abc</div>"
        },
        {
            name: "mergeSpansWithMultipleStylesWithParentDivWithMultipleStyles",
            rawContent: "<div id='s' style='color: red; font-weight: bold;'><span style='color: red; font-weight: bold;'>abc</span></div>",
            expectedContent: "<div id='s' style='color: red; font-weight: bold;'>abc</div>"
        },
        {
            name: "mergeMultipleSpansWithStylesWithParentDivWithMultipleStyles",
            rawContent: "<div id='s' style='color: red; font-weight: bold;'><span style='color: red; '>abc</span><span style='font-weight: bold;'>def</span></div>",
            expectedContent: "<div id='s' style='color: red; font-weight: bold;'>abcdef</div>"
        },
        {
            name: "mergeSpansWithStylesWithParentDivWithDifferentStyle",
            rawContent: "<div id='s' style='color: red;'><span style='color: blue;'>abc</span></div>",
            expectedContent: "<div id='s' style='color: blue;'>abc</div>"
        },
        {
            name: "mergeSpansAndTextWithParentDiv",
            rawContent: "<div>123<span>abc</span>def</div>",
            expectedContent: "123abcdef"
        },
// Merge with grand parents
        {
        name: "mergeSpanWithGrandParentDiv",
        rawContent: "<div id='s' style='color: red;'><div><span style='color:red;'>abc</span></div></div>",
        expectedContent: "<div id='s' style='color: red;'>abc</div>"
    },
        {
            name: "mergeSpanWithGrandParentDivWithDifferentStyle",
            rawContent: "<div id='s' style='color: red;'><div><span style='color:blue;'>abc</span></div></div>",
            expectedContent: "<div id='s' style='color: blue;'>abc</div>"
        },
        {
            name: "mergeSpanWithGrandParentDivWithMultipleStyles",
            rawContent: "<div id='s' style='color: red; font-weight:bold;'><div><span style='color:red;'>abc</span></div></div>",
            expectedContent: "<div id='s' style='color: red; font-weight:bold;'>abc</div>"
        },
        {
            name: "mergeSpanWithGrandParentDivWithMultipleChildren",
            rawContent: "<div id='s' style='color: red; font-weight:bold;'><div><span style='color:red;'>abc</span></div><div>def</div></div>",
            expectedContent: "<div id='s' style='color: red; font-weight:bold;'><div>abc</div><div>def</div></div>"
        },
        {
            name: "mergeSpanWithGrandParentDivWithMultipleMixedChildren",
            rawContent: "<div id='s' style='color: red; font-weight:bold;'><div><span style='color:red;'>abc</span></div><span>def</span></div>",
            expectedContent: "<div id='s' style='color: red; font-weight:bold;'><div>abc</div>def</div>"
        },
// Other tests
        {
        name: "mergeSpanWithBlockSiblingsToParent",
        rawContent: "<div>ABC</div><span>abc</span><div>DEF</div>",
        expectedContent: "<div><div>ABC</div>abc<div>DEF</div></div>"
    },
        {
            name: "mergeSpanWithPSiblingsToParent",
            rawContent: "<p>ABC</p><span>should unwrap</span><p>DEF</p>",
            expectedContent: "<p>ABC</p>should unwrap<p>DEF</p>"
        },
        {
            name: "mergeSpanWithOLSiblingsToParent",
            rawContent: "<ol><li>ABC</li></ol><span>abc</span><ol><li>ABC</li></ol>",
            expectedContent: "<ol><li>ABC</li></ol>abc<ol><li>ABC</li></ol>"
        },
// merge styles
        {
        name: "mergeSpanStyleWithParentStyle",
        rawContent: "<div id='s'><span style='color: blue'>ABC</span></div>",
        expectedContent: "<div id='s' style='color: blue;'>ABC</div>"
    },
        {
            name: "mergeSpanStyleWithParentStyle",
            rawContent: "<div id='s' style='color: red;'><span style='color: blue'>ABC</span></div>",
            expectedContent: "<div id='s' style='color: blue;'>ABC</div>"
        },
        {
            name: "mergeMixedSpanStyleWithParentStyle",
            rawContent: "<div id='s' style='color: red; font-style:normal;'><span style='color: blue; font-weight: bold'>ABC</span></div>",
            expectedContent: "<div id='s' style='color: blue; font-style: normal; font-weight: bold;'>ABC</div>"
        },
        {
            name: "mergeSiblingSpansStyleWithParentStyleNegative",
            rawContent: "<div id='s' style='color: red;'><span style='color: blue;'>ABC</span><span>DEF</span></div>",
            expectedContent: "<div id='s' style='color: red;'><span style='color: blue;'>ABC</span>DEF</div>"
        },
        {
            name: "mergeSiblingSpansStyleWithParentStyle",
            rawContent: "<div id='s' style='color: red;'><span style='color: blue;'>ABC</span><span style='color:blue'>DEF</span></div>",
            expectedContent: "<div id='s' style='color: blue;'>ABCDEF</div>"
        },
        {
            name: "mergeSiblingSpansStyleWithParentStyleRemoveRedundantStyle",
            rawContent: "<div id='s' style='color: red;'><span style='color: blue;'>ABC</span><span style='color:red'>DEF</span></div>",
            expectedContent: "<div id='s' style='color: red;'><span style='color: blue'>ABC</span>DEF</div>"
        },
        {
            name: "mergeDivWithLiParentNegative",
            rawContent: "<div><ol><li><div style='color:red;'>abc</div></li></ol></div>",
            expectedContent: "<div  style='color:red;'><ol><li>abc</li></ol></div>"
        },
        {
            name: "mergePWithLiParentNegative",
            rawContent: "<div><ol><li><p style='color:red;'>abc</p></li></ol></div>",
            expectedContent: "<div style='color:red;'><ol><li>abc</li></ol></div>"
        },
        {
            name: "mergeSpanInsideDivWithLiParent",
            rawContent: "<div><ol><li><div><span style='color:red;'>abc</span></div></li></ol></div>",
            expectedContent: "<div style='color:red;'><ol><li>abc</li></ol></div>"
        },
        {
            name: "mergeSpanWithDifferentStylesInsideDivWithMultipleLiParent",
            rawContent: "<div><ol><li><div><span style='color:red;'>abc</span></div></li><li><div><span style='color:black;'>abc</span></div></li></ol></div>",
            expectedContent: "<div><ol><li style='color:red;'>abc</li><li style='color:black;'>abc</li></ol></div>"
        },
        {
            name: "mergeSpanWithsameStylesInsideDivWithMultipleLiParent",
            rawContent: "<div><ol><li><div><span style='color:red;'>abc</span></div></li><li><div><span style='color:red;'>abc</span></div></li></ol></div>",
            expectedContent: "<div style='color:red;'><ol><li>abc</li><li>abc</li></ol></div>"
        },
        {
            name: "mergeSpanWithsameStylesInsideDivWithMultipleLiParent",
            rawContent: "<div><ol><li><div><span style='color:red; font-weight:bold'>abc</span></div></li><li><div><span style='color:red;'>abc</span></div></li></ol></div>",
            expectedContent: "<div style='color:red;'><ol><li style='font-weight:bold'>abc</li><li>abc</li></ol></div>"
        }
    ];

var classCleanupTestData = [
        {
            name: "bubbleClass",
            rawContent: "<span class='arte-font-weight-bold'>abc</span>",
            expectedContent: "<div class='arte-font-weight-bold'>abc</div>"
        },
        {
            name: "bubbleClassMultipleSiblings",
            rawContent: "<span class='arte-font-weight-bold'>abc</span><span class='arte-font-weight-bold'>def</span>",
            expectedContent: "<div class='arte-font-weight-bold'>abcdef</div>"
        },
        {
            name: "bubbleCommonClassFromSiblings",
            rawContent: "<span class='arte-font-weight-bold'>abc</span><span class='arte-font-weight-bold arte-italic'>def</span>",
            expectedContent: "<div class='arte-font-weight-bold'>abc<span class='arte-italic'>def</span></div>"
        },
        {
            name: "removeRedundantClasses",
            rawContent: "<div class='arte-font-weight-bold'><span class='arte-font-weight-bold'>abc</span><span class='arte-font-weight-bold'>def</span></div>",
            expectedContent: "<div class='arte-font-weight-bold'>abcdef</div>"
        },
        {
            name: "bubbleSimilarLookingStyleToParent",
            rawContent: "<div class='arte-font-size-10'><span class='arte-font-size-20'>abc</span></div>",
            expectedContent: "<div class='arte-font-size-20'>abc</div>"
        },
        {
            name: "removeClassFromParentMultipleSiblings",
            rawContent: "<div class='arte-font-size-10'><span class='arte-font-size-20'>abc</span><span class='arte-font-size-30'>def</span></div>",
            expectedContent: "<div><span class='arte-font-size-20'>abc</span><span class='arte-font-size-30'>def</span></div>"
        }
    ];


var tagBasedStylesCleanupTestData = [
    {
        name: "mergeBTagNegative",
        rawContent: "<b>abc</b>",
        expectedContent: "<b>abc</b>"
    },
    {
        name: "mergeBTagSiblings",
        rawContent: "<b>abc</b><b>def</b>",
        expectedContent: "<b>abcdef</b>"
    },
    {
        name: "mergeiTagSiblings",
        rawContent: "<i>abc</i><i>def</i>",
        expectedContent: "<i>abcdef</i>"
    },
    {
        name: "mergeUTagSiblings",
        rawContent: "<u>abc</u><u>def</u>",
        expectedContent: "<u>abcdef</u>"
    },
    {
        name: "mergeIandUTagSiblingsNegative",
        rawContent: "<i>abc</i><u>def</u>",
        expectedContent: "<i>abc</i><u>def</u>"
    },
    {
        name: "mergeSpanandUTagSiblingsNegative",
        rawContent: "<span>abc</span><u>def</u>",
        expectedContent: "abc<u>def</u>" /*Note that the span gets merged with the parent div*/
    },
    {
        name: "mergeSpanandBTagSiblingsNegative",
        rawContent: "<span>abc</span><b>def</b>",
        expectedContent: "abc<b>def</b>"
    },
    {
        name: "mergeSpanandStrongTagSiblingsNegative",
        rawContent: "<span>abc</span><strong>def</strong>",
        expectedContent: "abc<strong>def</strong>"
    },
    {
        name: "mergeSpanandSubTagSiblingsNegative",
        rawContent: "<span>abc</span><sub>def</sub>",
        expectedContent: "abc<sub>def</sub>"
    },
    {
        name: "mergeSpanandSupTagSiblingsNegative",
        rawContent: "<span>abc</span><sup>def</sup>",
        expectedContent: "abc<sup>def</sup>"
    },
    {
        name: "mergeBTagDescendants",
        rawContent: "<b><b>abc</b></b>",
        expectedContent: "<b>abc</b>"
    },
    {
        name: "mergeMultipleBTagDescendants",
        rawContent: "<b><b>abc</b><b>def</b></b>",
        expectedContent: "<b>abcdef</b>"
    },
    {
        name: "mergeTextAndBTagDescendants",
        rawContent: "<b>abc<b>def</b></b>",
        expectedContent: "<b>abcdef</b>"
    },
    {
        name: "mergeBTagAndTextDescendants",
        rawContent: "<b><b>abc</b>def</b>",
        expectedContent: "<b>abcdef</b>"
    },
    {
        name: "mergeITagDescendants",
        rawContent: "<i><i>abc</i>def</i>",
        expectedContent: "<i>abcdef</i>"
    },
    {
        name: "mergeUTagDescendants",
        rawContent: "<u><u>abc</u>def</u>",
        expectedContent: "<u>abcdef</u>"
    },
    {
        name: "mergeStrongTagDescendants",
        rawContent: "<strong><strong>abc</strong>def</strong>",
        expectedContent: "<strong>abcdef</strong>"
    },
    {
        name: "mergeSupTagDescendants",
        rawContent: "<sup><sup>abc</sup>def</sup>",
        expectedContent: "<sup>abcdef</sup>"
    },
    {
        name: "mergeSupTagDescendants",
        rawContent: "<sub><sub>abc</sub>def</sub>",
        expectedContent: "<sub>abcdef</sub>"
    }
];

var convertDivToPTestData = [
 {
     name: "convertDivToPNegative",
     rawContent: "some text <span> some text in span </span <p>already in p</p> some other text at end",
     expectedContent: "some text <span> some text in span </span <p>already in p</p> some other text at end"
 },
        {
            name: "convertDivToP",
            rawContent: "<div>ABC</div>",
            expectedContent: "<p>ABC</p>"
        },
        {
            name: "convertSiblingAndParentDivsToP",
            rawContent: "<div>ABC <div> DEF </div> <div> GHI </div> JKL </div> <div> MNO </div>",
            expectedContent: "<p>ABC <p> DEF </p> <p> GHI </p> JKL </p> <p> MNO </p>"
        },
        {
            name: "convertDivToPWithAttributes",
            rawContent: "<div id='a' style='font-weight:bold'>ABC</div>",
            expectedContent: "<p id='a' style='font-weight:bold'>ABC</p>"
        },
        {
            name: "convertSiblingAndParentDivsToPWithAttributes",
            rawContent: "<div class='x' style='font-weight:bold'>ABC <div class='x' style='font-weight:bold'> DEF </div> <div class='x' style='font-weight:bold'> GHI </div> JKL </div> <div class='x' style='font-weight:bold'> MNO </div>",
            expectedContent: "<p class='x' style='font-weight:bold'>ABC <p class='x' style='font-weight:bold'> DEF </p> <p class='x' style='font-weight:bold'> GHI </p> JKL </p> <p class='x' style='font-weight:bold'> MNO </p>"
        }
    ];

// TODO: Implement these tests.
var removeEmptyElementsTestData = [];