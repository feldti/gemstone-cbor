encoding
encode: anObject on: aCborEncoder
	"Write anObject as tag(payload), or for named types as 27([typeName, arg1, ...])."

	| payload args |
	payload := self payloadFor: anObject.
	typeName isNil ifTrue: [
		aCborEncoder writeTag: tag.
		^aCborEncoder encode: payload].
	(payload isKindOf: SequenceableCollection)
		ifFalse: [^CborError signal: 'payload of named CBOR type ', typeName, ' must be a sequence of constructor arguments'].
	args := payload asArray.
	aCborEncoder writeTag: 27.
	aCborEncoder writeArrayHeader: args size + 1.
	aCborEncoder encode: typeName.
	args do: [:each | aCborEncoder encode: each]