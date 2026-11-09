writing - low level
writeMapHeader: size
	"Write a definite-length map head; size key/value pairs must follow."

	self writeHead: 5 value: size