tests - integers
testNegativeIntegers
	self assertRoundTrip: -1 hex: '20'.
	self assertRoundTrip: -10 hex: '29'.
	self assertRoundTrip: -24 hex: '37'.
	self assertRoundTrip: -25 hex: '3818'.
	self assertRoundTrip: -100 hex: '3863'.
	self assertRoundTrip: -1000 hex: '3903e7'.
	self assertRoundTrip: -18446744073709551616 hex: '3bffffffffffffffff'