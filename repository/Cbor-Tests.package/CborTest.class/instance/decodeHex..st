helpers
decodeHex: hexString
	^Cbor decode: (self hex: hexString)