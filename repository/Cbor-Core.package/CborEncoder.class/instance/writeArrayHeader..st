writing - low level
writeArrayHeader: size
	"Write a definite-length array head; size items must follow."

	self writeHead: 4 value: size