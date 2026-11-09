writing - objects
writeSet: aCollection
	"Tag 258 (mathematical finite set) wrapping an array."

	| elements |
	self writeTag: 258.
	canonical
		ifFalse: [^self writeArray: aCollection asArray].
	self enter.
	elements := aCollection asArray collect: [:each | self encodedBytesOf: each].
	elements := elements asSortedCollection: [:a :b | self bytes: a lessOrEqual: b].
	self writeArrayHeader: elements size.
	elements do: [:each | stream nextPutAll: each].
	self leave