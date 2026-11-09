tests
testUnknownTagPassesThrough
	| r bytes decoded |
	r := self registry.
	bytes := Cbor bytesFromHex: 'd99c4b820102'.
	decoded := r decode: bytes.
	self assert: decoded equals: (CborTag tag: 40011 value: #(1 2)).
	self assert: (r encode: decoded) equals: bytes