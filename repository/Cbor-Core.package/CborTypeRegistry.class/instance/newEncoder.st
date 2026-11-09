encoding
newEncoder
	"Answer an encoder writing to a fresh ByteArray that knows the registered types."

	^CborTypedEncoder new registry: self; yourself