writing - objects
writeMap: aDictionary
	| pairs |
	self writeMapHeader: aDictionary size.
	canonical ifFalse: [
		aDictionary keysAndValuesDo: [:key :value |
			self encode: key.
			self encode: value].
		^self].
	pairs := OrderedCollection new.
	aDictionary keysAndValuesDo: [:key :value |
		pairs add: (Array with: (self encodedBytesOf: key) with: value)].
	pairs := pairs asSortedCollection: [:a :b | self bytes: a first lessOrEqual: b first].
	pairs do: [:pair |
		stream nextPutAll: pair first.
		self encode: pair last]