instance creation
tag: anInteger value: anObject
	"Answer a tagged data item (CBOR major type 6)."

	^self new setTag: anInteger value: anObject