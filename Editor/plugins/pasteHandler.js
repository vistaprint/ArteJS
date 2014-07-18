(function(pluginManager)
{
    $.Arte.configuration.pasteHandler = {
        attributes: {
            "id": 1,
            "style": 1,
            "class": 1
        },
        style: {
            "font": 1,
            "font-style": 1,
            "font-weight": 1,
            "font-family": 1, // TODO: font-family, color, font-size needs to compare against some sanctioned list
            "color": 1,
            "font-size": 1,
            "text-align": 1
        },
        tag: {
            "P": 1,
            "DIV": 1,
            "UL": 1,
            "OL": 1,
            "LI": 1,
            "SPAN": 1
            // What to do with tags not in this list
        },
        nodeType: {
            "1": 1, // Text
            "3": 1 // Element
        },
        invalidTagHandlers: {
            "B": {
                applierTagName: "span",
                styleName: "font-weight",
                styleValue: "bold"
            },
            "I": {
                applierTagName: "span",
                styleName: "font-style",
                styleValue: "italic"
            },
            "U": {
                applierTagName: "span",
                styleName: "text-decoration",
                styleValue: "underline"
            },
            "FONT": {
                applierTagName: "span"
            }
        }
    };

    var configuration = $.Arte.configuration.pasteHandler;
    var classNameSpace = $.Arte.configuration.classNameSpace;

    var getReplacementNode = function(jNode)
    {
        var nodeType = jNode.get(0).nodeType;
        if (!configuration.nodeType[nodeType])
        { // Remove unsupported nodes
            jNode.remove();
            return null;
        }

        // Additional node type based processing
        if (nodeType == $.Arte.constants.nodeType.TEXT)
        {
            var nodeValue = jNode.get(0).nodeValue;
            // Remove the html comment text
            nodeValue = nodeValue.replace(/<!--[\S\s]*?-->/ig, "");

            // Remove empty nodes
            if (nodeValue === "" || !nodeValue.match(/\S+/ig) || nodeValue.match(/^[\xA0]+$/ig))
            {
                jNode.remove();
                return null;
            }

            // Remove multiple spaces and new line characters
            jNode.get(0).nodeValue = nodeValue.replace(/\n/ig, "").replace(/[\xA0|\s+]{2,}/ig, " ");
            return null;
        }
        var content = jNode.html();
        if (!content)
        {
            jNode.remove();
            return null;
        }

        var tagName = jNode.prop("tagName");
        if (configuration.tag[tagName])
        {
            // This is a supported tag, remove unsupported attributes
            var attr = jNode.prop("attributes");
            for (var i = 0; i < attr.length; i++)
            {
                if (!configuration.attributes[attr[i].name])
                {
                    try
                    {
                        // IE7 returns events/properties as attributes, removing those throw exception
                        jNode.removeAttr(attr[i].name);
                    }
                    catch (e)
                    {
                    }
                }
            }

            // Remove unrecognized class
            var classes = $.Arte.dom.getClasses(jNode);
            $.each(classes, function(index, className)
            {
                if (className.indexOf(classNameSpace) !== 0)
                {
                    jNode.removeClass(className);
                }
            });

            var cssText = "";
            $.each($.Arte.dom.getStyles(jNode), function(style, value)
            {
                var keepStyle = configuration.style[style];
                if (keepStyle)
                {
                    switch (style)
                    {
                        case "font-size":
                            keepStyle = value.match(/\d+\s?px/);
                            break;
                        case "color":
                            keepStyle = value.match(/#[a-fA-F0-9]{6}/) || value.match(/rgb\(\d+,\s*\d+\,\s*\d+\)/);
                            break;
                        default:
                            break;
                    }
                }

                if (keepStyle)
                {
                    cssText += style + ": " + value + "; ";
                }
            });
            jNode.get(0).style.cssText = cssText;

            return null;
        }

        // Unsupported tags, construct a replacement node
        var invalidTagHandlerConfig = configuration.invalidTagHandlers[jNode.prop("tagName")] || { tagName: "DIV" /* Just wrap the content in a div*/ };
        var newNode = $.Arte.dom.createContainer(invalidTagHandlerConfig).html(jNode.html());
        return newNode;
    };

    var handleUnsanctionedTags = function(nodes)
    {
        nodes.each(function()
        {
            var $this = $(this);
            handleUnsanctionedTags($this.contents());

            var replacementNode = getReplacementNode($this);
            if (replacementNode)
            {
                $this.replaceWith(replacementNode);
            }
        });
    };

    // Set of events raised by this plugin
    $.extend($.Arte.constants.eventNames, {
        "onbeforehandlepaste": "onbeforehandlepaste",
        "onhandlepaste": "onhandlepaste"
    });

    var pasteHandler = function()
    {
        return {
            init: function(textArea)
            {
                textArea.$element.on({
                    "onpaste": function(e, data)
                    {
                        var options = { execute: true };
                        textArea.triggerEvent($.Arte.constants.eventNames.onbeforehandlepaste, options);
                        if (!options.execute)
                        {
                            return;
                        }
                        handleUnsanctionedTags(data.textArea.$el.children());
                        textArea.triggerEvent($.Arte.constants.eventNames.onbeforehandlepaste, options);
                    }
                });
            }
        };
    };

    pluginManager.register("pasteHandler", pasteHandler);
})($.Arte.pluginManager);