helpers
double: hexString
	"Answer the Float with the given 64-bit IEEE 754 pattern (big-endian hex)."

	^(Cbor bytesFromHex: hexString) doubleAt: 1