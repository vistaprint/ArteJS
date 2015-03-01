/* exported BlogPost */
var BlogPost = function(title, defaultText) {

    var $el; // jQuery object for this blog post

    var createBlogPostContentHtml = function(title) {
        var $blogPost = $("<div class=\"blog-post\"></div>");

        var $blogPostTitle = $("<h2 class=\"blog-post-title\">" +
            title + "</h2>");
        $blogPost.append($blogPostTitle);

        var $editButton = $("<button class=\"edit-button\">Edit</button>");
        $blogPost.append($editButton);

        var $blogPostContent = $("<div class=\"blog-post-content\"></div>");
        $blogPost.append($blogPostContent);

        return $blogPost;
    };

    var createBlogPostEditor = function() {
        var $blogPostEditor = $("<div class=\"blog-post-editor\">");

        var $saveButton = $("<button class=\"save-button\">Save</button>");
        $blogPostEditor.append($saveButton);

        var $toolbar = $("<div class=\"toolbar\"></div>");
        $blogPostEditor.append($toolbar);

        var $editor = $("<div class=\"editor\"></div>");
        $blogPostEditor.append($editor);

        return $blogPostEditor;
    };

    var createHtml = function(title) {
        var $blogPost = createBlogPostContentHtml(title);

        var $blogPostEditor = createBlogPostEditor();
        $blogPost.append($blogPostEditor);

        $blogPost.append("<hr>");

        return $blogPost;
    };

    var createTextEditor = function() {
        // Initialize and get a reference to the editor
        $el.find(".editor").Arte({
            editorType: $.Arte.constants.editorTypes.richText,
            styles: { // default styles can be passed in as well
                height: "100px",
                width: "400px",
                overflow: "auto",
                border: "1px dashed gray"
            }
        });

        // Initialize the toolbar

        // TODO figure out why this is needed for the demo to work
        $.Arte.Toolbar.configuration.requireEditorFocus = false;

        var buttons = ["bold", "italic", "underline"];

        $el.find(".toolbar").ArteToolbar({
            buttons: buttons
        });

        // Hide the editor initially
        $el.find(".blog-post-editor").hide();
    };

    var attachEditHandler = function() {
        $el.find(".edit-button").click(function() {
            var arte = $el.find(".editor").Arte();

            $el.find(".blog-post-content").hide();
            $el.find(".edit-button").hide();
            $el.find(".blog-post-editor").show();
            $el.find(".save-button").show();

            // Set focus to the editor so the toolbar becomes enabled
            arte.focus();

            var blogPostContent = $el.find(".blog-post-content").html();
            arte.get(0).value(blogPostContent);
        });
    };

    var attachSaveHandler = function() {
        $el.find(".save-button").click(function() {
            var arte = $el.find(".editor").Arte();

            var editorContent = arte.get(0).value();
            $el.find(".blog-post-content").html(editorContent);

            $el.find(".blog-post-editor").hide();
            $el.find(".save-button").hide();
            $el.find(".blog-post-content").show();
            $el.find(".edit-button").show();
        });
    };

    var attachEventHandlers = function() {
        attachEditHandler();
        attachSaveHandler();
    };

    var setDefaultText = function() {
        if (defaultText !== undefined) {
            $el.find(".blog-post-content").html(defaultText);
        }
    };

    var initialize = function() {
        createTextEditor();

        attachEventHandlers();

        setDefaultText();
    };

    this.addToParentContainer = function($parent) {
        $el = createHtml(title);

        $parent.prepend($el);

        initialize();

        return $el;
    };

};
