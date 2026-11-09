private - reading
readDouble
	"Answer the next 8 bytes as an IEEE 754 double precision Float."

	^(self readBytes: 8) doubleAt: 1