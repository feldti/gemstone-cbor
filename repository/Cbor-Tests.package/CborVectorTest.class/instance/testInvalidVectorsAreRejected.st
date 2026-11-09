tests
testInvalidVectorsAreRejected
	"An invalid vector must either signal CborError or not decode to the rule's class."

	| r |
	r := self registry.
	(self vectorsWhere: [:v | (v at: 3) not]) do: [:v | | result |
		result := [r decode: (v at: 5)] on: CborError do: [:ex | ex return: #rejected].
		self assert: (result == #rejected or: [(result isKindOf: (self classForRule: (v at: 2))) not])
			description: (v at: 1), ' was accepted']