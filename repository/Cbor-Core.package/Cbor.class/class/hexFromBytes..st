converting
hexFromBytes: aByteArray
	"Answer a lowercase hex string for aByteArray."

	| ws |
	ws := WriteStream on: String new.
	aByteArray do: [:b |
		ws nextPut: ('0123456789abcdef' at: (b bitShift: -4) + 1);
			nextPut: ('0123456789abcdef' at: (b bitAnd: 15) + 1)].
	^ws contents