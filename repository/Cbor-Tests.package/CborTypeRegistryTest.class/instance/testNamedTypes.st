tests
testNamedTypes
	| r bytes decoded |
	r := CborTypeRegistry new.
	r register: CborTestPoint typeName: 'example.Point'.
	bytes := r encode: (self p: 1 _: 2).
	self assert: (self hexOf: bytes) equals: 'd81b836d6578616d706c652e506f696e740102'.
	decoded := r decode: bytes.
	self assert: decoded equals: (self p: 1 _: 2)