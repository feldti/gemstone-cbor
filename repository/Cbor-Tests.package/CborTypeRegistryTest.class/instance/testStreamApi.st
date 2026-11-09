tests
testStreamApi
	| r ws rs decoder |
	r := self registry.
	ws := WriteStream on: ByteArray new.
	(r newEncoderOn: ws) encode: (self p: 1 _: 2); encode: (self p: 3 _: 4).
	rs := ReadStream on: ws contents.
	decoder := r newDecoderOn: rs.
	self assert: decoder decode equals: (self p: 1 _: 2).
	self assert: decoder decode equals: (self p: 3 _: 4).
	self assert: decoder atEnd.
	self assert: (r decodeSequence: ws contents) equals: (Array with: (self p: 1 _: 2) with: (self p: 3 _: 4))