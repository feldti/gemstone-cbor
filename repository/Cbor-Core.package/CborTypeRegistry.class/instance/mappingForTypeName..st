accessing
mappingForTypeName: aString
	^byName at: aString asString ifAbsent: [nil]