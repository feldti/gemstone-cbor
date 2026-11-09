cbor
fromCborPayload: anArray
	((anArray isKindOf: Array) and: [anArray size = 2
		and: [anArray first isNumber and: [anArray last isNumber]]])
		ifFalse: [^CborError signal: 'invalid point payload: ', anArray printString].
	^self x: anArray first y: anArray last