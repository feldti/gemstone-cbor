decoding
newDecoderOnBytes: aByteArray
	^self configureDecoder: (CborDecoder onBytes: aByteArray)