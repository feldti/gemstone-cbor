tests
testRoundTripVectors
	"Decoding to domain objects and re-encoding deterministically reproduces the bytes."

	| r |
	r := self registry.
	(self vectorsWhere: [:v | v at: 4]) do: [:v |
		self
			assert: (Cbor hexFromBytes: (r encodeCanonical: (r decode: (v at: 5))))
			equals: (Cbor hexFromBytes: (v at: 5))]