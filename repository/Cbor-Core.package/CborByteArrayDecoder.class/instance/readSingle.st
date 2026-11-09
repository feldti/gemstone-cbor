private - reading
readSingle
	| v |
	position + 4 > limit ifTrue: [^self signalError: 'unexpected end of input'].
	v := bytes at: position + 1 signed: false width: -4.
	position := position + 4.
	^v