private - decoding
floatFromDoubleBits: anInteger
	"Answer the Float with the given IEEE 754 double precision bit pattern."

	| bytes v |
	bytes := ByteArray new: 8.
	v := anInteger.
	8 to: 1 by: -1 do: [:i |
		bytes at: i put: (v bitAnd: 255).
		v := v bitShift: -8].
	^bytes doubleAt: 1