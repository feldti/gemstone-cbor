writing - low level
writeUtf8: aUtf8
	"Write already UTF-8 encoded bytes as a text string (major type 3)."

	| bytes |
	bytes := aUtf8 asByteArray.
	self writeHead: 3 value: bytes size.
	stream nextPutAll: bytes