decoding
decodeSequence: aByteArray
	"Decode a CBOR sequence (RFC 8742) and answer an Array of its items."

	^(CborDecoder onBytes: aByteArray) decodeAll