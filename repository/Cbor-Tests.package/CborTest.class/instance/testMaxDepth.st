tests - errors
testMaxDepth
	| bytes decoder |
	bytes := ByteArray new: 2001.
	1 to: 2000 do: [:i | bytes at: i put: 16r81].
	self should: [Cbor decode: bytes] raise: CborError.
	decoder := CborDecoder onBytes: (self hex: '818100').
	decoder maxDepth: 1.
	self should: [decoder decode] raise: CborError