tests
testFullCustomerContent
	| customer |
	customer := self registry decode: ((self vectorsWhere: [:v | (v at: 1) = 'customer-full']) first at: 5).
	self assert: customer name equals: 'Grace Hopper'.
	self assert: customer id equals: 1906.
	self assert: customer addresses size equals: 2.
	self assert: customer addresses first zip equals: '10115'.
	self assert: customer addresses last zip isNil.
	self assert: customer createdAt asPosixSeconds equals: 1363896240