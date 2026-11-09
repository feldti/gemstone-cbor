accessing
mappings
	"Answer all mappings, sorted by tag number, then by type name."

	^(byClass values asSortedCollection: [:a :b |
		a isNamed = b isNamed
			ifTrue: [a isNamed ifTrue: [a typeName <= b typeName] ifFalse: [a tag <= b tag]]
			ifFalse: [b isNamed]]) asArray