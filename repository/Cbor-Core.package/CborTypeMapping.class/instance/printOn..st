printing
printOn: aStream
	aStream nextPutAll: 'CborTypeMapping('; nextPutAll: typeClass name; nextPutAll: ' <-> '.
	typeName isNil
		ifTrue: [aStream nextPutAll: 'tag '; print: tag]
		ifFalse: [aStream nextPutAll: '27 '; print: typeName].
	aStream nextPut: $)