instance creation
new
	"Answer an encoder writing into a fresh ByteArray."

	^self on: (WriteStream on: ByteArray new)