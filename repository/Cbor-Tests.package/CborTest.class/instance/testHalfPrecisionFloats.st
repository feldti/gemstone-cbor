tests - floats
testHalfPrecisionFloats
	self assertRoundTrip: 0.0 hex: 'f90000'.
	self assertRoundTrip: 1.0 hex: 'f93c00'.
	self assertRoundTrip: 1.5 hex: 'f93e00'.
	self assertRoundTrip: 65504.0 hex: 'f97bff'.
	self assertRoundTrip: 5.960464477539063e-8 hex: 'f90001'.
	self assertRoundTrip: 0.00006103515625 hex: 'f90400'.
	self assertRoundTrip: -4.0 hex: 'f9c400'