tests
testDuplicateTypeNameRejected
	| r |
	r := CborTypeRegistry new.
	r register: CborTestPoint typeName: 'example.Point'.
	self should: [r register: Association typeName: 'example.Point'] raise: CborError