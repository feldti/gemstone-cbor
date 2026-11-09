writing - low level
writeIndefiniteBytesStart
	"Start an indefinite-length byte string; write definite byte string chunks, then #writeBreak."

	stream nextPut: 16r5F