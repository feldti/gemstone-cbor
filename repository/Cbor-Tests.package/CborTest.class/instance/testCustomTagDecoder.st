tests - tags
testCustomTagDecoder
	| decoder |
	decoder := CborDecoder onBytes: (self hex: 'd82076687474703a2f2f7777772e6578616d706c652e636f6d').
	decoder onTag: 32 do: [:value | value size].
	self assert: decoder decode equals: 22