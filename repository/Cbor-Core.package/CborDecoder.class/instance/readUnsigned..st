private - reading
readUnsigned: byteCount
	| v |
	v := 0.
	byteCount timesRepeat: [v := (v bitShift: 8) + self readByte].
	^v