private - decoding
decodeItemOrBreak
	"Decode the next item. Answer the receiver itself if a break code (16rFF) is read;
	 the decoder can never be the result of decoding, so it serves as a unique marker."

	| initial major info arg |
	initial := self readByte.
	major := initial bitShift: -5.
	info := initial bitAnd: 31.
	major = 7 ifTrue: [^self decodeSimpleOrFloat: info].
	info = 31 ifTrue: [^self decodeIndefinite: major].
	arg := self readArgument: info.
	major = 0 ifTrue: [^arg].
	major = 1 ifTrue: [^-1 - arg].
	major = 2 ifTrue: [^self readBytes: arg].
	major = 3 ifTrue: [^self stringFromUtf8: (self readBytes: arg)].
	major = 4 ifTrue: [^self decodeArray: arg].
	major = 5 ifTrue: [^self decodeMap: arg].
	^self decodeTag: arg