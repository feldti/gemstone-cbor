tests - errors
testUnencodableObject
	self should: [Cbor encode: Object new] raise: CborError