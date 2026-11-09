tests
testUnregisteredTypeNameIsNotInstantiated
	| r bytes decoded |
	r := CborTypeRegistry new.
	r register: CborTestPoint typeName: 'example.Point'.
	bytes := Cbor encode: (CborTag tag: 27 value: #('evil.Class' 1)).
	decoded := r decode: bytes.
	self assert: decoded equals: (CborTag tag: 27 value: #('evil.Class' 1)).
	self assert: (r encode: decoded) equals: bytes