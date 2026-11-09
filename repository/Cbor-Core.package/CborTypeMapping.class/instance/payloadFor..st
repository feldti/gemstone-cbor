converting
payloadFor: anObject
	"Answer the CBOR-encodable payload representing anObject."

	^encodeBlock isNil
		ifTrue: [anObject cborPayload]
		ifFalse: [encodeBlock value: anObject]