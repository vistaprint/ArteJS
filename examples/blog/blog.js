(function(){
	var someVariable = "helloWorld";

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

	$(".edit-button").click(function(){
		// Set focus to the editor so the toolbar becomes enabled
		arte.focus();

		var blogPostContent = $(".blog-post-content").html();
		arte.get(0).value(blogPostContent);
	});

	$(".save-button").click(function(){
		var editorContent = arte.get(0).value();
		$(".blog-post-content").html(editorContent);
	});

})();
