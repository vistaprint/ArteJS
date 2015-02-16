(function($) {
    $.Arte = $.Arte || {};
    $.Arte.ElementApplierOptions = function(initOptions) {
        if (initOptions._isProcessed) {
            // Options object is already processed
            return initOptions;
        }

        var constants = $.Arte.constants;
        this.tagName = "";
        this.topEditableParent = "";
        this.commandName = "";
        this.commandAttrType = initOptions.commandAttrType;
        this.textArea = null;
        switch (this.commandAttrType) {
            case constants.commandAttrType.className:
                this.classNameRegex = "";
                this.className = "";
                break;
            case constants.commandAttrType.styleName:
                this.styleName = "";
                this.styleValue = "";
                break;
        }

        for (var prop in initOptions) {
            this[prop] = initOptions[prop];
        }

        if (this.tagName) {
            this.tagName = $("<" + this.tagName + ">").prop("tagName");
        }

        this.attr = {};
        if (this.commandAttrType == constants.commandAttrType.className) {
            this.attr["class"] = this.className;
        }

        if (this.commandAttrType == constants.commandAttrType.styleName) {
            // Construct a style string, so that we can easily apply/remove this from an element
            var div = $("<div>").css(this.styleName, this.styleValue);
            this.attr.style = div[0].style.cssText;
        }

        if (!this.commandName) {
            var commandConfig = $.Arte.util.getCommandConfig(this);
            if (commandConfig) {
                this.commandName = commandConfig.commandName;
                this.commandAttrType = commandConfig.commandAttrType;
            }
        }

        // Adding a field so that we don't do this multiple times.
        this._isProcessed = true;
    };
})(jQuery);
