encoding
encode: anObject on: aBinaryWriteStream
	"Write the CBOR encoding of anObject to aBinaryWriteStream."

	(CborEncoder on: aBinaryWriteStream) encode: anObject