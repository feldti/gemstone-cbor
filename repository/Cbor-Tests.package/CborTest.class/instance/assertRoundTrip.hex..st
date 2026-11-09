helpers
assertRoundTrip: anObject hex: hexString
	"Encoding anObject gives hexString, and decoding hexString gives an object equal to anObject."

	self assertEncoding: anObject is: hexString.
	self assert: (self decodeHex: hexString) equals: anObject