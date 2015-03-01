(function(){

	var attachEventHandlers = function($newBlogPost){
		$newBlogPost.find(".edit-button").click(function(){
			var arte = $newBlogPost.find(".editor").Arte();

			$newBlogPost.find(".blog-post-content").hide();
			$newBlogPost.find(".edit-button").hide();
			$newBlogPost.find(".blog-post-editor").show();
			$newBlogPost.find(".save-button").show();

			// Set focus to the editor so the toolbar becomes enabled
			arte.focus();

			var blogPostContent = $newBlogPost.find(".blog-post-content").html();
			arte.get(0).value(blogPostContent);
		});

		$newBlogPost.find(".save-button").click(function(){
			var arte = $newBlogPost.find(".editor").Arte();

			var editorContent = arte.get(0).value();
			$newBlogPost.find(".blog-post-content").html(editorContent);

			$newBlogPost.find(".blog-post-editor").hide();
			$newBlogPost.find(".save-button").hide();
			$newBlogPost.find(".blog-post-content").show();
			$newBlogPost.find(".edit-button").show();
		});
	};

	var createTextEditor = function($newBlogPost){
		// Initialize and get a reference to the editor
		var arte = $newBlogPost.find(".editor").Arte({
			editorType: $.Arte.constants.editorTypes.richText,
			styles: { // default styles can be passed in as well
				height: "200px",
				width: "300px",
				overflow: "auto",
				border: "1px dashed gray"
			}
		});

		// Initialize the toolbar

		// TODO figure out why this is needed for the demo to work
		$.Arte.Toolbar.configuration.requireEditorFocus = false;

		var buttons = ["bold", "italic", "underline"];

		$newBlogPost.find(".toolbar").ArteToolbar({
			buttons: buttons
		});

		// Hide the editor initially
		$newBlogPost.find(".blog-post-editor").hide();
	};

	var getBlogPostTitle = function(defaultTitle){
		var blogPostTitle;
		if (defaultTitle !== undefined) {
			blogPostTitle = defaultTitle;
		} else {
			var $newPostTitle = $('#new-post-title');
			blogPostTitle = $newPostTitle.val();
			$newPostTitle.val(""); // clear out for next post
		}
		return blogPostTitle;
	};

	var createNewBlogPost = function(defaultTitle, defaultText){
		var blogPost = new BlogPost();
		var blogPostTitle = getBlogPostTitle(defaultTitle);
		var $newBlogPost = $(blogPost.createHtml(blogPostTitle));

		$("#blog-posts").prepend($newBlogPost);

		if (defaultText !== undefined) {
			$newBlogPost.find(".blog-post-content").html(defaultText);
		}

		createTextEditor($newBlogPost, defaultText);

		attachEventHandlers($newBlogPost);
	};

	var initializePage = function(){
		$("#add-button").click(function(){
			return createNewBlogPost();
		});

		// Create an initial blog post
		createNewBlogPost("Trying Sushi for the First Time",
			"I can't believe I was eating raw fish but it was pretty tasty."
		);
	};

	initializePage();

})();
