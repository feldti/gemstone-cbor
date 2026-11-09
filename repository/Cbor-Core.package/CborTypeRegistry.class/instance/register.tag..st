registering
register: aClass tag: tagNumber
	"Map aClass to tagNumber. Instances must understand #cborPayload (answering an
	 encodable object) and aClass must understand #fromCborPayload: (answering an instance)."

	^self register: aClass tag: tagNumber encode: nil decode: nil