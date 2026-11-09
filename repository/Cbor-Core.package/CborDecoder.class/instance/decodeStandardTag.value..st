private - decoding
decodeStandardTag: tagNumber value: value
	"Built-in interpretation of well-known tags; unknown tags answer a CborTag."

	tagNumber = 0 ifTrue: [^self dateTimeFromString: value].
	tagNumber = 1 ifTrue: [
		value isNumber ifFalse: [^self signalError: 'tag 1 requires a number'].
		^DateAndTime posixSeconds: value offset: (Duration seconds: 0)].
	(tagNumber = 2 or: [tagNumber = 3]) ifTrue: [
		| n |
		(value isKindOf: ByteArray) ifFalse: [^self signalError: 'bignum tag requires a byte string'].
		n := 0.
		value do: [:b | n := (n bitShift: 8) + b].
		^tagNumber = 2 ifTrue: [n] ifFalse: [-1 - n]].
	tagNumber = 4 ifTrue: [^self decimalFractionFrom: value].
	tagNumber = 30 ifTrue: [
		((value isKindOf: Array) and: [value size = 2
			and: [(value first isKindOf: Integer) and: [(value last isKindOf: Integer) and: [value last > 0]]]])
			ifFalse: [^self signalError: 'tag 30 requires [integer, positive integer]'].
		^value first / value last].
	tagNumber = 258 ifTrue: [
		(value isKindOf: Array) ifFalse: [^self signalError: 'tag 258 requires an array'].
		^Set withAll: value].
	tagNumber = 55799 ifTrue: [^value].
	^CborTag tag: tagNumber value: value