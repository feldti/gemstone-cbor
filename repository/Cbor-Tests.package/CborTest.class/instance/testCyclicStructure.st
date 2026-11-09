tests - errors
testCyclicStructure
	| a |
	a := Array new: 1.
	a at: 1 put: a.
	self should: [Cbor encode: a] raise: CborError