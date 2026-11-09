helpers
assertDecodeError: hexString
	self should: [self decodeHex: hexString] raise: CborError