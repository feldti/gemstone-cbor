private - reading
readBytes: count
	"Answer the next count bytes as a ByteArray. Large counts are read in chunks so
	 a bogus length in malformed input fails on end of input, not on allocation."

	| result chunk ws remaining |
	count = 0 ifTrue: [^ByteArray new].
	count <= 65536 ifTrue: [^self readChunk: count].
	ws := WriteStream on: (ByteArray new).
	remaining := count.
	[remaining > 0] whileTrue: [
		chunk := self readChunk: (remaining min: 65536).
		ws nextPutAll: chunk.
		remaining := remaining - chunk size].
	result := ws contents.
	^result