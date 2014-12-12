/**
 * @fileoverview manages the plugins for Arte
 */
(function($) {
    $.Arte = $.Arte || {};
    $.Arte.pluginManager = {
        plugins: {},
        /**
         * Register a plugin
         * @param {string} name of the plugin
         * @param {function} constructor function of the plugin
         */
        register: function(name, plugin) {
            this.plugins[name] = plugin;
        },
        /*
         * Initializes the plugin
         * @param {Arte} an instance of Arte
         */
        init: function(richTextEditor) {
            richTextEditor.pluginInstances = richTextEditor.pluginInstances || [];
            for (var pluginName in this.plugins) {
                var pluginInstanse = new this.plugins[pluginName]();
                pluginInstanse.init(richTextEditor);
                richTextEditor.pluginInstances.push(pluginInstanse);
            }
        }
    };
})(jQuery);
