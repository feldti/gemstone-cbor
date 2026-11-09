tests - errors
testDuplicateKeys
	| decoder |
	self assert: ((self decodeHex: 'a201020103') at: 1) equals: 3.
	decoder := CborDecoder onBytes: (self hex: 'a201020103').
	decoder rejectDuplicateKeys: true.
	self should: [decoder decode] raise: CborError