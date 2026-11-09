writing - low level
writeUtf8: aUtf8
	"Write already UTF-8 encoded bytes as a text string (major type 3).
	 Utf8 is a ByteArray subclass, so it is written without copying."

	self writeHead: 3 value: aUtf8 size.
	stream nextPutAll: aUtf8