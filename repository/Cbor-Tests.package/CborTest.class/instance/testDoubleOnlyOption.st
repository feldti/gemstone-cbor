tests - floats
testDoubleOnlyOption
	| encoder |
	encoder := CborEncoder new shortestFloats: false.
	encoder encode: 1.5.
	self assert: (Cbor hexFromBytes: encoder contents) equals: 'fb3ff8000000000000'