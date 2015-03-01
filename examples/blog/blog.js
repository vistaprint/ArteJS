(function(){

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
		var blogPostTitle = getBlogPostTitle(defaultTitle);
		var blogPost = new BlogPost(blogPostTitle, defaultText);
		blogPost.addToParentContainer($("#blog-posts"));
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
