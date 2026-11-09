instance creation
onBytes: aByteArray
	^self on: (ReadStream on: aByteArray asByteArray)