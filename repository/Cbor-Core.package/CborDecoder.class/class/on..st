instance creation
on: aBinaryReadStream
	"Answer a decoder reading bytes (SmallIntegers 0..255) from aBinaryReadStream."

	^self basicNew initialize setStream: aBinaryReadStream