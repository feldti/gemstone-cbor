decoding
decodeFrom: aBinaryReadStream
	"Decode the next CBOR data item from aBinaryReadStream."

	^(CborDecoder on: aBinaryReadStream) decode