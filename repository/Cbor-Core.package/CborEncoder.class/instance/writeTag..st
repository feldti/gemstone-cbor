writing - low level
writeTag: anInteger
	"Write a tag head (major type 6). The tagged item must be written next."

	self writeHead: 6 value: anInteger