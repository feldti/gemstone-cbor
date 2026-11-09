private - reading
readByte
	stream atEnd ifTrue: [^self signalError: 'unexpected end of input'].
	^stream next