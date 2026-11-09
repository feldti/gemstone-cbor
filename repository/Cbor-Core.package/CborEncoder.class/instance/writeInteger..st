writing - low level
writeInteger: anInteger
	"Write an integer of any size. Values outside the 64-bit range use
	 bignum tags 2 (positive) and 3 (negative). SmallIntegers take a fast path
	 that never compares against LargeIntegers."

	| n |
	anInteger class == SmallInteger ifTrue: [
		anInteger >= 0 ifTrue: [^self writeHead: 0 value: anInteger].
		^self writeHead: 1 value: -1 - anInteger].
	anInteger >= 0
		ifTrue: [
			anInteger < 18446744073709551616 ifTrue: [^self writeHead: 0 value: anInteger].
			self writeTag: 2.
			^self writeBytes: (self bytesOfUnsigned: anInteger)].
	n := -1 - anInteger.
	n < 18446744073709551616 ifTrue: [^self writeHead: 1 value: n].
	self writeTag: 3.
	self writeBytes: (self bytesOfUnsigned: n)