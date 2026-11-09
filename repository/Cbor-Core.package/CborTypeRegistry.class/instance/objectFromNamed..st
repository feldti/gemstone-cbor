private
objectFromNamed: value
	"Tag 27 content [typeName, arg1, ...]. Unregistered names are never instantiated;
	 they come back as a CborTag so they survive a decode/encode round trip."

	| mapping |
	((value isKindOf: Array) and: [value notEmpty and: [value first isKindOf: CharacterCollection]])
		ifFalse: [^CborTag tag: 27 value: value].
	mapping := self mappingForTypeName: value first.
	mapping isNil ifTrue: [^CborTag tag: 27 value: value].
	^mapping objectFrom: (value copyFrom: 2 to: value size)