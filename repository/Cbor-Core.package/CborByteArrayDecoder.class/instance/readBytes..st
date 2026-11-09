private - reading
readBytes: count
	"A bogus length beyond the input fails here, before anything is allocated."

	| result |
	count > (limit - position) ifTrue: [^self signalError: 'unexpected end of input'].
	count = 0 ifTrue: [^ByteArray new].
	result := bytes copyFrom: position + 1 to: position + count.
	position := position + count.
	^result