tests - tags
testFractions
	self assertRoundTrip: 1/3 hex: 'd81e820103'.
	self assertRoundTrip: -5/7 hex: 'd81e822407'.
	self assertDecodeError: 'd81e820100'