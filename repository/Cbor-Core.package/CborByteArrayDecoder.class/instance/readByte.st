private - reading
readByte
	position >= limit ifTrue: [^self signalError: 'unexpected end of input'].
	position := position + 1.
	^bytes at: position