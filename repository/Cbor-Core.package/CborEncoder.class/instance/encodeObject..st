private
encodeObject: anObject
	"Exact-class checks for the most frequent kernel classes come first (cheap identity
	 comparisons); everything else goes through the general isKindOf: chain."

	| cls |
	cls := anObject class.
	cls == SmallInteger ifTrue: [
		(anObject >= 0 and: [anObject < 24]) ifTrue: [^stream nextPut: anObject].
		^self writeInteger: anObject].
	(cls == String or: [cls == Unicode7]) ifTrue: [^self writeString: anObject].
	anObject == nil ifTrue: [^self writeNull].
	anObject == true ifTrue: [^self writeTrue].
	anObject == false ifTrue: [^self writeFalse].
	cls == SmallDouble ifTrue: [^self writeFloat: anObject].
	cls == Array ifTrue: [^self writeArray: anObject].
	cls == Dictionary ifTrue: [^self writeMap: anObject].
	cls == ByteArray ifTrue: [^self writeBytes: anObject].
	(anObject isKindOf: Integer) ifTrue: [^self writeInteger: anObject].
	(anObject isKindOf: BinaryFloat) ifTrue: [^self writeFloat: anObject].
	(anObject isKindOf: ScaledDecimal) ifTrue: [^self writeScaledDecimal: anObject].
	(anObject isKindOf: AbstractFraction) ifTrue: [^self writeFraction: anObject].
	(anObject isKindOf: Number) ifTrue: [^self writeFloat: anObject asFloat].
	(anObject isKindOf: Utf8) ifTrue: [^self writeUtf8: anObject].
	(anObject isKindOf: Utf16) ifTrue: [^self writeString: anObject].
	(anObject isKindOf: ByteArray) ifTrue: [^self writeBytes: anObject].
	(anObject isKindOf: CharacterCollection) ifTrue: [^self writeString: anObject].
	(anObject isKindOf: Character) ifTrue: [^self writeString: anObject asString].
	(anObject isKindOf: DateAndTimeANSI) ifTrue: [^self writeDateAndTime: anObject].
	(anObject respondsTo: #cborEncodeOn:) ifTrue: [^anObject cborEncodeOn: self].
	(anObject isKindOf: AbstractDictionary) ifTrue: [^self writeMap: anObject].
	(anObject isKindOf: SequenceableCollection) ifTrue: [^self writeArray: anObject].
	((anObject isKindOf: Set) or: [anObject isKindOf: IdentitySet])
		ifTrue: [^self writeSet: anObject].
	^CborError signal: 'CBOR cannot encode an instance of ', anObject class name