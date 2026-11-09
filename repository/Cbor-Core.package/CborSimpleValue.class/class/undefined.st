instance creation
undefined
	"Answer the CBOR 'undefined' value (simple value 23)."

	Undefined isNil ifTrue: [Undefined := self basicNew setValue: 23].
	^Undefined