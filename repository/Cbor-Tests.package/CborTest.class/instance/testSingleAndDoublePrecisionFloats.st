tests - floats
testSingleAndDoublePrecisionFloats
	self assertRoundTrip: 100000.0 hex: 'fa47c35000'.
	self assertRoundTrip: 3.4028234663852886e38 hex: 'fa7f7fffff'.
	self assertRoundTrip: 1.1 hex: 'fb3ff199999999999a'.
	self assertRoundTrip: 1.0e300 hex: 'fb7e37e43c8800759c'.
	self assertRoundTrip: -4.1 hex: 'fbc010666666666666'.
	self assert: (self decodeHex: 'fa3fc00000') equals: 1.5.
	self assert: (self decodeHex: 'fb3ff8000000000000') equals: 1.5