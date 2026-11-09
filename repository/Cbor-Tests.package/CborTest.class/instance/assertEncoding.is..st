helpers
assertEncoding: anObject is: hexString
	self assert: (Cbor hexFromBytes: (Cbor encodeCanonical: anObject)) equals: hexString