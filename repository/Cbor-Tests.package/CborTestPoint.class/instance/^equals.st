comparing
= anObject
	^(anObject isKindOf: CborTestPoint) and: [x = anObject x and: [y = anObject y]]