private - reading
readArgument: info
	"Answer the argument encoded by additional information info (0..27)."

	info < 24 ifTrue: [^info].
	info = 24 ifTrue: [^self readByte].
	info = 25 ifTrue: [^self readUnsigned: 2].
	info = 26 ifTrue: [^self readUnsigned: 4].
	info = 27 ifTrue: [^self readUnsigned: 8].
	^self signalError: 'reserved additional information value ', info printString