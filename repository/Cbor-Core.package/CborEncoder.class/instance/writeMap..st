writing - objects
writeMap: aDictionary
	| pairs |
	self enter.
	self writeMapHeader: aDictionary size.
	canonical ifFalse: [
		aDictionary keysAndValuesDo: [:key :value |
			self encodeObject: key.
			self encodeObject: value].
		^self leave].
	pairs := OrderedCollection new.
	aDictionary keysAndValuesDo: [:key :value |
		pairs add: (Array with: (self encodedBytesOf: key) with: value)].
	pairs := pairs asSortedCollection: [:a :b | self bytes: a first lessOrEqual: b first].
	pairs do: [:pair |
		stream nextPutAll: pair first.
		self encodeObject: pair last].
	self leave