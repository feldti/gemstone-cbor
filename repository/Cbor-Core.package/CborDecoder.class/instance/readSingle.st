private - reading
readSingle
	"Answer the next 4 bytes as an IEEE 754 single precision Float."

	^(self readBytes: 4) floatAt: 1