instance creation
onBytes: aByteArray
	"Answer a decoder that reads aByteArray directly by index (faster than a stream)."

	^CborByteArrayDecoder basicNew initialize setBytes: aByteArray asByteArray