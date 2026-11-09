writing - low level
writeIndefiniteTextStart
	"Start an indefinite-length text string; write definite text string chunks, then #writeBreak."

	stream nextPut: 16r7F