tests
testInvalidRegistrations
	| r |
	r := CborTypeRegistry new.
	self should: [r register: CborTestPoint tag: 27] raise: CborError.
	self should: [r register: CborTestPoint tag: -1] raise: CborError.
	self should: [r register: CborTestPoint typeName: ''] raise: CborError.
	self assert: r isEmpty