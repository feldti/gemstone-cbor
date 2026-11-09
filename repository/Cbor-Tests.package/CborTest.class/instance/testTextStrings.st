tests - strings
testTextStrings
	self assertRoundTrip: '' hex: '60'.
	self assertRoundTrip: 'a' hex: '6161'.
	self assertRoundTrip: 'IETF' hex: '6449455446'.
	self assertRoundTrip: '"\' hex: '62225c'.
	self assertEncoding: #IETF is: '6449455446'.
	self assertEncoding: $a is: '6161'