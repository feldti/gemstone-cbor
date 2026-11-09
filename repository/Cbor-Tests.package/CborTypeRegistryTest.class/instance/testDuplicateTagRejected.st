tests
testDuplicateTagRejected
	| r |
	r := self registry.
	self should: [r register: Association tag: 40001 encode: [:a | 0] decode: [:p | nil]] raise: CborError.
	self assert: (r mappingForTag: 40001) typeClass equals: CborTestPoint