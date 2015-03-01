var BlogPost = function(){

    var createBlogPostContentHtml = function(title){
        var $blogPost = $('<div class="blog-post"></div>');

        var $blogPostTitle = $('<h2 class="blog-post-title">' +
            title + '</h2>');
        $blogPost.append($blogPostTitle);

        var $editButton = $('<button class="edit-button">Edit</button>');
        $blogPost.append($editButton);

        var $blogPostContent = $('<div class="blog-post-content"></div>');
        $blogPost.append($blogPostContent);

        return $blogPost;
    }

    var createBlogPostEditor = function(){
        var $blogPostEditor = $('<div class="blog-post-editor">');

        var $saveButton = $('<button class="save-button">Save</button>');
        $blogPostEditor.append($saveButton);

        var $toolbar = $('<div class="toolbar"></div>');
        $blogPostEditor.append($toolbar);

        var $editor = $('<div class="editor"></div>');
        $blogPostEditor.append($editor);

        return $blogPostEditor;
    };

    this.createHtml = function(title){
        var $blogPost = createBlogPostContentHtml(title);

        var $blogPostEditor = createBlogPostEditor();
        $blogPost.append($blogPostEditor);

        $blogPost.append("<hr>");

        return $blogPost;
    };
};
