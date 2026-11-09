tests - api
testSequence
	self assert: (Cbor decodeSequence: (self hex: '0102f5')) equals: {1. 2. true}.
	self assert: (Cbor decodeSequence: ByteArray new) equals: #()