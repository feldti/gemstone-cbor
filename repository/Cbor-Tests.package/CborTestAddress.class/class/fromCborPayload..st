cbor
fromCborPayload: aMap
	"Payload per spec/types.cddl: {1: street, 2: city, ?3: zip (5 bytes)}. Unknown keys are ignored."

	| aStreet aCity aZip |
	(aMap isKindOf: AbstractDictionary) ifFalse: [^CborError signal: 'address payload must be a map'].
	aStreet := aMap at: 1 ifAbsent: [nil].
	aCity := aMap at: 2 ifAbsent: [nil].
	aZip := aMap at: 3 ifAbsent: [nil].
	((aStreet isKindOf: CharacterCollection) and: [aCity isKindOf: CharacterCollection])
		ifFalse: [^CborError signal: 'address requires text keys 1 (street) and 2 (city)'].
	(aZip isNil or: [(aZip isKindOf: CharacterCollection) and: [aZip encodeAsUTF8 size = 5]])
		ifFalse: [^CborError signal: 'address zip must be a 5-byte text string'].
	^self street: aStreet city: aCity zip: aZip