decoding
decodeAll
	"Decode a CBOR sequence (RFC 8742): answer an Array of all items until end of input."

	| items |
	items := OrderedCollection new.
	[self atEnd] whileFalse: [items add: self decode].
	^items asArray