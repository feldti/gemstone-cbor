decoding
configureDecoder: aCborDecoder
	"Install converters for all registered types into aCborDecoder. Answer the decoder.
	 Converters registered on the decoder afterwards override these."

	byTag keysAndValuesDo: [:tagNumber :mapping |
		aCborDecoder onTag: tagNumber do: [:payload | mapping objectFrom: payload]].
	byName isEmpty
		ifFalse: [aCborDecoder onTag: 27 do: [:value | self objectFromNamed: value]].
	^aCborDecoder