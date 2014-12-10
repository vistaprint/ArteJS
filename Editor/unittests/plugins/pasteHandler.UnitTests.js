$(document).ready(function ()
{
    var suiteName = "Arte.Plugins.PasteHandler";
    module(suiteName);

    unitTestHelper.executeTestCollectionSimple(ArtePasteHandlerTestData, function (testData)
    {
        $.Arte.configuration.handleUnsanctionedTagsOnGetValue = false;
        $(TEST_ELEMENT_SELECTOR).Arte({
            value: "test ..."
        });
        var arte = $(TEST_ELEMENT_SELECTOR).Arte().get(0);

        arte.value(testData.rawContent);
        arte.$el.trigger("onpaste", { "textArea": arte });

        var value = arte.value();

        return unitTestHelper.isEqual({
            name: suiteName + ".setValue" + testData.name,
            expectedContent: $("<div>").html(testData.expectedContent),
            actualContent: $("<div>").html(value),
            doNotApplyAttributes: true
        });

    });
});

var ArtePasteHandlerTestData = [
    {
        name: "cleanupTextNegative",
        rawContent: "<div id='s'>ABC</div>",
        expectedContent: "<div id='s'>ABC</div>"
    },
    {
        name: "removeInvalidAttributes",
        rawContent: "<div id='s'><span dataField='x'>ABC</span></div>",
        expectedContent: "<div id='s'><span>ABC</span></div>"
    },
    {
        name: "removeInvalidAttributesClass",
        rawContent: "<div id='s'><p class='y'>ABC</p></div>",
        expectedContent: "<div id='s'><p>ABC</p></div>"
    },
     {
         name: "removeLineBreaks",
         rawContent: "<div id='s'>\r\n\r\n\r\na</div>",
         expectedContent: "<div id='s'>a</div>"
     },
     {
         name: "convertBTagToSpanWithBold",
         rawContent: "<div id='s'><b>bold</b></div>",
         expectedContent: "<div id='s'><span style='font-weight:bold'>bold</span></div>"
     },
     {
         name: "convertBTagToSpanWithBoldWithSibling",
         rawContent: "<div id='s'>ABC<b>bold</b></div>",
         expectedContent: "<div id='s'>ABC<span style='font-weight:bold'>bold</span></div>"
     },
     {
         name: "convertITagToSpanWithItalic",
         rawContent: "<div id='s'><i>italic</i></div>",
         expectedContent: "<div id='s'><span style='font-style:italic'>italic</span></div>"
     },
     {
         name: "convertITagToSpanWithItalicWithSibling",
         rawContent: "<div id='s'>ABC<i>bold</i></div>",
         expectedContent: "<div id='s'>ABC<span style='font-style:italic'>bold</span></div>"
     },
    {
        name: "convertFONTTagToSpan",
        rawContent: "<div id='s'><font>bold</font></div>",
        expectedContent: "<div id='s'><span>bold</span></div>"
    },
    // maintain valid styles
     {
         name: "maintainValidStylesFontWeight",
         rawContent: "<div id='s' style='font-weight: bold'>bold</div>",
         expectedContent: "<div id='s' style='font-weight:bold'>bold</div>"
     },
     {
         name: "maintainValidStylesFontStyle",
         rawContent: "<div id='s' style='font-style: italic'>bold</div>",
         expectedContent: "<div id='s' style='font-style: italic'>bold</div>"
     },
     {
         name: "maintainValidStylesFontSize",
         rawContent: "<div id='s' style='font-size: 10px'>bold</div>",
         expectedContent: "<div id='s' style='font-size:10px'>bold</div>"
     },
     {
         name: "maintainValidStylesAlignLeft",
         rawContent: "<div id='s' style='text-align: left'>bold</div>",
         expectedContent: "<div id='s' style='text-align: left'>bold</div>"
     },
      // Remove invalid styles
     {
         name: "removeInvalidStylesFontFamily",
         rawContent: "<div id='s' style='font-family: Arial'>bold</div>",
         expectedContent: "<div id='s' style='font-family: Arial;'>bold</div>"
     },
     {
         name: "removeInvalidStylesBadColor",
         rawContent: "<div id='s' style='color: Red'>bold</div>",
         expectedContent: "<div id='s'>bold</div>"
     },
     {
         name: "removeInvalidStylesBadColorRGB",
         rawContent: "<div id='s' style='color: rgb(1,2)'>bold</div>",
         expectedContent: "<div id='s'>bold</div>"
     },
     {
         name: "removeInvalidStylesBadColorHex",
         rawContent: "<div id='s' style='color: #FFFF'>bold</div>",
         expectedContent: "<div id='s'>bold</div>"
     },
     {
         name: "removeInvalidStylesBadFontSize",
         rawContent: "<div id='s' style='font-size: 20pt'>bold</div>",
         expectedContent: "<div id='s'>bold</div>"
     },
     {
         name: "maintainValidAndRemoveInvalidStyles",
         rawContent: "<div id='s' style='font-weight:bold; font-size: 20pt'>bold</div>",
         expectedContent: "<div id='s' style='font-weight:bold'>bold</div>"
     },
     {
         name: "removeComment",
         rawContent: "<div id='s'><!--ABCDEF--><div>\r\nABC\r\n</div></div>",
         expectedContent: "<div id='s'><div>ABC</div></div>"
     },
     {
         name: "removeEmptyTextNodes",
         rawContent: "<div id='s'><div>\r\nABC\r\n</div></div>",
         expectedContent: "<div id='s'><div>ABC</div></div>"
     },
     {
         name: "actualContentFromMsWord1",
         rawContent: "<div id='s'><p class=\"MsoNormal\"><a name=\"OLE_LINK2\"></a><a name=\"OLE_LINK1\">test<o:p></o:p></a></p><p class=\"MsoNormal\">abc<o:p></o:p></p></div>",
         expectedContent: "<div id='s'><p><div>test</div></p><p>abc</p></div>"
     },
     {
         name: "actualContentFromMsWord2",
         rawContent: '<div id="s">af<img alt="Try Advanced Editing" style="width:111px;height:33px;"></div>',
         expectedContent: "<div id='s'>af</div>"
     },
     {
         name: "actualContentFromMsWord3",
         rawContent: '<p style="TEXT-ALIGN: right"><p class="MsoListParagraphCxSpFirst" style="text-indent:-.25in;mso-list:l0 level1 lfo1"><!--[if !supportLists]-->1.<span style="font-weight: normal; font-size: 7pt; font-family: \'Times New Roman\'; ">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><!--[endif]-->ABC<o:p></o:p></p><p class="MsoListParagraphCxSpLast" style="text-indent:-.25in;mso-list:l0 level1 lfo1"><!--[if !supportLists]-->2.<span style="font-weight: normal; font-size: 7pt; font-family: \'Times New Roman\'; ">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><!--[endif]-->DEF<o:p></o:p></p></p>',
         expectedContent: "<p>1.ABC</p><p>2.DEF</p>"
     }
];