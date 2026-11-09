private
encodedBytesOf: anObject
	"Encode anObject with the receiver's options into a separate ByteArray."

	| sub |
	sub := self newNestedEncoder.
	sub encode: anObject.
	^sub contents