options
onTag: tagNumber do: aOneArgBlock
	"Register a converter for tagNumber. aOneArgBlock receives the decoded
	 content of the tag and answers the object to use instead. Registered
	 converters take precedence over the built-in tag handling."

	tagDecoders at: tagNumber put: aOneArgBlock