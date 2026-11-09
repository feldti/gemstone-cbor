tests - floats
testSpecialFloats
	| infinity negativeInfinity nan |
	infinity := self double: '7ff0000000000000'.
	negativeInfinity := self double: 'fff0000000000000'.
	nan := self double: '7ff8000000000000'.
	self assertRoundTrip: infinity hex: 'f97c00'.
	self assertRoundTrip: negativeInfinity hex: 'f9fc00'.
	self assertEncoding: nan is: 'f97e00'.
	self assert: (self decodeHex: 'f97e00') _isNaN.
	self assert: (self decodeHex: 'fa7fc00000') _isNaN.
	self assert: (self decodeHex: 'fb7ff8000000000000') _isNaN.
	self assert: (self decodeHex: 'fa7f800000') equals: infinity.
	self assert: (self decodeHex: 'fbfff0000000000000') equals: negativeInfinity