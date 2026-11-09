decoding
newDecoderOn: aBinaryReadStream
	^self configureDecoder: (CborDecoder on: aBinaryReadStream)