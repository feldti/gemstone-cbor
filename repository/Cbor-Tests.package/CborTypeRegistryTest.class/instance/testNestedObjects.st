tests
testNestedObjects
	| r d decoded |
	r := self registry.
	d := Dictionary new.
	d at: 'line' put: (Array with: (self p: 0 _: 0) with: (self p: 3 _: 4)).
	d at: 'origin' put: (self p: -1 _: 2.5).
	decoded := r decode: (r encode: d).
	self assert: (decoded at: 'line') equals: (Array with: (self p: 0 _: 0) with: (self p: 3 _: 4)).
	self assert: (decoded at: 'origin') equals: (self p: -1 _: 2.5).
	self assert: (decoded at: 'origin') class equals: CborTestPoint