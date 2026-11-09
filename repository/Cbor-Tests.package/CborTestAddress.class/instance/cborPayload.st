cbor
cborPayload
	| m |
	m := Dictionary new.
	m at: 1 put: street; at: 2 put: city.
	zip isNil ifFalse: [m at: 3 put: zip].
	^m