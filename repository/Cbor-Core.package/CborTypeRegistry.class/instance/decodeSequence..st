decoding
decodeSequence: aByteArray
	^(self newDecoderOnBytes: aByteArray) decodeAll