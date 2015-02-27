(function(){
	// Initialize and get a reference to the editor
	var $arte = $(".editor").Arte({
		editorType: $.Arte.constants.editorTypes.richText,
		styles: { // default styles can be passed in as well
			height: "200px",
			width: "300px",
			overflow: "auto",
			border: "1px dashed gray"
		}
	});

	// Initialize the toolbar
	var buttons = ["bold", "italic", "underline"];

	$.Arte.Toolbar.configuration.requireEditorFocus = false; //cwkTODO not sure what this should be

	$(".toolbar").ArteToolbar({
		buttons: buttons
		//requireEditorFocus: false
	});

	// Set focus to the editor so the toolbar becomes enabled
	$arte.focus();

})();
