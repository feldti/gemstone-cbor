private - decoding
floatFromHalfBits: bits
	"Convert IEEE 754 half precision bits to a Float. Infinities and NaNs are built
	 from the equivalent double precision bit pattern (the GemStone kernel has no
	 Float infinity / Float nan)."

	| negative exp mant value |
	negative := (bits bitShift: -15) = 1.
	exp := (bits bitShift: -10) bitAnd: 31.
	mant := bits bitAnd: 1023.
	exp = 31 ifTrue: [
		^self floatFromDoubleBits: ((bits bitShift: -15) bitShift: 63)
			+ (16r7FF bitShift: 52) + (mant bitShift: 42)].
	value := exp = 0
		ifTrue: [(mant / 16777216) asFloat]
		ifFalse: [((mant + 1024) * (2 raisedTo: exp - 25)) asFloat].
	^negative ifTrue: [value negated] ifFalse: [value]