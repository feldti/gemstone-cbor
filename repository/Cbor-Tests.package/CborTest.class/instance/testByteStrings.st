tests - strings
testByteStrings
	self assertRoundTrip: ByteArray new hex: '40'.
	self assertRoundTrip: #[1 2 3 4] hex: '4401020304'