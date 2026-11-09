helpers
vectorsWhere: aBlock
	"Answer vectors as Arrays {name. rule. valid. roundtrip. bytes} that satisfy aBlock."

	^(self vectors
		collect: [:v | Array with: (v at: 1) with: (v at: 2) with: (v at: 3) with: (v at: 4)
			with: (Cbor bytesFromHex: (v at: 5))])
		select: aBlock