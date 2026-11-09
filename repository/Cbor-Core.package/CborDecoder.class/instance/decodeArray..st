private - decoding
decodeArray: size
	| result |
	self enter.
	size <= 65536
		ifTrue: [
			result := Array new: size.
			1 to: size do: [:i | result at: i put: self decodeNested]]
		ifFalse: [
			result := OrderedCollection new.
			size timesRepeat: [result add: self decodeNested].
			result := result asArray].
	self leave.
	^result