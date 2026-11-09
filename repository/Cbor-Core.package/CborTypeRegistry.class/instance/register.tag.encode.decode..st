registering
register: aClass tag: tagNumber encode: encodeBlock decode: decodeBlock
	"Map aClass to tagNumber using blocks; useful for classes you cannot or do not want
	 to change. encodeBlock: [:instance | payload], decodeBlock: [:payload | instance].
	 A nil block falls back to #cborPayload / #fromCborPayload:."

	| existing mapping |
	((tagNumber isKindOf: Integer) and: [tagNumber >= 0 and: [tagNumber < 18446744073709551616]])
		ifFalse: [^CborError signal: 'CBOR tag number must be an unsigned 64-bit integer'].
	tagNumber = 27
		ifTrue: [^CborError signal: 'tag 27 is reserved for named types, use #register:typeName:'].
	existing := byTag at: tagNumber ifAbsent: [nil].
	(existing notNil and: [existing typeClass ~~ aClass])
		ifTrue: [^CborError signal: 'CBOR tag ', tagNumber printString, ' is already registered for ', existing typeClass name].
	self unregister: aClass.
	mapping := CborTypeMapping forClass: aClass tag: tagNumber typeName: nil encode: encodeBlock decode: decodeBlock.
	byClass at: aClass put: mapping.
	byTag at: tagNumber put: mapping.
	^mapping