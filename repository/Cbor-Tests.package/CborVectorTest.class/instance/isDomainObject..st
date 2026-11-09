helpers
isDomainObject: anObject
	^(anObject isKindOf: CborTestPoint)
		or: [(anObject isKindOf: CborTestCustomer) or: [anObject isKindOf: CborTestAddress]]