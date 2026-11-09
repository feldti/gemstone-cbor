comparing
= anObject
	^(anObject isKindOf: CborSimpleValue) and: [value = anObject value]