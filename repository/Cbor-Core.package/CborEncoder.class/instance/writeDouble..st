writing - low level
writeDouble: aFloat
	"Write aFloat as a 64-bit IEEE 754 double."

	| bytes |
	bytes := ByteArray new: 8.
	bytes doubleAt: 1 put: aFloat asFloat.
	stream nextPut: 16rFB; nextPutAll: bytes