private
setTag: anInteger value: anObject
	((anInteger isKindOf: Integer) and: [anInteger >= 0 and: [anInteger < 18446744073709551616]])
		ifFalse: [^CborError signal: 'CBOR tag number must be an unsigned 64-bit integer'].
	tag := anInteger.
	value := anObject