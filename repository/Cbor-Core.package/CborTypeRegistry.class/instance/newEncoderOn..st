encoding
newEncoderOn: aBinaryWriteStream
	^(CborTypedEncoder on: aBinaryWriteStream) registry: self; yourself