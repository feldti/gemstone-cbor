writing - objects
writeArray: aSequenceableCollection
	"SmallInteger elements are written directly, without the generic dispatch
	 (encode: -> encodeObject: -> writeInteger: -> writeHead:value:); unsigned
	 values below 65536 are written inline. This is the hot path for numeric arrays."

	| size inline each |
	self enter.
	size := aSequenceableCollection size.
	self writeArrayHeader: size.
	inline := self canInlineSmallIntegers.
	1 to: size do: [:i |
		each := aSequenceableCollection at: i.
		(inline and: [each class == SmallInteger])
			ifTrue: [
				(each >= 0 and: [each < 65536])
					ifTrue: [
						each < 24
							ifTrue: [stream nextPut: each]
							ifFalse: [
								each < 256
									ifTrue: [stream nextPut: 24; nextPut: each]
									ifFalse: [stream nextPut: 25; nextPut: (each bitShift: -8); nextPut: (each bitAnd: 255)]]]
					ifFalse: [
						each >= 0
							ifTrue: [self writeHead: 0 value: each]
							ifFalse: [self writeHead: 1 value: -1 - each]]]
			ifFalse: [self encodeObject: each]].
	self leave