tests
testRegistryOverridesSmallIntegersInArrays
	"The SmallInteger fast path in writeArray: must not bypass a registry mapping."

	| r |
	r := CborTypeRegistry new.
	r register: SmallInteger tag: 40020
		encode: [:i | i printString]
		decode: [:s | s asNumber].
	self assert: (self hexOf: (r encode: #(1 2))) equals: '82d99c546131d99c546132'.
	self assert: (r decode: (r encode: #(1 2))) equals: #(1 2)