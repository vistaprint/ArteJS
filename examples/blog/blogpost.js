var BlogPost = function(){

    var createBlogPostEditor = function(){
        var $blogPostEditor = $('<div class="blog-post-editor">');

        var $toolbar = $('<div class="toolbar"></div>');
        $blogPostEditor.append($toolbar);

        var $editor = $('<div class="editor"></div>');
        $blogPostEditor.append($editor);

        var $saveButton = $('<button class="save-button">Save</button>');
        $blogPostEditor.append($saveButton);

        return $blogPostEditor;
    };

    this.createHtml = function(title){
        var $blogPost = $('<div class="blog-post"></div>');

        var $blogPostTitle = $('<h2 class="blog-post-title">' +
            title + '</h2>');
        $blogPost.append($blogPostTitle);

        var $blogPostContent = $('<div class="blog-post-content"></div>');
        $blogPost.append($blogPostContent);

        var $editButton = $('<button class="edit-button">Edit</button>');
        $blogPost.append($editButton);

        var $blogPostEditor = createBlogPostEditor();
        $blogPost.append($blogPostEditor);

        $blogPost.append("<hr>");

        return $blogPost;
    };
};
