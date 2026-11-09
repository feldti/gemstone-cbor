encoding
encodeCanonical: anObject
	^(self newEncoder canonical: true; encode: anObject) contents