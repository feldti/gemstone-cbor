writing - low level
writeFloat: aFloat
	"Write aFloat. With shortestFloats (default) or canonical mode the shortest of
	 half, single and double precision that represents the value exactly is used;
	 NaN is written as the canonical half-precision quiet NaN (f9 7e00).
	 The bit pattern is split into two 32-bit halves so that all arithmetic stays
	 within SmallIntegers."

	| bytes hi lo sign exp mant e full shift |
	(shortestFloats or: [canonical]) ifFalse: [^self writeDouble: aFloat].
	bytes := ByteArray new: 8.
	bytes doubleAt: 1 put: aFloat asFloat.
	hi := bytes unsigned32At: 1.
	lo := bytes unsigned32At: 5.
	sign := hi bitShift: -31.
	exp := (hi bitShift: -20) bitAnd: 16r7FF.
	mant := ((hi bitAnd: 16rFFFFF) bitShift: 32) + lo.
	exp = 16r7FF ifTrue: [
		mant = 0 ifTrue: [^self writeHalfBits: (sign bitShift: 15) + 16r7C00].
		^self writeHalfBits: 16r7E00].
	exp = 0 ifTrue: [
		mant = 0 ifTrue: [^self writeHalfBits: (sign bitShift: 15)].
		"double subnormals are not representable in a shorter format"
		stream nextPut: 16rFB; nextPutAll: bytes.
		^self].
	e := exp - 1023.
	full := mant + 16r10000000000000.
	"half precision: normal"
	((e between: -14 and: 15) and: [(mant bitAnd: 16r3FFFFFFFFFF) = 0])
		ifTrue: [^self writeHalfBits: (sign bitShift: 15) + ((e + 15) bitShift: 10) + (mant bitShift: -42)].
	"half precision: subnormal"
	(e between: -24 and: -15) ifTrue: [
		shift := 28 - e.
		(full bitAnd: (1 bitShift: shift) - 1) = 0
			ifTrue: [^self writeHalfBits: (sign bitShift: 15) + (full bitShift: shift negated)]].
	"single precision: normal"
	((e between: -126 and: 127) and: [(mant bitAnd: 16r1FFFFFFF) = 0])
		ifTrue: [^self writeSingleBits: (sign bitShift: 31) + ((e + 127) bitShift: 23) + (mant bitShift: -29)].
	"single precision: subnormal"
	(e between: -149 and: -127) ifTrue: [
		shift := -97 - e.
		(full bitAnd: (1 bitShift: shift) - 1) = 0
			ifTrue: [^self writeSingleBits: (sign bitShift: 31) + (full bitShift: shift negated)]].
	stream nextPut: 16rFB; nextPutAll: bytes