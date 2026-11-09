private - decoding
decodeSimpleOrFloat: info
	| v |
	info < 20 ifTrue: [^CborSimpleValue value: info].
	info = 20 ifTrue: [^false].
	info = 21 ifTrue: [^true].
	info = 22 ifTrue: [^nil].
	info = 23 ifTrue: [^CborSimpleValue undefined].
	info = 24 ifTrue: [
		v := self readByte.
		v < 32 ifTrue: [^self signalError: 'invalid two-byte encoding of simple value ', v printString].
		^CborSimpleValue value: v].
	info = 25 ifTrue: [^self floatFromHalfBits: (self readUnsigned: 2)].
	info = 26 ifTrue: [^self readSingle].
	info = 27 ifTrue: [^self readDouble].
	info = 31 ifTrue: [^self].
	^self signalError: 'reserved additional information value ', info printString