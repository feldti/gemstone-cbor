private - reading
readDouble
	| v |
	position + 8 > limit ifTrue: [^self signalError: 'unexpected end of input'].
	v := bytes at: position + 1 signed: false width: -8.
	position := position + 8.
	^v