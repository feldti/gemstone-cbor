tests - api
testStreamApi
	| ws rs |
	ws := WriteStream on: ByteArray new.
	Cbor encode: 'a' on: ws.
	Cbor encode: 1 on: ws.
	rs := ReadStream on: ws contents.
	self assert: (Cbor decodeFrom: rs) equals: 'a'.
	self assert: (Cbor decodeFrom: rs) equals: 1.
	self assert: rs atEnd