private - reading
readUnsigned: byteCount
	"byteCount is 1, 2, 4 or 8; read big-endian with a primitive."

	| v |
	position + byteCount > limit ifTrue: [^self signalError: 'unexpected end of input'].
	v := bytes at: position + 1 signed: false width: byteCount.
	position := position + byteCount.
	^v