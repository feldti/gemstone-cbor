tests
testReRegisterReplacesMapping
	| r |
	r := self registry.
	r register: CborTestPoint tag: 40005.
	self assert: (r mappingForTag: 40001) isNil.
	self assert: (self hexOf: (r encode: (self p: 1 _: 2))) equals: 'd99c45820102'.
	r register: CborTestPoint typeName: 'example.Point'.
	self assert: (r mappingForTag: 40005) isNil.
	self assert: (r mappingForTypeName: 'example.Point') typeClass equals: CborTestPoint