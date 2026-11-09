printing
printOn: aStream
	self isUndefined ifTrue: [^aStream nextPutAll: 'undefined'].
	aStream nextPutAll: 'simple('; print: value; nextPut: $)