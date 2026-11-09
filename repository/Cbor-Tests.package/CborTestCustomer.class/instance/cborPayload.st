cbor
cborPayload
	"Optional fields are omitted when absent, as required by spec/types.cddl."

	| m |
	m := Dictionary new.
	m at: 1 put: name; at: 2 put: id.
	addresses isEmpty ifFalse: [m at: 3 put: addresses asArray].
	createdAt isNil ifFalse: [m at: 4 put: createdAt].
	^m