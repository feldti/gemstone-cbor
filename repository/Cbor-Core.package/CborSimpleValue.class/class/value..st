instance creation
value: anInteger
	"Answer a CBOR simple value (major type 7). Values 20..23 have
	 predefined meanings (false, true, null, undefined) and 24..31 are
	 reserved, so only 0..19 and 32..255 may be created here.
	 Use #undefined for simple value 23."

	((anInteger isKindOf: Integer) and: [(anInteger between: 0 and: 19) or: [anInteger between: 32 and: 255]])
		ifFalse: [^CborError signal: 'invalid CBOR simple value: ', anInteger printString].
	^self basicNew setValue: anInteger