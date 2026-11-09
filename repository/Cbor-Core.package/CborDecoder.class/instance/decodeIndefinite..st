private - decoding
decodeIndefinite: major
	| item result |
	(major = 2 or: [major = 3]) ifTrue: [^self decodeIndefiniteString: major].
	major = 4 ifTrue: [
		self enter.
		result := OrderedCollection new.
		[(item := self decodeItemOrBreak) == self] whileFalse: [result add: item].
		self leave.
		^result asArray].
	major = 5 ifTrue: [
		self enter.
		result := mapClass new.
		[(item := self decodeItemOrBreak) == self]
			whileFalse: [self readEntryInto: result key: item].
		self leave.
		^result].
	^self signalError: 'indefinite length not allowed for major type ', major printString