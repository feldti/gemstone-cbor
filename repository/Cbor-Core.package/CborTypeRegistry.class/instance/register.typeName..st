registering
register: aClass typeName: aString
	"Map aClass to a type name, encoded as tag 27 [typeName, arg1, ...].
	 #cborPayload must answer the argument sequence, #fromCborPayload: receives it as an Array."

	^self register: aClass typeName: aString encode: nil decode: nil