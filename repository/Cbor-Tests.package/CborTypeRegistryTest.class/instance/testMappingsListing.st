tests
testMappingsListing
	| r list |
	r := self registry.
	r register: Association typeName: 'example.Assoc'
		encode: [:a | Array with: a key with: a value]
		decode: [:args | args first -> args last].
	list := r mappings.
	self assert: list size equals: 2.
	self assert: list first tag equals: 40001.
	self assert: list last typeName equals: 'example.Assoc'