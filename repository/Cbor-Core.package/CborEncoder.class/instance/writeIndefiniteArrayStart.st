writing - low level
writeIndefiniteArrayStart
	"Start an indefinite-length array; terminate with #writeBreak."

	stream nextPut: 16r9F