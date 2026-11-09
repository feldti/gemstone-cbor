tests
testValidVectorsDecodeToDomainObjects
	| r |
	r := self registry.
	(self vectorsWhere: [:v | v at: 3]) do: [:v | | decoded |
		decoded := r decode: (v at: 5).
		self assert: (decoded isKindOf: (self classForRule: (v at: 2)))
			description: (v at: 1), ': wrong class ', decoded class name.
		(v at: 2) = 'messages'
			ifTrue: [decoded do: [:each |
				self assert: (self isDomainObject: each) description: (v at: 1), ': element not converted']]]