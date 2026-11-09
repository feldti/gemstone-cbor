tests
testPlainCborIgnoresRegistry
	| decoded |
	decoded := Cbor decode: (Cbor bytesFromHex: 'd99c41820102').
	self assert: decoded equals: (CborTag tag: 40001 value: #(1 2)).
	self should: [Cbor encode: (self p: 1 _: 2)] raise: CborError