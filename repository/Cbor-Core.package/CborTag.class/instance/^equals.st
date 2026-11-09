comparing
= anObject
	self == anObject ifTrue: [^true].
	^(anObject isKindOf: CborTag)
		and: [tag = anObject tag and: [value = anObject value]]