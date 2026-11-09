tests - api
testNestedRoundTrip
	| d decoded |
	d := Dictionary new.
	d at: 'name' put: 'GemStone'.
	d at: 'version' put: 3.
	d at: 'pi' put: 3.14159.
	d at: 'tags' put: #('db' 'smalltalk').
	d at: 'bin' put: #[0 255].
	d at: 'none' put: nil.
	decoded := Cbor decode: (Cbor encode: d).
	self assert: decoded size equals: d size.
	d keysAndValuesDo: [:k :v | self assert: (decoded at: k) equals: v]