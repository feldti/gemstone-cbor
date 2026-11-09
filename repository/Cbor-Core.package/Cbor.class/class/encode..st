encoding
encode: anObject
	"Answer a ByteArray with the CBOR encoding of anObject."

	^(CborEncoder new encode: anObject) contents