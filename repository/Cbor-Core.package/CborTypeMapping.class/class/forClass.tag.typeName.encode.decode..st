instance creation
forClass: aClass tag: tagNumberOrNil typeName: aStringOrNil encode: encodeBlockOrNil decode: decodeBlockOrNil
	^self new
		setClass: aClass
		tag: tagNumberOrNil
		typeName: aStringOrNil
		encode: encodeBlockOrNil
		decode: decodeBlockOrNil