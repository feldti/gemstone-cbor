tests
testDecoderConvertersCanBeOverridden
	| decoder |
	decoder := self registry newDecoderOnBytes: (Cbor bytesFromHex: 'd99c41820102').
	decoder onTag: 40001 do: [:payload | payload size].
	self assert: decoder decode equals: 2