cbor
fromCborPayload: aMap
	"Payload per spec/types.cddl: {1: name, 2: id, ?3: [+ address], ?4: 1(int)}.
	 Unknown keys are ignored (forward compatibility)."

	| aName anId someAddresses aCreatedAt |
	(aMap isKindOf: AbstractDictionary) ifFalse: [^CborError signal: 'customer payload must be a map'].
	aName := aMap at: 1 ifAbsent: [nil].
	anId := aMap at: 2 ifAbsent: [nil].
	someAddresses := aMap at: 3 ifAbsent: [nil].
	aCreatedAt := aMap at: 4 ifAbsent: [nil].
	((aName isKindOf: CharacterCollection) and: [aName encodeAsUTF8 size between: 1 and: 200])
		ifFalse: [^CborError signal: 'customer name must be a text string of 1..200 bytes'].
	((anId isKindOf: Integer) and: [anId >= 0])
		ifFalse: [^CborError signal: 'customer id must be an unsigned integer'].
	(someAddresses isNil or: [(someAddresses isKindOf: Array) and: [someAddresses notEmpty
		and: [someAddresses allSatisfy: [:each | each isKindOf: CborTestAddress]]]])
		ifFalse: [^CborError signal: 'customer addresses must be a non-empty array of addresses'].
	(aCreatedAt isNil or: [aCreatedAt isKindOf: DateAndTimeANSI])
		ifFalse: [^CborError signal: 'customer createdAt must be a tag 1 date/time'].
	^self name: aName id: anId addresses: (someAddresses ifNil: [#()]) createdAt: aCreatedAt