writing - low level
writeString: aCharacterCollection
	"Write a text string (major type 3), encoding the characters as UTF-8."

	self writeUtf8: aCharacterCollection encodeAsUTF8