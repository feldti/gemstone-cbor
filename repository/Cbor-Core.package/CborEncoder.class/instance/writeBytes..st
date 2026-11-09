writing - low level
writeBytes: aByteArray
	"Write a definite-length byte string (major type 2)."

	self writeHead: 2 value: aByteArray size.
	stream nextPutAll: aByteArray