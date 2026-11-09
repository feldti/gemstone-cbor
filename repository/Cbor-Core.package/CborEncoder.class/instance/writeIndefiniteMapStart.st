writing - low level
writeIndefiniteMapStart
	"Start an indefinite-length map; terminate with #writeBreak."

	stream nextPut: 16rBF