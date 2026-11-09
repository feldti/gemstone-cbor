tests - simple
testSimpleValues
	self assertRoundTrip: false hex: 'f4'.
	self assertRoundTrip: true hex: 'f5'.
	self assertRoundTrip: nil hex: 'f6'.
	self assertRoundTrip: CborSimpleValue undefined hex: 'f7'.
	self assertRoundTrip: (CborSimpleValue value: 16) hex: 'f0'.
	self assertRoundTrip: (CborSimpleValue value: 255) hex: 'f8ff'.
	self assert: (self decodeHex: 'f7') isUndefined.
	self should: [CborSimpleValue value: 24] raise: CborError.
	self should: [CborSimpleValue value: 21] raise: CborError