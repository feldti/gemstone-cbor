tests - floats
testNegativeZero
	| decoded |
	self assertEncoding: -0.0 is: 'f98000'.
	decoded := self decodeHex: 'f98000'.
	self assert: decoded equals: 0.0.
	self assert: (Cbor hexFromBytes: (Cbor encode: decoded)) equals: 'f98000'