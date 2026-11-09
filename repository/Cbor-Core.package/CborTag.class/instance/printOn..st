printing
printOn: aStream
	aStream print: tag; nextPut: $(; print: value; nextPut: $)