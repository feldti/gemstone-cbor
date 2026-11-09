tests - integers
testUnsignedIntegers
	self assertRoundTrip: 0 hex: '00'.
	self assertRoundTrip: 1 hex: '01'.
	self assertRoundTrip: 10 hex: '0a'.
	self assertRoundTrip: 23 hex: '17'.
	self assertRoundTrip: 24 hex: '1818'.
	self assertRoundTrip: 25 hex: '1819'.
	self assertRoundTrip: 100 hex: '1864'.
	self assertRoundTrip: 255 hex: '18ff'.
	self assertRoundTrip: 256 hex: '190100'.
	self assertRoundTrip: 1000 hex: '1903e8'.
	self assertRoundTrip: 65535 hex: '19ffff'.
	self assertRoundTrip: 65536 hex: '1a00010000'.
	self assertRoundTrip: 1000000 hex: '1a000f4240'.
	self assertRoundTrip: 4294967295 hex: '1affffffff'.
	self assertRoundTrip: 4294967296 hex: '1b0000000100000000'.
	self assertRoundTrip: 1000000000000 hex: '1b000000e8d4a51000'.
	self assertRoundTrip: 18446744073709551615 hex: '1bffffffffffffffff'