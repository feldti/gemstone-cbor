encoding
encodeCanonical: anObject
	"Answer the deterministic CBOR encoding of anObject (RFC 8949, 4.2.1):
	 shortest integer and float forms, map keys sorted bytewise."

	^(CborEncoder new canonical: true; encode: anObject) contents