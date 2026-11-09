instance creation
on: aBinaryWriteStream
	"Answer an encoder writing bytes (SmallIntegers 0..255) to aBinaryWriteStream."

	^self basicNew initialize setStream: aBinaryWriteStream