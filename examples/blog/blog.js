(function(){
	// Initialize and get a reference to the editor
	var arte = $(".editor").Arte({
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

	$(".toolbar").ArteToolbar({
		buttons: buttons
	});


	// Hide the editor initially
	$(".blog-post-editor").hide();

	// Set up event handlers

	$("#add-button").click(function(){
		var blogPost = new BlogPost();

		var $newPostTitle = $('#new-post-title');
		var blogPostTitle = $newPostTitle.val();
		$newPostTitle.val(""); // clear out for next post
		
		var $newBlogPost = $(blogPost.createHtml(blogPostTitle));

		$("#blog-posts").prepend($newBlogPost);
	});

	$(".edit-button").click(function(){
		$(".blog-post-content").hide();
		$(".edit-button").hide();
		$(".blog-post-editor").show();
		$(".save-button").show();

		// Set focus to the editor so the toolbar becomes enabled
		arte.focus();

		var blogPostContent = $(".blog-post-content").html();
		arte.get(0).value(blogPostContent);
	});

	$(".save-button").click(function(){
		var editorContent = arte.get(0).value();
		$(".blog-post-content").html(editorContent);

		$(".blog-post-editor").hide();
		$(".save-button").hide();
		$(".blog-post-content").show();
		$(".edit-button").show();
	});

})();
