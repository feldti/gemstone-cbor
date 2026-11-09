converting
objectFrom: aPayload
	"Answer the object reconstructed from a decoded payload."

	^decodeBlock isNil
		ifTrue: [typeClass fromCborPayload: aPayload]
		ifFalse: [decodeBlock value: aPayload]