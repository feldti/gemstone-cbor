tests
testUnknownKeysAreIgnored
	| customer |
	customer := self registry decode: ((self vectorsWhere: [:v | (v at: 1) = 'customer-extension']) first at: 5).
	self assert: customer name equals: 'Ada'.
	self assert: customer id equals: 42