private - decoding
decodeIndefiniteString: major
	"Concatenate definite-length chunks of the same major type until break."

	| ws initial info chunk |
	ws := WriteStream on: ByteArray new.
	[initial := self readByte.
	 initial = 16rFF] whileFalse: [
		(initial bitShift: -5) = major
			ifFalse: [^self signalError: 'invalid chunk in indefinite-length string'].
		info := initial bitAnd: 31.
		info = 31 ifTrue: [^self signalError: 'nested indefinite-length string chunk'].
		chunk := self readBytes: (self readArgument: info).
		major = 3 ifTrue: [self stringFromUtf8: chunk].
		ws nextPutAll: chunk].
	major = 2 ifTrue: [^ws contents].
	^self stringFromUtf8: ws contents