tests
testSelectorBasedMapping
	| r bytes decoded |
	r := self registry.
	bytes := r encode: (self p: 1 _: 2).
	self assert: (self hexOf: bytes) equals: 'd99c41820102'.
	decoded := r decode: bytes.
	self assert: decoded class equals: CborTestPoint.
	self assert: decoded equals: (self p: 1 _: 2)