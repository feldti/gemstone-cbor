tests
testUnregister
	| r removed |
	r := self registry.
	removed := r unregister: CborTestPoint.
	self assert: removed tag equals: 40001.
	self assert: r isEmpty.
	self assert: (r unregister: CborTestPoint) isNil.
	self should: [r encode: (self p: 1 _: 2)] raise: CborError