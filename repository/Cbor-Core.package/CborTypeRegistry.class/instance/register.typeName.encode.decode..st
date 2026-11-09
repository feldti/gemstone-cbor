registering
register: aClass typeName: aString encode: encodeBlock decode: decodeBlock
	"Map aClass to a type name (tag 27). Only registered names are ever instantiated
	 when decoding, so the registry acts as a whitelist."

	| name existing mapping |
	((aString isKindOf: CharacterCollection) and: [aString notEmpty])
		ifFalse: [^CborError signal: 'CBOR type name must be a non-empty string'].
	name := aString asString.
	existing := byName at: name ifAbsent: [nil].
	(existing notNil and: [existing typeClass ~~ aClass])
		ifTrue: [^CborError signal: 'CBOR type name ', name printString, ' is already registered for ', existing typeClass name].
	self unregister: aClass.
	mapping := CborTypeMapping forClass: aClass tag: nil typeName: name encode: encodeBlock decode: decodeBlock.
	byClass at: aClass put: mapping.
	byName at: name put: mapping.
	^mapping