tests
testVectorsArePresent
	self assert: (self vectorsWhere: [:v | v at: 3]) size >= 10.
	self assert: (self vectorsWhere: [:v | (v at: 3) not]) size >= 5