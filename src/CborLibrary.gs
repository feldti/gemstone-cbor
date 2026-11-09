! ------------------------------------------------------------------
! CBOR (RFC 8949) library for GemStone/S
! Load with Topaz:  input CborLibrary.gs   (then: commit)
! Creates symbol dictionary CborLibrary in the current user's symbol list.
! ------------------------------------------------------------------

set compile_env: 0

! ------------------- Symbol dictionary
run
| symList |
symList := System myUserProfile symbolList.
(symList resolveSymbol: #CborLibrary) isNil
	ifTrue: [symList createDictionaryNamed: #CborLibrary at: symList size + 1].
%

! ------------------- Class definitions
run
Error subclass: 'CborError'
	instVarNames: #()
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
Object subclass: 'CborTag'
	instVarNames: #( tag value )
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
Object subclass: 'CborSimpleValue'
	instVarNames: #( value )
	classVars: #( Undefined )
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
Object subclass: 'CborEncoder'
	instVarNames: #( stream canonical shortestFloats depth maxDepth )
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
Object subclass: 'CborDecoder'
	instVarNames: #( stream tagDecoders mapClass unicodeStrings rejectDuplicateKeys depth maxDepth )
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
Object subclass: 'Cbor'
	instVarNames: #()
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
CborEncoder subclass: 'CborTypedEncoder'
	instVarNames: #( registry )
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
Object subclass: 'CborTypeMapping'
	instVarNames: #( typeClass tag typeName encodeBlock decodeBlock )
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
Object subclass: 'CborTypeRegistry'
	instVarNames: #( byClass byTag byName )
	classVars: #( Default )
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
Object subclass: 'CborTestPoint'
	instVarNames: #( x y )
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
TestCase subclass: 'CborTest'
	instVarNames: #()
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
TestCase subclass: 'CborTypeRegistryTest'
	instVarNames: #()
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
Object subclass: 'CborTestAddress'
	instVarNames: #( street city zip )
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
Object subclass: 'CborTestCustomer'
	instVarNames: #( name id addresses createdAt )
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
TestCase subclass: 'CborVectorTest'
	instVarNames: #()
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

! ------------------- CborTag
removeallmethods CborTag
removeallclassmethods CborTag

category: 'instance creation'
classmethod: CborTag
tag: anInteger value: anObject
	"Answer a tagged data item (CBOR major type 6)."

	^self new setTag: anInteger value: anObject
%

category: 'private'
method: CborTag
setTag: anInteger value: anObject
	((anInteger isKindOf: Integer) and: [anInteger >= 0 and: [anInteger < 18446744073709551616]])
		ifFalse: [^CborError signal: 'CBOR tag number must be an unsigned 64-bit integer'].
	tag := anInteger.
	value := anObject
%

category: 'accessing'
method: CborTag
tag
	^tag
%

category: 'accessing'
method: CborTag
value
	^value
%

category: 'comparing'
method: CborTag
= anObject
	self == anObject ifTrue: [^true].
	^(anObject isKindOf: CborTag)
		and: [tag = anObject tag and: [value = anObject value]]
%

category: 'comparing'
method: CborTag
hash
	^tag hash bitXor: value hash
%

category: 'printing'
method: CborTag
printOn: aStream
	aStream print: tag; nextPut: $(; print: value; nextPut: $)
%

category: 'cbor'
method: CborTag
cborEncodeOn: aCborEncoder
	aCborEncoder writeTag: tag.
	aCborEncoder encode: value
%

! ------------------- CborSimpleValue
removeallmethods CborSimpleValue
removeallclassmethods CborSimpleValue

category: 'instance creation'
classmethod: CborSimpleValue
value: anInteger
	"Answer a CBOR simple value (major type 7). Values 20..23 have
	 predefined meanings (false, true, null, undefined) and 24..31 are
	 reserved, so only 0..19 and 32..255 may be created here.
	 Use #undefined for simple value 23."

	((anInteger isKindOf: Integer) and: [(anInteger between: 0 and: 19) or: [anInteger between: 32 and: 255]])
		ifFalse: [^CborError signal: 'invalid CBOR simple value: ', anInteger printString].
	^self basicNew setValue: anInteger
%

category: 'instance creation'
classmethod: CborSimpleValue
undefined
	"Answer the CBOR 'undefined' value (simple value 23)."

	Undefined isNil ifTrue: [Undefined := self basicNew setValue: 23].
	^Undefined
%

category: 'instance creation'
classmethod: CborSimpleValue
new
	^self shouldNotImplement: #new
%

category: 'private'
method: CborSimpleValue
setValue: anInteger
	value := anInteger
%

category: 'accessing'
method: CborSimpleValue
value
	^value
%

category: 'testing'
method: CborSimpleValue
isUndefined
	^value = 23
%

category: 'comparing'
method: CborSimpleValue
= anObject
	^(anObject isKindOf: CborSimpleValue) and: [value = anObject value]
%

category: 'comparing'
method: CborSimpleValue
hash
	^value hash
%

category: 'printing'
method: CborSimpleValue
printOn: aStream
	self isUndefined ifTrue: [^aStream nextPutAll: 'undefined'].
	aStream nextPutAll: 'simple('; print: value; nextPut: $)
%

category: 'cbor'
method: CborSimpleValue
cborEncodeOn: aCborEncoder
	aCborEncoder writeSimple: value
%

! ------------------- CborEncoder
removeallmethods CborEncoder
removeallclassmethods CborEncoder

category: 'instance creation'
classmethod: CborEncoder
new
	"Answer an encoder writing into a fresh ByteArray."

	^self on: (WriteStream on: ByteArray new)
%

category: 'instance creation'
classmethod: CborEncoder
on: aBinaryWriteStream
	"Answer an encoder writing bytes (SmallIntegers 0..255) to aBinaryWriteStream."

	^self basicNew initialize setStream: aBinaryWriteStream
%

category: 'initialization'
method: CborEncoder
initialize
	"maxDepth is kept well below the GemStone execution stack limit;
	 each nesting level costs a few stack frames."

	canonical := false.
	shortestFloats := true.
	depth := 0.
	maxDepth := 256
%

category: 'private'
method: CborEncoder
setStream: aStream
	stream := aStream
%

category: 'accessing'
method: CborEncoder
stream
	^stream
%

category: 'accessing'
method: CborEncoder
contents
	"Answer the bytes written so far (only meaningful for collection-backed streams)."

	^stream contents
%

category: 'options'
method: CborEncoder
canonical
	^canonical
%

category: 'options'
method: CborEncoder
canonical: aBoolean
	"When true, map keys are sorted by the bytewise lexicographic order of their
	 encodings (RFC 8949, 4.2.1 Core Deterministic Encoding). Floats always use
	 the shortest exact form in canonical mode."

	canonical := aBoolean
%

category: 'options'
method: CborEncoder
shortestFloats
	^shortestFloats
%

category: 'options'
method: CborEncoder
shortestFloats: aBoolean
	"When true (default), floats are written as half, single or double precision,
	 whichever is the shortest that represents the value exactly.
	 When false, floats are always written as 64-bit doubles."

	shortestFloats := aBoolean
%

category: 'options'
method: CborEncoder
maxDepth
	^maxDepth
%

category: 'options'
method: CborEncoder
maxDepth: anInteger
	"Maximum nesting of arrays, maps and tags. Guards against cyclic structures."

	maxDepth := anInteger
%

category: 'encoding'
method: CborEncoder
encode: anObject
	"Write anObject as one CBOR data item. Answer the receiver.

	 Mapping:
	   nil / true / false        -> null / true / false
	   Integer                   -> major type 0/1, or bignum tag 2/3 beyond 64 bits
	   Float (BinaryFloat)       -> major type 7 float (shortest exact by default)
	   ScaledDecimal             -> tag 4 decimal fraction
	   Fraction                  -> tag 30 rational number
	   other Number              -> converted with #asFloat
	   String, Symbol, Unicode*,
	   Utf8, Utf16, Character    -> major type 3 text string (UTF-8)
	   ByteArray                 -> major type 2 byte string
	   DateAndTime               -> tag 1 epoch-based date/time
	   objects understanding #cborEncodeOn: -> delegate (CborTag, CborSimpleValue, ...)
	   AbstractDictionary        -> major type 5 map
	   SequenceableCollection    -> major type 4 array
	   Set, IdentitySet          -> tag 258 + array"

	depth >= maxDepth
		ifTrue: [^CborError signal: 'CBOR maximum nesting depth exceeded (cyclic structure?)'].
	depth := depth + 1.
	self encodeObject: anObject.
	depth := depth - 1
%

category: 'private'
method: CborEncoder
encodeObject: anObject
	anObject == nil ifTrue: [^self writeNull].
	anObject == true ifTrue: [^self writeTrue].
	anObject == false ifTrue: [^self writeFalse].
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
%

category: 'writing - low level'
method: CborEncoder
writeHead: majorType value: anInteger
	"Write the initial byte(s) of a data item with the shortest argument encoding."

	| base |
	base := majorType bitShift: 5.
	anInteger < 0 ifTrue: [^CborError signal: 'CBOR head argument must not be negative'].
	anInteger < 24 ifTrue: [^stream nextPut: base + anInteger].
	anInteger < 256 ifTrue: [stream nextPut: base + 24; nextPut: anInteger. ^self].
	anInteger < 65536 ifTrue: [stream nextPut: base + 25. ^self writeUnsigned: anInteger bytes: 2].
	anInteger < 4294967296 ifTrue: [stream nextPut: base + 26. ^self writeUnsigned: anInteger bytes: 4].
	anInteger < 18446744073709551616 ifTrue: [stream nextPut: base + 27. ^self writeUnsigned: anInteger bytes: 8].
	^CborError signal: 'CBOR head argument exceeds 64 bits'
%

category: 'private'
method: CborEncoder
writeUnsigned: anInteger bytes: byteCount
	"Write anInteger big-endian into byteCount bytes."

	byteCount - 1 to: 0 by: -1 do: [:i |
		stream nextPut: ((anInteger bitShift: i * -8) bitAnd: 255)]
%

category: 'private'
method: CborEncoder
bytesOfUnsigned: anInteger
	"Answer the minimal big-endian ByteArray for a non-negative integer."

	| count v bytes |
	count := 0.
	v := anInteger.
	[v > 0] whileTrue: [count := count + 1. v := v bitShift: -8].
	bytes := ByteArray new: count.
	v := anInteger.
	count to: 1 by: -1 do: [:i |
		bytes at: i put: (v bitAnd: 255).
		v := v bitShift: -8].
	^bytes
%

category: 'writing - low level'
method: CborEncoder
writeTag: anInteger
	"Write a tag head (major type 6). The tagged item must be written next."

	self writeHead: 6 value: anInteger
%

category: 'writing - low level'
method: CborEncoder
writeArrayHeader: size
	"Write a definite-length array head; size items must follow."

	self writeHead: 4 value: size
%

category: 'writing - low level'
method: CborEncoder
writeMapHeader: size
	"Write a definite-length map head; size key/value pairs must follow."

	self writeHead: 5 value: size
%

category: 'writing - low level'
method: CborEncoder
writeIndefiniteArrayStart
	"Start an indefinite-length array; terminate with #writeBreak."

	stream nextPut: 16r9F
%

category: 'writing - low level'
method: CborEncoder
writeIndefiniteMapStart
	"Start an indefinite-length map; terminate with #writeBreak."

	stream nextPut: 16rBF
%

category: 'writing - low level'
method: CborEncoder
writeIndefiniteBytesStart
	"Start an indefinite-length byte string; write definite byte string chunks, then #writeBreak."

	stream nextPut: 16r5F
%

category: 'writing - low level'
method: CborEncoder
writeIndefiniteTextStart
	"Start an indefinite-length text string; write definite text string chunks, then #writeBreak."

	stream nextPut: 16r7F
%

category: 'writing - low level'
method: CborEncoder
writeBreak
	stream nextPut: 16rFF
%

category: 'writing - low level'
method: CborEncoder
writeNull
	stream nextPut: 16rF6
%

category: 'writing - low level'
method: CborEncoder
writeTrue
	stream nextPut: 16rF5
%

category: 'writing - low level'
method: CborEncoder
writeFalse
	stream nextPut: 16rF4
%

category: 'writing - low level'
method: CborEncoder
writeUndefined
	stream nextPut: 16rF7
%

category: 'writing - low level'
method: CborEncoder
writeSimple: anInteger
	"Write simple value anInteger (0..255, excluding the reserved range 24..31)."

	(anInteger between: 0 and: 23) ifTrue: [^self writeHead: 7 value: anInteger].
	(anInteger between: 32 and: 255) ifTrue: [stream nextPut: 16rF8; nextPut: anInteger. ^self].
	^CborError signal: 'invalid CBOR simple value: ', anInteger printString
%

category: 'writing - low level'
method: CborEncoder
writeInteger: anInteger
	"Write an integer of any size. Values outside the 64-bit range use
	 bignum tags 2 (positive) and 3 (negative)."

	| n |
	anInteger >= 0
		ifTrue: [
			anInteger < 18446744073709551616 ifTrue: [^self writeHead: 0 value: anInteger].
			self writeTag: 2.
			^self writeBytes: (self bytesOfUnsigned: anInteger)].
	n := -1 - anInteger.
	n < 18446744073709551616 ifTrue: [^self writeHead: 1 value: n].
	self writeTag: 3.
	self writeBytes: (self bytesOfUnsigned: n)
%

category: 'writing - low level'
method: CborEncoder
writeBytes: aByteArray
	"Write a definite-length byte string (major type 2)."

	self writeHead: 2 value: aByteArray size.
	stream nextPutAll: aByteArray
%

category: 'writing - low level'
method: CborEncoder
writeString: aCharacterCollection
	"Write a text string (major type 3), encoding the characters as UTF-8."

	self writeUtf8: aCharacterCollection encodeAsUTF8
%

category: 'writing - low level'
method: CborEncoder
writeUtf8: aUtf8
	"Write already UTF-8 encoded bytes as a text string (major type 3)."

	| bytes |
	bytes := aUtf8 asByteArray.
	self writeHead: 3 value: bytes size.
	stream nextPutAll: bytes
%

category: 'writing - low level'
method: CborEncoder
writeDouble: aFloat
	"Write aFloat as a 64-bit IEEE 754 double."

	| bytes |
	bytes := ByteArray new: 8.
	bytes doubleAt: 1 put: aFloat asFloat.
	stream nextPut: 16rFB; nextPutAll: bytes
%

category: 'writing - low level'
method: CborEncoder
writeFloat: aFloat
	"Write aFloat. With shortestFloats (default) or canonical mode the shortest of
	 half, single and double precision that represents the value exactly is used;
	 NaN is written as the canonical half-precision quiet NaN (f9 7e00)."

	| bytes bits sign exp mant e full shift |
	(shortestFloats or: [canonical]) ifFalse: [^self writeDouble: aFloat].
	bytes := ByteArray new: 8.
	bytes doubleAt: 1 put: aFloat asFloat.
	bits := 0.
	bytes do: [:b | bits := (bits bitShift: 8) + b].
	sign := bits bitShift: -63.
	exp := (bits bitShift: -52) bitAnd: 16r7FF.
	mant := bits bitAnd: 16rFFFFFFFFFFFFF.
	exp = 16r7FF ifTrue: [
		mant = 0 ifTrue: [^self writeHalfBits: (sign bitShift: 15) + 16r7C00].
		^self writeHalfBits: 16r7E00].
	exp = 0 ifTrue: [
		mant = 0 ifTrue: [^self writeHalfBits: (sign bitShift: 15)].
		"double subnormals are not representable in a shorter format"
		stream nextPut: 16rFB; nextPutAll: bytes.
		^self].
	e := exp - 1023.
	full := mant + 16r10000000000000.
	"half precision: normal"
	((e between: -14 and: 15) and: [(mant bitAnd: 16r3FFFFFFFFFF) = 0])
		ifTrue: [^self writeHalfBits: (sign bitShift: 15) + ((e + 15) bitShift: 10) + (mant bitShift: -42)].
	"half precision: subnormal"
	(e between: -24 and: -15) ifTrue: [
		shift := 28 - e.
		(full bitAnd: (1 bitShift: shift) - 1) = 0
			ifTrue: [^self writeHalfBits: (sign bitShift: 15) + (full bitShift: shift negated)]].
	"single precision: normal"
	((e between: -126 and: 127) and: [(mant bitAnd: 16r1FFFFFFF) = 0])
		ifTrue: [^self writeSingleBits: (sign bitShift: 31) + ((e + 127) bitShift: 23) + (mant bitShift: -29)].
	"single precision: subnormal"
	(e between: -149 and: -127) ifTrue: [
		shift := -97 - e.
		(full bitAnd: (1 bitShift: shift) - 1) = 0
			ifTrue: [^self writeSingleBits: (sign bitShift: 31) + (full bitShift: shift negated)]].
	stream nextPut: 16rFB; nextPutAll: bytes
%

category: 'private'
method: CborEncoder
writeHalfBits: anInteger
	stream nextPut: 16rF9.
	self writeUnsigned: anInteger bytes: 2
%

category: 'private'
method: CborEncoder
writeSingleBits: anInteger
	stream nextPut: 16rFA.
	self writeUnsigned: anInteger bytes: 4
%

category: 'writing - objects'
method: CborEncoder
writeScaledDecimal: aScaledDecimal
	"Tag 4 decimal fraction: [exponent, mantissa] with value = mantissa * 10^exponent."

	self writeTag: 4.
	self writeArrayHeader: 2.
	self writeInteger: aScaledDecimal scale negated.
	self writeInteger: aScaledDecimal mantissa
%

category: 'writing - objects'
method: CborEncoder
writeFraction: aFraction
	"Tag 30 rational number: [numerator, denominator]."

	self writeTag: 30.
	self writeArrayHeader: 2.
	self writeInteger: aFraction numerator.
	self writeInteger: aFraction denominator
%

category: 'writing - objects'
method: CborEncoder
writeDateAndTime: aDateAndTime
	"Tag 1 epoch-based date/time (seconds since 1970-01-01T00:00Z)."

	| seconds |
	seconds := aDateAndTime asPosixSeconds.
	self writeTag: 1.
	seconds truncated = seconds
		ifTrue: [self writeInteger: seconds truncated]
		ifFalse: [self writeFloat: seconds asFloat]
%

category: 'writing - objects'
method: CborEncoder
writeArray: aSequenceableCollection
	self writeArrayHeader: aSequenceableCollection size.
	aSequenceableCollection do: [:each | self encode: each]
%

category: 'writing - objects'
method: CborEncoder
writeSet: aCollection
	"Tag 258 (mathematical finite set) wrapping an array."

	| elements |
	self writeTag: 258.
	canonical
		ifFalse: [^self writeArray: aCollection asArray].
	elements := aCollection asArray collect: [:each | self encodedBytesOf: each].
	elements := elements asSortedCollection: [:a :b | self bytes: a lessOrEqual: b].
	self writeArrayHeader: elements size.
	elements do: [:each | stream nextPutAll: each]
%

category: 'writing - objects'
method: CborEncoder
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
%

category: 'private'
method: CborEncoder
encodedBytesOf: anObject
	"Encode anObject with the receiver's options into a separate ByteArray."

	| sub |
	sub := self newNestedEncoder.
	sub encode: anObject.
	^sub contents
%

category: 'private'
method: CborEncoder
newNestedEncoder
	"Answer a fresh encoder with the receiver's options, used to encode map keys
	 separately for canonical ordering. Subclasses add their own state."

	^self class new
		canonical: canonical;
		shortestFloats: shortestFloats;
		maxDepth: maxDepth - depth;
		yourself
%

category: 'private'
method: CborEncoder
bytes: a lessOrEqual: b
	"Bytewise lexicographic comparison (RFC 8949, 4.2.1)."

	1 to: (a size min: b size) do: [:i |
		(a at: i) = (b at: i) ifFalse: [^(a at: i) < (b at: i)]].
	^a size <= b size
%

! ------------------- CborDecoder
removeallmethods CborDecoder
removeallclassmethods CborDecoder

category: 'instance creation'
classmethod: CborDecoder
on: aBinaryReadStream
	"Answer a decoder reading bytes (SmallIntegers 0..255) from aBinaryReadStream."

	^self basicNew initialize setStream: aBinaryReadStream
%

category: 'instance creation'
classmethod: CborDecoder
onBytes: aByteArray
	^self on: (ReadStream on: aByteArray asByteArray)
%

category: 'initialization'
method: CborDecoder
initialize
	"maxDepth is kept well below the GemStone execution stack limit;
	 each nesting level costs a few stack frames."

	tagDecoders := Dictionary new.
	mapClass := Dictionary.
	unicodeStrings := false.
	rejectDuplicateKeys := false.
	depth := 0.
	maxDepth := 256
%

category: 'private'
method: CborDecoder
setStream: aStream
	stream := aStream
%

category: 'accessing'
method: CborDecoder
stream
	^stream
%

category: 'testing'
method: CborDecoder
atEnd
	^stream atEnd
%

category: 'options'
method: CborDecoder
mapClass: aDictionaryClass
	"Class used for decoded maps (default Dictionary). Must understand #new, #at:put: and #includesKey:."

	mapClass := aDictionaryClass
%

category: 'options'
method: CborDecoder
unicodeStrings: aBoolean
	"When true, text strings decode to Unicode7/Unicode16/Unicode32;
	 when false (default) to String/DoubleByteString/QuadByteString."

	unicodeStrings := aBoolean
%

category: 'options'
method: CborDecoder
rejectDuplicateKeys: aBoolean
	"When true, a map containing the same key twice signals a CborError.
	 When false (default), the last value wins."

	rejectDuplicateKeys := aBoolean
%

category: 'options'
method: CborDecoder
maxDepth: anInteger
	"Maximum nesting of arrays, maps and tags accepted from the input."

	maxDepth := anInteger
%

category: 'options'
method: CborDecoder
tagDecoders
	^tagDecoders
%

category: 'options'
method: CborDecoder
onTag: tagNumber do: aOneArgBlock
	"Register a converter for tagNumber. aOneArgBlock receives the decoded
	 content of the tag and answers the object to use instead. Registered
	 converters take precedence over the built-in tag handling."

	tagDecoders at: tagNumber put: aOneArgBlock
%

category: 'decoding'
method: CborDecoder
decode
	"Read and answer the next complete CBOR data item."

	| item |
	item := self decodeItemOrBreak.
	item == self ifTrue: [^self signalError: 'unexpected break code'].
	^item
%

category: 'decoding'
method: CborDecoder
decodeAll
	"Decode a CBOR sequence (RFC 8742): answer an Array of all items until end of input."

	| items |
	items := OrderedCollection new.
	[self atEnd] whileFalse: [items add: self decode].
	^items asArray
%

category: 'private'
method: CborDecoder
signalError: aString
	^CborError signal: 'CBOR decode error: ', aString
%

category: 'private - reading'
method: CborDecoder
readByte
	stream atEnd ifTrue: [^self signalError: 'unexpected end of input'].
	^stream next
%

category: 'private - reading'
method: CborDecoder
readUnsigned: byteCount
	| v |
	v := 0.
	byteCount timesRepeat: [v := (v bitShift: 8) + self readByte].
	^v
%

category: 'private - reading'
method: CborDecoder
readBytes: count
	"Answer the next count bytes as a ByteArray. Large counts are read in chunks so
	 a bogus length in malformed input fails on end of input, not on allocation."

	| result chunk ws remaining |
	count = 0 ifTrue: [^ByteArray new].
	count <= 65536 ifTrue: [^self readChunk: count].
	ws := WriteStream on: (ByteArray new).
	remaining := count.
	[remaining > 0] whileTrue: [
		chunk := self readChunk: (remaining min: 65536).
		ws nextPutAll: chunk.
		remaining := remaining - chunk size].
	result := ws contents.
	^result
%

category: 'private - reading'
method: CborDecoder
readChunk: count
	| bytes |
	bytes := [stream next: count] on: Error do: [:ex | ex return: nil].
	(bytes isNil or: [bytes size < count])
		ifTrue: [^self signalError: 'unexpected end of input'].
	^bytes asByteArray
%

category: 'private - reading'
method: CborDecoder
readArgument: info
	"Answer the argument encoded by additional information info (0..27)."

	info < 24 ifTrue: [^info].
	info = 24 ifTrue: [^self readByte].
	info = 25 ifTrue: [^self readUnsigned: 2].
	info = 26 ifTrue: [^self readUnsigned: 4].
	info = 27 ifTrue: [^self readUnsigned: 8].
	^self signalError: 'reserved additional information value ', info printString
%

category: 'private - decoding'
method: CborDecoder
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
%

category: 'private - decoding'
method: CborDecoder
decodeNested
	"Decode an item that is part of an enclosing structure (break not allowed)."

	| item |
	item := self decodeItemOrBreak.
	item == self ifTrue: [^self signalError: 'unexpected break code'].
	^item
%

category: 'private - decoding'
method: CborDecoder
enter
	depth := depth + 1.
	depth > maxDepth ifTrue: [^self signalError: 'maximum nesting depth exceeded']
%

category: 'private - decoding'
method: CborDecoder
leave
	depth := depth - 1
%

category: 'private - decoding'
method: CborDecoder
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
%

category: 'private - decoding'
method: CborDecoder
decodeMap: size
	| map |
	self enter.
	map := mapClass new.
	size timesRepeat: [self readEntryInto: map key: self decodeNested].
	self leave.
	^map
%

category: 'private - decoding'
method: CborDecoder
readEntryInto: aMap key: key
	| value |
	value := self decodeNested.
	(rejectDuplicateKeys and: [aMap includesKey: key])
		ifTrue: [^self signalError: 'duplicate map key ', key printString].
	aMap at: key put: value
%

category: 'private - decoding'
method: CborDecoder
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
%

category: 'private - decoding'
method: CborDecoder
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
%

category: 'private - decoding'
method: CborDecoder
stringFromUtf8: aByteArray
	| result |
	aByteArray isEmpty ifTrue: [^unicodeStrings ifTrue: [Unicode7 new] ifFalse: [String new]].
	result := [unicodeStrings
			ifTrue: [aByteArray decodeFromUTF8ToUnicode]
			ifFalse: [aByteArray decodeFromUTF8ToString]]
		on: Error
		do: [:ex | ex return: nil].
	result isNil ifTrue: [^self signalError: 'invalid UTF-8 in text string'].
	^result
%

category: 'private - decoding'
method: CborDecoder
decodeSimpleOrFloat: info
	| v |
	info < 20 ifTrue: [^CborSimpleValue value: info].
	info = 20 ifTrue: [^false].
	info = 21 ifTrue: [^true].
	info = 22 ifTrue: [^nil].
	info = 23 ifTrue: [^CborSimpleValue undefined].
	info = 24 ifTrue: [
		v := self readByte.
		v < 32 ifTrue: [^self signalError: 'invalid two-byte encoding of simple value ', v printString].
		^CborSimpleValue value: v].
	info = 25 ifTrue: [^self floatFromHalfBits: (self readUnsigned: 2)].
	info = 26 ifTrue: [^(self readBytes: 4) floatAt: 1].
	info = 27 ifTrue: [^(self readBytes: 8) doubleAt: 1].
	info = 31 ifTrue: [^self].
	^self signalError: 'reserved additional information value ', info printString
%

category: 'private - decoding'
method: CborDecoder
floatFromHalfBits: bits
	"Convert IEEE 754 half precision bits to a Float. Infinities and NaNs are built
	 from the equivalent double precision bit pattern (the GemStone kernel has no
	 Float infinity / Float nan)."

	| negative exp mant value |
	negative := (bits bitShift: -15) = 1.
	exp := (bits bitShift: -10) bitAnd: 31.
	mant := bits bitAnd: 1023.
	exp = 31 ifTrue: [
		^self floatFromDoubleBits: ((bits bitShift: -15) bitShift: 63)
			+ (16r7FF bitShift: 52) + (mant bitShift: 42)].
	value := exp = 0
		ifTrue: [(mant / 16777216) asFloat]
		ifFalse: [((mant + 1024) * (2 raisedTo: exp - 25)) asFloat].
	^negative ifTrue: [value negated] ifFalse: [value]
%

category: 'private - decoding'
method: CborDecoder
floatFromDoubleBits: anInteger
	"Answer the Float with the given IEEE 754 double precision bit pattern."

	| bytes v |
	bytes := ByteArray new: 8.
	v := anInteger.
	8 to: 1 by: -1 do: [:i |
		bytes at: i put: (v bitAnd: 255).
		v := v bitShift: -8].
	^bytes doubleAt: 1
%

category: 'private - decoding'
method: CborDecoder
decodeTag: tagNumber
	| value handler |
	self enter.
	value := self decodeNested.
	self leave.
	handler := tagDecoders at: tagNumber ifAbsent: [nil].
	handler notNil ifTrue: [^handler value: value].
	^self decodeStandardTag: tagNumber value: value
%

category: 'private - decoding'
method: CborDecoder
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
%

category: 'private - decoding'
method: CborDecoder
decimalFractionFrom: value
	"Tag 4: [exponent, mantissa] -> ScaledDecimal (exponent <= 0) or Integer."

	| exponent mantissa |
	((value isKindOf: Array) and: [value size = 2
		and: [(value first isKindOf: Integer) and: [value last isKindOf: Integer]]])
		ifFalse: [^self signalError: 'tag 4 requires [integer, integer]'].
	exponent := value first.
	mantissa := value last.
	exponent >= 0 ifTrue: [^mantissa * (10 raisedTo: exponent)].
	^ScaledDecimal mantissa: mantissa scale: exponent negated
%

category: 'private - decoding'
method: CborDecoder
dateTimeFromString: value
	"Tag 0: RFC 3339 date/time string -> DateAndTime with the offset given in the string.
	 Answers the CborTag itself if the string is not valid RFC 3339."

	| parsed |
	(value isKindOf: CharacterCollection) ifFalse: [^self signalError: 'tag 0 requires a text string'].
	parsed := self parseRfc3339: value.
	parsed isNil ifTrue: [^CborTag tag: 0 value: value].
	^DateAndTime posixSeconds: parsed first offset: (Duration seconds: parsed last)
%

category: 'private - decoding'
method: CborDecoder
parseRfc3339: aString
	"Parse YYYY-MM-DDTHH:MM:SS[.fraction](Z|+HH:MM|-HH:MM).
	 Answer {posixSeconds. offsetSeconds} or nil if aString is malformed."

	| s year month day hour minute second pos fracStart fraction offset offHours offMinutes sign days |
	s := aString asString.
	s size < 20 ifTrue: [^nil].
	((s at: 5) = $- and: [(s at: 8) = $- and: [(s at: 14) = $: and: [(s at: 17) = $:]]]) ifFalse: [^nil].
	('Tt ' includes: (s at: 11)) ifFalse: [^nil].
	year := self digitsIn: s from: 1 to: 4.
	month := self digitsIn: s from: 6 to: 7.
	day := self digitsIn: s from: 9 to: 10.
	hour := self digitsIn: s from: 12 to: 13.
	minute := self digitsIn: s from: 15 to: 16.
	second := self digitsIn: s from: 18 to: 19.
	(year isNil or: [month isNil or: [day isNil or: [hour isNil or: [minute isNil or: [second isNil]]]]]) ifTrue: [^nil].
	((month between: 1 and: 12) and: [(day between: 1 and: 31) and: [hour < 24 and: [minute < 60 and: [second < 61]]]]) ifFalse: [^nil].
	pos := 20.
	fraction := 0.
	(s at: pos) = $. ifTrue: [
		fracStart := pos + 1.
		pos := fracStart.
		[pos <= s size and: [(s at: pos) isDigit]] whileTrue: [pos := pos + 1].
		pos = fracStart ifTrue: [^nil].
		fraction := (self digitsIn: s from: fracStart to: pos - 1) / (10 raisedTo: pos - fracStart)].
	pos > s size ifTrue: [^nil].
	('Zz' includes: (s at: pos))
		ifTrue: [
			pos = s size ifFalse: [^nil].
			offset := 0]
		ifFalse: [
			(s size = (pos + 5) and: [('+-' includes: (s at: pos)) and: [(s at: pos + 3) = $:]]) ifFalse: [^nil].
			sign := (s at: pos) = $- ifTrue: [-1] ifFalse: [1].
			offHours := self digitsIn: s from: pos + 1 to: pos + 2.
			offMinutes := self digitsIn: s from: pos + 4 to: pos + 5.
			(offHours isNil or: [offMinutes isNil]) ifTrue: [^nil].
			offset := sign * ((offHours * 3600) + (offMinutes * 60))].
	days := self daysFromCivilYear: year month: month day: day.
	^Array
		with: (days * 86400) + (hour * 3600) + (minute * 60) + second - offset
			+ (fraction = 0 ifTrue: [0] ifFalse: [fraction asFloat])
		with: offset
%

category: 'private - decoding'
method: CborDecoder
digitsIn: aString from: start to: stop
	"Answer the decimal value of aString from start to stop, or nil if not all digits."

	| v |
	v := 0.
	start to: stop do: [:i |
		(aString at: i) isDigit ifFalse: [^nil].
		v := (v * 10) + (aString at: i) digitValue].
	^v
%

category: 'private - decoding'
method: CborDecoder
daysFromCivilYear: y month: m day: d
	"Days since 1970-01-01 in the proleptic Gregorian calendar (H. Hinnant's algorithm)."

	| yy era yoe mp doy doe |
	yy := m <= 2 ifTrue: [y - 1] ifFalse: [y].
	era := yy // 400.
	yoe := yy - (era * 400).
	mp := (m + 9) \\ 12.
	doy := ((153 * mp) + 2) // 5 + d - 1.
	doe := (yoe * 365) + (yoe // 4) - (yoe // 100) + doy.
	^(era * 146097) + doe - 719468
%

! ------------------- Cbor (facade)
removeallmethods Cbor
removeallclassmethods Cbor

category: 'encoding'
classmethod: Cbor
encode: anObject
	"Answer a ByteArray with the CBOR encoding of anObject."

	^(CborEncoder new encode: anObject) contents
%

category: 'encoding'
classmethod: Cbor
encodeCanonical: anObject
	"Answer the deterministic CBOR encoding of anObject (RFC 8949, 4.2.1):
	 shortest integer and float forms, map keys sorted bytewise."

	^(CborEncoder new canonical: true; encode: anObject) contents
%

category: 'encoding'
classmethod: Cbor
encode: anObject on: aBinaryWriteStream
	"Write the CBOR encoding of anObject to aBinaryWriteStream."

	(CborEncoder on: aBinaryWriteStream) encode: anObject
%

category: 'decoding'
classmethod: Cbor
decode: aByteArray
	"Decode exactly one CBOR data item from aByteArray. Signals CborError on
	 malformed input or trailing bytes."

	| decoder result |
	decoder := CborDecoder onBytes: aByteArray.
	result := decoder decode.
	decoder atEnd ifFalse: [^CborError signal: 'CBOR decode error: trailing bytes after data item'].
	^result
%

category: 'decoding'
classmethod: Cbor
decodeSequence: aByteArray
	"Decode a CBOR sequence (RFC 8742) and answer an Array of its items."

	^(CborDecoder onBytes: aByteArray) decodeAll
%

category: 'decoding'
classmethod: Cbor
decodeFrom: aBinaryReadStream
	"Decode the next CBOR data item from aBinaryReadStream."

	^(CborDecoder on: aBinaryReadStream) decode
%

category: 'converting'
classmethod: Cbor
bytesFromHex: aString
	"Answer a ByteArray from a hex string; whitespace is ignored. Handy for tests and debugging."

	| digits bytes |
	digits := aString reject: [:c | c isSeparator].
	digits size odd ifTrue: [^CborError signal: 'odd number of hex digits'].
	bytes := ByteArray new: digits size // 2.
	1 to: bytes size do: [:i |
		bytes at: i put: ((self hexDigitValue: (digits at: i * 2 - 1)) * 16) + (self hexDigitValue: (digits at: i * 2))].
	^bytes
%

category: 'converting'
classmethod: Cbor
hexDigitValue: aCharacter
	"Value 0..15 of a hex digit (either case). The kernel's Character>>digitValue
	 answers nil for letters, so this does not rely on it."

	| i |
	i := '0123456789abcdefABCDEF' indexOf: aCharacter.
	i = 0 ifTrue: [^CborError signal: 'invalid hex digit: ', aCharacter printString].
	^i <= 16 ifTrue: [i - 1] ifFalse: [i - 7]
%

category: 'converting'
classmethod: Cbor
hexFromBytes: aByteArray
	"Answer a lowercase hex string for aByteArray."

	| ws |
	ws := WriteStream on: String new.
	aByteArray do: [:b |
		ws nextPut: ('0123456789abcdef' at: (b bitShift: -4) + 1);
			nextPut: ('0123456789abcdef' at: (b bitAnd: 15) + 1)].
	^ws contents
%

! ------------------- CborTest
removeallmethods CborTest
removeallclassmethods CborTest

category: 'helpers'
method: CborTest
hex: aString
	^Cbor bytesFromHex: aString
%

category: 'helpers'
method: CborTest
assertEncoding: anObject is: hexString
	self assert: (Cbor hexFromBytes: (Cbor encodeCanonical: anObject)) equals: hexString
%

category: 'helpers'
method: CborTest
decodeHex: hexString
	^Cbor decode: (self hex: hexString)
%

category: 'helpers'
method: CborTest
assertRoundTrip: anObject hex: hexString
	"Encoding anObject gives hexString, and decoding hexString gives an object equal to anObject."

	self assertEncoding: anObject is: hexString.
	self assert: (self decodeHex: hexString) equals: anObject
%

category: 'helpers'
method: CborTest
assertDecodeError: hexString
	self should: [self decodeHex: hexString] raise: CborError
%

category: 'helpers'
method: CborTest
double: hexString
	"Answer the Float with the given 64-bit IEEE 754 pattern (big-endian hex)."

	^(Cbor bytesFromHex: hexString) doubleAt: 1
%

category: 'helpers'
method: CborTest
utf8Of: aString
	^aString encodeAsUTF8 asByteArray
%

category: 'tests - integers'
method: CborTest
testUnsignedIntegers
	self assertRoundTrip: 0 hex: '00'.
	self assertRoundTrip: 1 hex: '01'.
	self assertRoundTrip: 10 hex: '0a'.
	self assertRoundTrip: 23 hex: '17'.
	self assertRoundTrip: 24 hex: '1818'.
	self assertRoundTrip: 25 hex: '1819'.
	self assertRoundTrip: 100 hex: '1864'.
	self assertRoundTrip: 255 hex: '18ff'.
	self assertRoundTrip: 256 hex: '190100'.
	self assertRoundTrip: 1000 hex: '1903e8'.
	self assertRoundTrip: 65535 hex: '19ffff'.
	self assertRoundTrip: 65536 hex: '1a00010000'.
	self assertRoundTrip: 1000000 hex: '1a000f4240'.
	self assertRoundTrip: 4294967295 hex: '1affffffff'.
	self assertRoundTrip: 4294967296 hex: '1b0000000100000000'.
	self assertRoundTrip: 1000000000000 hex: '1b000000e8d4a51000'.
	self assertRoundTrip: 18446744073709551615 hex: '1bffffffffffffffff'
%

category: 'tests - integers'
method: CborTest
testNegativeIntegers
	self assertRoundTrip: -1 hex: '20'.
	self assertRoundTrip: -10 hex: '29'.
	self assertRoundTrip: -24 hex: '37'.
	self assertRoundTrip: -25 hex: '3818'.
	self assertRoundTrip: -100 hex: '3863'.
	self assertRoundTrip: -1000 hex: '3903e7'.
	self assertRoundTrip: -18446744073709551616 hex: '3bffffffffffffffff'
%

category: 'tests - integers'
method: CborTest
testBignums
	| expected |
	self assertRoundTrip: 18446744073709551616 hex: 'c249010000000000000000'.
	self assertRoundTrip: -18446744073709551617 hex: 'c349010000000000000000'.
	"2^200 needs 26 bytes: 01 followed by 25 zero bytes"
	expected := WriteStream on: String new.
	expected nextPutAll: 'c2581a01'.
	25 timesRepeat: [expected nextPutAll: '00'].
	self assertRoundTrip: (2 raisedTo: 200) hex: expected contents.
	self assert: (self decodeHex: 'c240') equals: 0.
	self assert: (self decodeHex: 'c34100') equals: -1
%

category: 'tests - floats'
method: CborTest
testHalfPrecisionFloats
	self assertRoundTrip: 0.0 hex: 'f90000'.
	self assertRoundTrip: 1.0 hex: 'f93c00'.
	self assertRoundTrip: 1.5 hex: 'f93e00'.
	self assertRoundTrip: 65504.0 hex: 'f97bff'.
	self assertRoundTrip: 5.960464477539063e-8 hex: 'f90001'.
	self assertRoundTrip: 0.00006103515625 hex: 'f90400'.
	self assertRoundTrip: -4.0 hex: 'f9c400'
%

category: 'tests - floats'
method: CborTest
testNegativeZero
	| decoded |
	self assertEncoding: -0.0 is: 'f98000'.
	decoded := self decodeHex: 'f98000'.
	self assert: decoded equals: 0.0.
	self assert: (Cbor hexFromBytes: (Cbor encode: decoded)) equals: 'f98000'
%

category: 'tests - floats'
method: CborTest
testSingleAndDoublePrecisionFloats
	self assertRoundTrip: 100000.0 hex: 'fa47c35000'.
	self assertRoundTrip: 3.4028234663852886e38 hex: 'fa7f7fffff'.
	self assertRoundTrip: 1.1 hex: 'fb3ff199999999999a'.
	self assertRoundTrip: 1.0e300 hex: 'fb7e37e43c8800759c'.
	self assertRoundTrip: -4.1 hex: 'fbc010666666666666'.
	self assert: (self decodeHex: 'fa3fc00000') equals: 1.5.
	self assert: (self decodeHex: 'fb3ff8000000000000') equals: 1.5
%

category: 'tests - floats'
method: CborTest
testSpecialFloats
	| infinity negativeInfinity nan |
	infinity := self double: '7ff0000000000000'.
	negativeInfinity := self double: 'fff0000000000000'.
	nan := self double: '7ff8000000000000'.
	self assertRoundTrip: infinity hex: 'f97c00'.
	self assertRoundTrip: negativeInfinity hex: 'f9fc00'.
	self assertEncoding: nan is: 'f97e00'.
	self assert: (self decodeHex: 'f97e00') _isNaN.
	self assert: (self decodeHex: 'fa7fc00000') _isNaN.
	self assert: (self decodeHex: 'fb7ff8000000000000') _isNaN.
	self assert: (self decodeHex: 'fa7f800000') equals: infinity.
	self assert: (self decodeHex: 'fbfff0000000000000') equals: negativeInfinity
%

category: 'tests - floats'
method: CborTest
testDoubleOnlyOption
	| encoder |
	encoder := CborEncoder new shortestFloats: false.
	encoder encode: 1.5.
	self assert: (Cbor hexFromBytes: encoder contents) equals: 'fb3ff8000000000000'
%

category: 'tests - floats'
method: CborTest
testFloatRoundTripRandomValues
	#(0.1 0.2 0.3 1.0e-10 123456.789 -98765.4321 1.0e-310 2.5e-45 1.401298464324817e-45 6.103515625e-5 3.0517578125e-5)
		do: [:f | self assert: (Cbor decode: (Cbor encode: f)) equals: f]
%

category: 'tests - simple'
method: CborTest
testSimpleValues
	self assertRoundTrip: false hex: 'f4'.
	self assertRoundTrip: true hex: 'f5'.
	self assertRoundTrip: nil hex: 'f6'.
	self assertRoundTrip: CborSimpleValue undefined hex: 'f7'.
	self assertRoundTrip: (CborSimpleValue value: 16) hex: 'f0'.
	self assertRoundTrip: (CborSimpleValue value: 255) hex: 'f8ff'.
	self assert: (self decodeHex: 'f7') isUndefined.
	self should: [CborSimpleValue value: 24] raise: CborError.
	self should: [CborSimpleValue value: 21] raise: CborError
%

category: 'tests - strings'
method: CborTest
testByteStrings
	self assertRoundTrip: ByteArray new hex: '40'.
	self assertRoundTrip: #[1 2 3 4] hex: '4401020304'
%

category: 'tests - strings'
method: CborTest
testTextStrings
	self assertRoundTrip: '' hex: '60'.
	self assertRoundTrip: 'a' hex: '6161'.
	self assertRoundTrip: 'IETF' hex: '6449455446'.
	self assertRoundTrip: '"\' hex: '62225c'.
	self assertEncoding: #IETF is: '6449455446'.
	self assertEncoding: $a is: '6161'
%

category: 'tests - strings'
method: CborTest
testUnicodeTextStrings
	| uUmlaut water symbol |
	uUmlaut := (Character codePoint: 16rFC) asString.
	water := (Character codePoint: 16r6C34) asString.
	symbol := (Character codePoint: 16r10151) asString.
	self assertEncoding: uUmlaut is: '62c3bc'.
	self assertEncoding: water is: '63e6b0b4'.
	self assertEncoding: symbol is: '64f0908591'.
	self assert: (self utf8Of: (self decodeHex: '62c3bc')) equals: #[16rC3 16rBC].
	self assert: (self utf8Of: (self decodeHex: '63e6b0b4')) equals: #[16rE6 16rB0 16rB4].
	self assert: (self utf8Of: (self decodeHex: '64f0908591')) equals: #[16rF0 16r90 16r85 16r91].
	self assert: (self decodeHex: '62c3bc') size equals: 1.
	self assert: (self decodeHex: '64f0908591') size equals: 1
%

category: 'tests - strings'
method: CborTest
testUtf8InputIsWrittenAsText
	self assertEncoding: 'IETF' encodeAsUTF8 is: '6449455446'
%

category: 'tests - strings'
method: CborTest
testUnicodeStringsOption
	| decoder result |
	decoder := CborDecoder onBytes: (self hex: '6449455446').
	decoder unicodeStrings: true.
	result := decoder decode.
	self assert: (result isKindOf: Unicode7).
	self assert: (self utf8Of: result) equals: (self utf8Of: 'IETF')
%

category: 'tests - collections'
method: CborTest
testArrays
	self assertRoundTrip: #() hex: '80'.
	self assertRoundTrip: #(1 2 3) hex: '83010203'.
	self assertRoundTrip: {1. #(2 3). #(4 5)} hex: '8301820203820405'.
	self assertRoundTrip: (1 to: 25) asArray hex: '98190102030405060708090a0b0c0d0e0f101112131415161718181819'.
	self assertEncoding: (OrderedCollection with: 1 with: 2) is: '820102'
%

category: 'tests - collections'
method: CborTest
testMaps
	| d decoded |
	self assertRoundTrip: Dictionary new hex: 'a0'.
	d := Dictionary new.
	d at: 1 put: 2; at: 3 put: 4.
	self assertRoundTrip: d hex: 'a201020304'.
	d := Dictionary new.
	d at: 'a' put: 1; at: 'b' put: #(2 3).
	self assertEncoding: d is: 'a26161016162820203'.
	decoded := self decodeHex: 'a26161016162820203'.
	self assert: decoded size equals: 2.
	self assert: (decoded at: 'a') equals: 1.
	self assert: (decoded at: 'b') equals: #(2 3).
	decoded := self decodeHex: '826161a161626163'.
	self assert: decoded first equals: 'a'.
	self assert: (decoded last at: 'b') equals: 'c'
%

category: 'tests - collections'
method: CborTest
testCanonicalMapKeyOrder
	| d |
	d := Dictionary new.
	#('e' 'd' 'c' 'b' 'a') do: [:k | d at: k put: k asUppercase].
	self assertEncoding: d is: 'a56161614161626142616361436164614461656145'.
	d := Dictionary new.
	d at: 'aa' put: 1; at: 'b' put: 2; at: 10 put: 3; at: -1 put: 4; at: 100 put: 5.
	"RFC 8949 4.2.1: bytewise order of encoded keys: 0a, 1864, 20, 6162, 626161"
	self assertEncoding: d is: 'a50a031864052004616202626161' , '01'
%

category: 'tests - collections'
method: CborTest
testSets
	| decoded |
	self assertEncoding: (Set withAll: #(3 1 2)) is: 'd9010283010203'.
	decoded := self decodeHex: 'd9010283010203'.
	self assert: (decoded isKindOf: Set).
	self assert: decoded size equals: 3.
	self assert: (decoded includes: 2)
%

category: 'tests - indefinite'
method: CborTest
testIndefiniteLength
	| decoded |
	self assert: (self decodeHex: '5f42010243030405ff') equals: #[1 2 3 4 5].
	self assert: (self decodeHex: '7f657374726561646d696e67ff') equals: 'streaming'.
	self assert: (self decodeHex: '9fff') equals: #().
	self assert: (self decodeHex: '9f018202039f0405ffff') equals: {1. #(2 3). #(4 5)}.
	self assert: (self decodeHex: '9f01820203820405ff') equals: {1. #(2 3). #(4 5)}.
	self assert: (self decodeHex: '83018202039f0405ff') equals: {1. #(2 3). #(4 5)}.
	self assert: (self decodeHex: '83019f0203ff820405') equals: {1. #(2 3). #(4 5)}.
	self assert: (self decodeHex: '9f0102030405060708090a0b0c0d0e0f101112131415161718181819ff') equals: (1 to: 25) asArray.
	decoded := self decodeHex: 'bf61610161629f0203ffff'.
	self assert: (decoded at: 'a') equals: 1.
	self assert: (decoded at: 'b') equals: #(2 3).
	decoded := self decodeHex: '826161bf61626163ff'.
	self assert: (decoded last at: 'b') equals: 'c'.
	decoded := self decodeHex: 'bf6346756ef563416d7421ff'.
	self assert: (decoded at: 'Fun') equals: true.
	self assert: (decoded at: 'Amt') equals: -2
%

category: 'tests - indefinite'
method: CborTest
testStreamingEncoderApi
	| e |
	e := CborEncoder new.
	e writeIndefiniteMapStart.
	e encode: 'Fun'; encode: true.
	e encode: 'Amt'; encode: -2.
	e writeBreak.
	self assert: (Cbor hexFromBytes: e contents) equals: 'bf6346756ef563416d7421ff'.
	e := CborEncoder new.
	e writeIndefiniteTextStart; encode: 'strea'; encode: 'ming'; writeBreak.
	self assert: (Cbor hexFromBytes: e contents) equals: '7f657374726561646d696e67ff'
%

category: 'tests - tags'
method: CborTest
testUnknownTags
	| decoded |
	decoded := self decodeHex: 'd74401020304'.
	self assert: decoded equals: (CborTag tag: 23 value: #[1 2 3 4]).
	self assertEncoding: decoded is: 'd74401020304'.
	decoded := self decodeHex: 'd818456449455446'.
	self assert: decoded tag equals: 24.
	self assert: decoded value equals: (self hex: '6449455446').
	decoded := self decodeHex: 'd82076687474703a2f2f7777772e6578616d706c652e636f6d'.
	self assert: decoded equals: (CborTag tag: 32 value: 'http://www.example.com')
%

category: 'tests - tags'
method: CborTest
testCustomTagDecoder
	| decoder |
	decoder := CborDecoder onBytes: (self hex: 'd82076687474703a2f2f7777772e6578616d706c652e636f6d').
	decoder onTag: 32 do: [:value | value size].
	self assert: decoder decode equals: 22
%

category: 'tests - tags'
method: CborTest
testSelfDescribeTag
	self assert: (self decodeHex: 'd9d9f7820102') equals: #(1 2)
%

category: 'tests - tags'
method: CborTest
testEpochDateTime
	| dt |
	dt := self decodeHex: 'c11a514b67b0'.
	self assert: (dt isKindOf: DateAndTimeANSI).
	self assert: dt asPosixSeconds equals: 1363896240.
	self assertEncoding: dt is: 'c11a514b67b0'.
	dt := self decodeHex: 'c1fb41d452d9ec200000'.
	self assert: dt asPosixSeconds equals: 1363896240.5
%

category: 'tests - tags'
method: CborTest
testStringDateTime
	| dt |
	dt := self decodeHex: 'c074323031332d30332d32315432303a30343a30305a'.
	self assert: (dt isKindOf: DateAndTimeANSI).
	self assert: dt asPosixSeconds equals: 1363896240.
	dt := Cbor decode: (Cbor encode: (CborTag tag: 0 value: '2013-03-21T22:04:00+02:00')).
	self assert: dt asPosixSeconds equals: 1363896240.
	dt := Cbor decode: (Cbor encode: (CborTag tag: 0 value: '1969-12-31T23:59:59.5Z')).
	self assert: dt asPosixSeconds equals: -0.5.
	dt := Cbor decode: (Cbor encode: (CborTag tag: 0 value: 'not a date')).
	self assert: dt equals: (CborTag tag: 0 value: 'not a date')
%

category: 'tests - tags'
method: CborTest
testDecimalFractions
	| value |
	value := self decodeHex: 'c48221196ab3'.
	self assert: value equals: 273.15s2.
	self assert: (value isKindOf: ScaledDecimal).
	self assertEncoding: 273.15s2 is: 'c48221196ab3'.
	self assert: (self decodeHex: 'c482021863') equals: 9900
%

category: 'tests - tags'
method: CborTest
testFractions
	self assertRoundTrip: 1/3 hex: 'd81e820103'.
	self assertRoundTrip: -5/7 hex: 'd81e822407'.
	self assertDecodeError: 'd81e820100'
%

category: 'tests - api'
method: CborTest
testCustomObjectEncoding
	"Objects understanding #cborEncodeOn: control their own encoding; CborTag does that."

	self assertEncoding: (CborTag tag: 1000 value: #(1 'x')) is: 'd903e882016178'
%

category: 'tests - api'
method: CborTest
testSequence
	self assert: (Cbor decodeSequence: (self hex: '0102f5')) equals: {1. 2. true}.
	self assert: (Cbor decodeSequence: ByteArray new) equals: #()
%

category: 'tests - api'
method: CborTest
testStreamApi
	| ws rs |
	ws := WriteStream on: ByteArray new.
	Cbor encode: 'a' on: ws.
	Cbor encode: 1 on: ws.
	rs := ReadStream on: ws contents.
	self assert: (Cbor decodeFrom: rs) equals: 'a'.
	self assert: (Cbor decodeFrom: rs) equals: 1.
	self assert: rs atEnd
%

category: 'tests - api'
method: CborTest
testNestedRoundTrip
	| d decoded |
	d := Dictionary new.
	d at: 'name' put: 'GemStone'.
	d at: 'version' put: 3.
	d at: 'pi' put: 3.14159.
	d at: 'tags' put: #('db' 'smalltalk').
	d at: 'bin' put: #[0 255].
	d at: 'none' put: nil.
	decoded := Cbor decode: (Cbor encode: d).
	self assert: decoded size equals: d size.
	d keysAndValuesDo: [:k :v | self assert: (decoded at: k) equals: v]
%

category: 'tests - errors'
method: CborTest
testUnencodableObject
	self should: [Cbor encode: Object new] raise: CborError
%

category: 'tests - errors'
method: CborTest
testCyclicStructure
	| a |
	a := Array new: 1.
	a at: 1 put: a.
	self should: [Cbor encode: a] raise: CborError
%

category: 'tests - errors'
method: CborTest
testMalformedInput
	self assertDecodeError: ''.
	self assertDecodeError: '18'.
	self assertDecodeError: '1a0000'.
	self assertDecodeError: '4401'.
	self assertDecodeError: '6261'.
	self assertDecodeError: '8301'.
	self assertDecodeError: 'a10a'.
	self assertDecodeError: '1c'.
	self assertDecodeError: 'fc'.
	self assertDecodeError: 'ff'.
	self assertDecodeError: '9f01'.
	self assertDecodeError: '81ff'.
	self assertDecodeError: '1f'.
	self assertDecodeError: 'df00'.
	self assertDecodeError: '5f01ff'.
	self assertDecodeError: '5f6161ff'.
	self assertDecodeError: '7f5f4100ffff'.
	self assertDecodeError: 'f800'.
	self assertDecodeError: '62c328'.
	self assertDecodeError: '0101'.
	self assertDecodeError: '5bffffffffffffffff01'
%

category: 'tests - errors'
method: CborTest
testDuplicateKeys
	| decoder |
	self assert: ((self decodeHex: 'a201020103') at: 1) equals: 3.
	decoder := CborDecoder onBytes: (self hex: 'a201020103').
	decoder rejectDuplicateKeys: true.
	self should: [decoder decode] raise: CborError
%

category: 'tests - errors'
method: CborTest
testMaxDepth
	| bytes decoder |
	bytes := ByteArray new: 2001.
	1 to: 2000 do: [:i | bytes at: i put: 16r81].
	self should: [Cbor decode: bytes] raise: CborError.
	decoder := CborDecoder onBytes: (self hex: '818100').
	decoder maxDepth: 1.
	self should: [decoder decode] raise: CborError
%

! ------------------- CborTypedEncoder
removeallmethods CborTypedEncoder
removeallclassmethods CborTypedEncoder

category: 'accessing'
method: CborTypedEncoder
registry
	^registry
%

category: 'accessing'
method: CborTypedEncoder
registry: aCborTypeRegistry
	registry := aCborTypeRegistry
%

category: 'private'
method: CborTypedEncoder
encodeObject: anObject
	"Registered classes take precedence over the built-in mapping.
	 Lookup is by exact class: subclasses must be registered themselves."

	| mapping |
	mapping := registry isNil ifFalse: [registry mappingForClass: anObject class].
	mapping isNil ifTrue: [^super encodeObject: anObject].
	mapping encode: anObject on: self
%

category: 'private'
method: CborTypedEncoder
newNestedEncoder
	^super newNestedEncoder registry: registry; yourself
%

! ------------------- CborTypeMapping
removeallmethods CborTypeMapping
removeallclassmethods CborTypeMapping

category: 'instance creation'
classmethod: CborTypeMapping
forClass: aClass tag: tagNumberOrNil typeName: aStringOrNil encode: encodeBlockOrNil decode: decodeBlockOrNil
	^self new
		setClass: aClass
		tag: tagNumberOrNil
		typeName: aStringOrNil
		encode: encodeBlockOrNil
		decode: decodeBlockOrNil
%

category: 'private'
method: CborTypeMapping
setClass: aClass tag: tagNumberOrNil typeName: aStringOrNil encode: encodeBlockOrNil decode: decodeBlockOrNil
	typeClass := aClass.
	tag := tagNumberOrNil.
	typeName := aStringOrNil.
	encodeBlock := encodeBlockOrNil.
	decodeBlock := decodeBlockOrNil
%

category: 'accessing'
method: CborTypeMapping
typeClass
	^typeClass
%

category: 'accessing'
method: CborTypeMapping
tag
	"The tag number, or nil for a mapping by type name (tag 27)."

	^tag
%

category: 'accessing'
method: CborTypeMapping
typeName
	"The type name used with tag 27, or nil for a mapping by tag number."

	^typeName
%

category: 'testing'
method: CborTypeMapping
isNamed
	^typeName notNil
%

category: 'converting'
method: CborTypeMapping
payloadFor: anObject
	"Answer the CBOR-encodable payload representing anObject."

	^encodeBlock isNil
		ifTrue: [anObject cborPayload]
		ifFalse: [encodeBlock value: anObject]
%

category: 'converting'
method: CborTypeMapping
objectFrom: aPayload
	"Answer the object reconstructed from a decoded payload."

	^decodeBlock isNil
		ifTrue: [typeClass fromCborPayload: aPayload]
		ifFalse: [decodeBlock value: aPayload]
%

category: 'encoding'
method: CborTypeMapping
encode: anObject on: aCborEncoder
	"Write anObject as tag(payload), or for named types as 27([typeName, arg1, ...])."

	| payload args |
	payload := self payloadFor: anObject.
	typeName isNil ifTrue: [
		aCborEncoder writeTag: tag.
		^aCborEncoder encode: payload].
	(payload isKindOf: SequenceableCollection)
		ifFalse: [^CborError signal: 'payload of named CBOR type ', typeName, ' must be a sequence of constructor arguments'].
	args := payload asArray.
	aCborEncoder writeTag: 27.
	aCborEncoder writeArrayHeader: args size + 1.
	aCborEncoder encode: typeName.
	args do: [:each | aCborEncoder encode: each]
%

category: 'printing'
method: CborTypeMapping
printOn: aStream
	aStream nextPutAll: 'CborTypeMapping('; nextPutAll: typeClass name; nextPutAll: ' <-> '.
	typeName isNil
		ifTrue: [aStream nextPutAll: 'tag '; print: tag]
		ifFalse: [aStream nextPutAll: '27 '; print: typeName].
	aStream nextPut: $)
%

! ------------------- CborTypeRegistry
removeallmethods CborTypeRegistry
removeallclassmethods CborTypeRegistry

category: 'instance creation'
classmethod: CborTypeRegistry
new
	^self basicNew initialize
%

category: 'default instance'
classmethod: CborTypeRegistry
default
	"Answer the shared, persistent registry. Prefer selector-based registration
	 (#register:tag:, #register:typeName:) here, since it stores no blocks."

	Default isNil ifTrue: [Default := self new].
	^Default
%

category: 'default instance'
classmethod: CborTypeRegistry
resetDefault
	Default := nil
%

category: 'initialization'
method: CborTypeRegistry
initialize
	byClass := IdentityKeyValueDictionary new.
	byTag := Dictionary new.
	byName := Dictionary new
%

category: 'registering'
method: CborTypeRegistry
register: aClass tag: tagNumber
	"Map aClass to tagNumber. Instances must understand #cborPayload (answering an
	 encodable object) and aClass must understand #fromCborPayload: (answering an instance)."

	^self register: aClass tag: tagNumber encode: nil decode: nil
%

category: 'registering'
method: CborTypeRegistry
register: aClass tag: tagNumber encode: encodeBlock decode: decodeBlock
	"Map aClass to tagNumber using blocks; useful for classes you cannot or do not want
	 to change. encodeBlock: [:instance | payload], decodeBlock: [:payload | instance].
	 A nil block falls back to #cborPayload / #fromCborPayload:."

	| existing mapping |
	((tagNumber isKindOf: Integer) and: [tagNumber >= 0 and: [tagNumber < 18446744073709551616]])
		ifFalse: [^CborError signal: 'CBOR tag number must be an unsigned 64-bit integer'].
	tagNumber = 27
		ifTrue: [^CborError signal: 'tag 27 is reserved for named types, use #register:typeName:'].
	existing := byTag at: tagNumber ifAbsent: [nil].
	(existing notNil and: [existing typeClass ~~ aClass])
		ifTrue: [^CborError signal: 'CBOR tag ', tagNumber printString, ' is already registered for ', existing typeClass name].
	self unregister: aClass.
	mapping := CborTypeMapping forClass: aClass tag: tagNumber typeName: nil encode: encodeBlock decode: decodeBlock.
	byClass at: aClass put: mapping.
	byTag at: tagNumber put: mapping.
	^mapping
%

category: 'registering'
method: CborTypeRegistry
register: aClass typeName: aString
	"Map aClass to a type name, encoded as tag 27 [typeName, arg1, ...].
	 #cborPayload must answer the argument sequence, #fromCborPayload: receives it as an Array."

	^self register: aClass typeName: aString encode: nil decode: nil
%

category: 'registering'
method: CborTypeRegistry
register: aClass typeName: aString encode: encodeBlock decode: decodeBlock
	"Map aClass to a type name (tag 27). Only registered names are ever instantiated
	 when decoding, so the registry acts as a whitelist."

	| name existing mapping |
	((aString isKindOf: CharacterCollection) and: [aString notEmpty])
		ifFalse: [^CborError signal: 'CBOR type name must be a non-empty string'].
	name := aString asString.
	existing := byName at: name ifAbsent: [nil].
	(existing notNil and: [existing typeClass ~~ aClass])
		ifTrue: [^CborError signal: 'CBOR type name ', name printString, ' is already registered for ', existing typeClass name].
	self unregister: aClass.
	mapping := CborTypeMapping forClass: aClass tag: nil typeName: name encode: encodeBlock decode: decodeBlock.
	byClass at: aClass put: mapping.
	byName at: name put: mapping.
	^mapping
%

category: 'registering'
method: CborTypeRegistry
unregister: aClass
	"Remove the mapping for aClass. Answer the removed mapping or nil."

	| mapping |
	mapping := byClass removeKey: aClass ifAbsent: [nil].
	mapping isNil ifTrue: [^nil].
	mapping tag isNil ifFalse: [byTag removeKey: mapping tag ifAbsent: [nil]].
	mapping typeName isNil ifFalse: [byName removeKey: mapping typeName ifAbsent: [nil]].
	^mapping
%

category: 'accessing'
method: CborTypeRegistry
mappingForClass: aClass
	^byClass at: aClass ifAbsent: [nil]
%

category: 'accessing'
method: CborTypeRegistry
mappingForTag: tagNumber
	^byTag at: tagNumber ifAbsent: [nil]
%

category: 'accessing'
method: CborTypeRegistry
mappingForTypeName: aString
	^byName at: aString asString ifAbsent: [nil]
%

category: 'accessing'
method: CborTypeRegistry
mappings
	"Answer all mappings, sorted by tag number, then by type name."

	^(byClass values asSortedCollection: [:a :b |
		a isNamed = b isNamed
			ifTrue: [a isNamed ifTrue: [a typeName <= b typeName] ifFalse: [a tag <= b tag]]
			ifFalse: [b isNamed]]) asArray
%

category: 'testing'
method: CborTypeRegistry
isEmpty
	^byClass isEmpty
%

category: 'encoding'
method: CborTypeRegistry
newEncoder
	"Answer an encoder writing to a fresh ByteArray that knows the registered types."

	^CborTypedEncoder new registry: self; yourself
%

category: 'encoding'
method: CborTypeRegistry
newEncoderOn: aBinaryWriteStream
	^(CborTypedEncoder on: aBinaryWriteStream) registry: self; yourself
%

category: 'encoding'
method: CborTypeRegistry
encode: anObject
	^(self newEncoder encode: anObject) contents
%

category: 'encoding'
method: CborTypeRegistry
encodeCanonical: anObject
	^(self newEncoder canonical: true; encode: anObject) contents
%

category: 'decoding'
method: CborTypeRegistry
configureDecoder: aCborDecoder
	"Install converters for all registered types into aCborDecoder. Answer the decoder.
	 Converters registered on the decoder afterwards override these."

	byTag keysAndValuesDo: [:tagNumber :mapping |
		aCborDecoder onTag: tagNumber do: [:payload | mapping objectFrom: payload]].
	byName isEmpty
		ifFalse: [aCborDecoder onTag: 27 do: [:value | self objectFromNamed: value]].
	^aCborDecoder
%

category: 'decoding'
method: CborTypeRegistry
newDecoderOn: aBinaryReadStream
	^self configureDecoder: (CborDecoder on: aBinaryReadStream)
%

category: 'decoding'
method: CborTypeRegistry
newDecoderOnBytes: aByteArray
	^self configureDecoder: (CborDecoder onBytes: aByteArray)
%

category: 'decoding'
method: CborTypeRegistry
decode: aByteArray
	"Decode exactly one data item, converting registered tags into objects."

	| decoder result |
	decoder := self newDecoderOnBytes: aByteArray.
	result := decoder decode.
	decoder atEnd ifFalse: [^CborError signal: 'CBOR decode error: trailing bytes after data item'].
	^result
%

category: 'decoding'
method: CborTypeRegistry
decodeSequence: aByteArray
	^(self newDecoderOnBytes: aByteArray) decodeAll
%

category: 'private'
method: CborTypeRegistry
objectFromNamed: value
	"Tag 27 content [typeName, arg1, ...]. Unregistered names are never instantiated;
	 they come back as a CborTag so they survive a decode/encode round trip."

	| mapping |
	((value isKindOf: Array) and: [value notEmpty and: [value first isKindOf: CharacterCollection]])
		ifFalse: [^CborTag tag: 27 value: value].
	mapping := self mappingForTypeName: value first.
	mapping isNil ifTrue: [^CborTag tag: 27 value: value].
	^mapping objectFrom: (value copyFrom: 2 to: value size)
%

! ------------------- CborTestPoint (test fixture)
removeallmethods CborTestPoint
removeallclassmethods CborTestPoint

category: 'instance creation'
classmethod: CborTestPoint
x: xNumber y: yNumber
	^self new setX: xNumber y: yNumber
%

category: 'cbor'
classmethod: CborTestPoint
fromCborPayload: anArray
	((anArray isKindOf: Array) and: [anArray size = 2
		and: [anArray first isNumber and: [anArray last isNumber]]])
		ifFalse: [^CborError signal: 'invalid point payload: ', anArray printString].
	^self x: anArray first y: anArray last
%

category: 'private'
method: CborTestPoint
setX: xNumber y: yNumber
	x := xNumber.
	y := yNumber
%

category: 'accessing'
method: CborTestPoint
x
	^x
%

category: 'accessing'
method: CborTestPoint
y
	^y
%

category: 'comparing'
method: CborTestPoint
= anObject
	^(anObject isKindOf: CborTestPoint) and: [x = anObject x and: [y = anObject y]]
%

category: 'comparing'
method: CborTestPoint
hash
	^x hash bitXor: y hash
%

category: 'cbor'
method: CborTestPoint
cborPayload
	^Array with: x with: y
%

! ------------------- CborTypeRegistryTest
removeallmethods CborTypeRegistryTest
removeallclassmethods CborTypeRegistryTest

category: 'helpers'
method: CborTypeRegistryTest
registry
	"A fresh registry with CborTestPoint as tag 40001 (selector based)."

	| r |
	r := CborTypeRegistry new.
	r register: CborTestPoint tag: 40001.
	^r
%

category: 'helpers'
method: CborTypeRegistryTest
hexOf: aByteArray
	^Cbor hexFromBytes: aByteArray
%

category: 'helpers'
method: CborTypeRegistryTest
p: x _: y
	^CborTestPoint x: x y: y
%

category: 'tests'
method: CborTypeRegistryTest
testSelectorBasedMapping
	| r bytes decoded |
	r := self registry.
	bytes := r encode: (self p: 1 _: 2).
	self assert: (self hexOf: bytes) equals: 'd99c41820102'.
	decoded := r decode: bytes.
	self assert: decoded class equals: CborTestPoint.
	self assert: decoded equals: (self p: 1 _: 2)
%

category: 'tests'
method: CborTypeRegistryTest
testBlockBasedMapping
	| r bytes decoded |
	r := CborTypeRegistry new.
	r register: Association tag: 40010
		encode: [:assoc | Array with: assoc key with: assoc value]
		decode: [:pair | pair first -> pair last].
	bytes := r encode: 'a' -> 1.
	self assert: (self hexOf: bytes) equals: 'd99c4a82616101'.
	decoded := r decode: bytes.
	self assert: (decoded isKindOf: Association).
	self assert: decoded key equals: 'a'.
	self assert: decoded value equals: 1
%

category: 'tests'
method: CborTypeRegistryTest
testNestedObjects
	| r d decoded |
	r := self registry.
	d := Dictionary new.
	d at: 'line' put: (Array with: (self p: 0 _: 0) with: (self p: 3 _: 4)).
	d at: 'origin' put: (self p: -1 _: 2.5).
	decoded := r decode: (r encode: d).
	self assert: (decoded at: 'line') equals: (Array with: (self p: 0 _: 0) with: (self p: 3 _: 4)).
	self assert: (decoded at: 'origin') equals: (self p: -1 _: 2.5).
	self assert: (decoded at: 'origin') class equals: CborTestPoint
%

category: 'tests'
method: CborTypeRegistryTest
testCanonicalEncodingUsesRegistryForKeys
	"Map keys are encoded by a nested encoder in canonical mode; it must know the registry."

	| r d bytes decoded |
	r := self registry.
	d := Dictionary new.
	d at: (self p: 1 _: 2) put: 'a'.
	bytes := r encodeCanonical: d.
	self assert: (self hexOf: bytes) equals: 'a1d99c418201026161'.
	decoded := r decode: bytes.
	self assert: (decoded at: (self p: 1 _: 2)) equals: 'a'
%

category: 'tests'
method: CborTypeRegistryTest
testNamedTypes
	| r bytes decoded |
	r := CborTypeRegistry new.
	r register: CborTestPoint typeName: 'example.Point'.
	bytes := r encode: (self p: 1 _: 2).
	self assert: (self hexOf: bytes) equals: 'd81b836d6578616d706c652e506f696e740102'.
	decoded := r decode: bytes.
	self assert: decoded equals: (self p: 1 _: 2)
%

category: 'tests'
method: CborTypeRegistryTest
testUnregisteredTypeNameIsNotInstantiated
	| r bytes decoded |
	r := CborTypeRegistry new.
	r register: CborTestPoint typeName: 'example.Point'.
	bytes := Cbor encode: (CborTag tag: 27 value: #('evil.Class' 1)).
	decoded := r decode: bytes.
	self assert: decoded equals: (CborTag tag: 27 value: #('evil.Class' 1)).
	self assert: (r encode: decoded) equals: bytes
%

category: 'tests'
method: CborTypeRegistryTest
testUnknownTagPassesThrough
	| r bytes decoded |
	r := self registry.
	bytes := Cbor bytesFromHex: 'd99c4b820102'.
	decoded := r decode: bytes.
	self assert: decoded equals: (CborTag tag: 40011 value: #(1 2)).
	self assert: (r encode: decoded) equals: bytes
%

category: 'tests'
method: CborTypeRegistryTest
testPlainCborIgnoresRegistry
	| decoded |
	decoded := Cbor decode: (Cbor bytesFromHex: 'd99c41820102').
	self assert: decoded equals: (CborTag tag: 40001 value: #(1 2)).
	self should: [Cbor encode: (self p: 1 _: 2)] raise: CborError
%

category: 'tests'
method: CborTypeRegistryTest
testDuplicateTagRejected
	| r |
	r := self registry.
	self should: [r register: Association tag: 40001 encode: [:a | 0] decode: [:p | nil]] raise: CborError.
	self assert: (r mappingForTag: 40001) typeClass equals: CborTestPoint
%

category: 'tests'
method: CborTypeRegistryTest
testDuplicateTypeNameRejected
	| r |
	r := CborTypeRegistry new.
	r register: CborTestPoint typeName: 'example.Point'.
	self should: [r register: Association typeName: 'example.Point'] raise: CborError
%

category: 'tests'
method: CborTypeRegistryTest
testReRegisterReplacesMapping
	| r |
	r := self registry.
	r register: CborTestPoint tag: 40005.
	self assert: (r mappingForTag: 40001) isNil.
	self assert: (self hexOf: (r encode: (self p: 1 _: 2))) equals: 'd99c45820102'.
	r register: CborTestPoint typeName: 'example.Point'.
	self assert: (r mappingForTag: 40005) isNil.
	self assert: (r mappingForTypeName: 'example.Point') typeClass equals: CborTestPoint
%

category: 'tests'
method: CborTypeRegistryTest
testUnregister
	| r removed |
	r := self registry.
	removed := r unregister: CborTestPoint.
	self assert: removed tag equals: 40001.
	self assert: r isEmpty.
	self assert: (r unregister: CborTestPoint) isNil.
	self should: [r encode: (self p: 1 _: 2)] raise: CborError
%

category: 'tests'
method: CborTypeRegistryTest
testInvalidRegistrations
	| r |
	r := CborTypeRegistry new.
	self should: [r register: CborTestPoint tag: 27] raise: CborError.
	self should: [r register: CborTestPoint tag: -1] raise: CborError.
	self should: [r register: CborTestPoint typeName: ''] raise: CborError.
	self assert: r isEmpty
%

category: 'tests'
method: CborTypeRegistryTest
testMappingsListing
	| r list |
	r := self registry.
	r register: Association typeName: 'example.Assoc'
		encode: [:a | Array with: a key with: a value]
		decode: [:args | args first -> args last].
	list := r mappings.
	self assert: list size equals: 2.
	self assert: list first tag equals: 40001.
	self assert: list last typeName equals: 'example.Assoc'
%

category: 'tests'
method: CborTypeRegistryTest
testDecoderConvertersCanBeOverridden
	| decoder |
	decoder := self registry newDecoderOnBytes: (Cbor bytesFromHex: 'd99c41820102').
	decoder onTag: 40001 do: [:payload | payload size].
	self assert: decoder decode equals: 2
%

category: 'tests'
method: CborTypeRegistryTest
testStreamApi
	| r ws rs decoder |
	r := self registry.
	ws := WriteStream on: ByteArray new.
	(r newEncoderOn: ws) encode: (self p: 1 _: 2); encode: (self p: 3 _: 4).
	rs := ReadStream on: ws contents.
	decoder := r newDecoderOn: rs.
	self assert: decoder decode equals: (self p: 1 _: 2).
	self assert: decoder decode equals: (self p: 3 _: 4).
	self assert: decoder atEnd.
	self assert: (r decodeSequence: ws contents) equals: (Array with: (self p: 1 _: 2) with: (self p: 3 _: 4))
%

category: 'tests'
method: CborTypeRegistryTest
testDefaultRegistryIsShared
	self assert: CborTypeRegistry default == CborTypeRegistry default
%

! ------------------- CborTestAddress (test fixture, see spec/types.cddl)
removeallmethods CborTestAddress
removeallclassmethods CborTestAddress

category: 'instance creation'
classmethod: CborTestAddress
street: streetString city: cityString zip: zipStringOrNil
	^self new setStreet: streetString city: cityString zip: zipStringOrNil
%

category: 'cbor'
classmethod: CborTestAddress
fromCborPayload: aMap
	"Payload per spec/types.cddl: {1: street, 2: city, ?3: zip (5 bytes)}. Unknown keys are ignored."

	| aStreet aCity aZip |
	(aMap isKindOf: AbstractDictionary) ifFalse: [^CborError signal: 'address payload must be a map'].
	aStreet := aMap at: 1 ifAbsent: [nil].
	aCity := aMap at: 2 ifAbsent: [nil].
	aZip := aMap at: 3 ifAbsent: [nil].
	((aStreet isKindOf: CharacterCollection) and: [aCity isKindOf: CharacterCollection])
		ifFalse: [^CborError signal: 'address requires text keys 1 (street) and 2 (city)'].
	(aZip isNil or: [(aZip isKindOf: CharacterCollection) and: [aZip encodeAsUTF8 size = 5]])
		ifFalse: [^CborError signal: 'address zip must be a 5-byte text string'].
	^self street: aStreet city: aCity zip: aZip
%

category: 'private'
method: CborTestAddress
setStreet: streetString city: cityString zip: zipStringOrNil
	street := streetString.
	city := cityString.
	zip := zipStringOrNil
%

category: 'accessing'
method: CborTestAddress
street
	^street
%

category: 'accessing'
method: CborTestAddress
city
	^city
%

category: 'accessing'
method: CborTestAddress
zip
	^zip
%

category: 'cbor'
method: CborTestAddress
cborPayload
	| m |
	m := Dictionary new.
	m at: 1 put: street; at: 2 put: city.
	zip isNil ifFalse: [m at: 3 put: zip].
	^m
%

! ------------------- CborTestCustomer (test fixture, see spec/types.cddl)
removeallmethods CborTestCustomer
removeallclassmethods CborTestCustomer

category: 'instance creation'
classmethod: CborTestCustomer
name: aString id: anInteger addresses: anArray createdAt: aDateAndTimeOrNil
	^self new setName: aString id: anInteger addresses: anArray createdAt: aDateAndTimeOrNil
%

category: 'cbor'
classmethod: CborTestCustomer
fromCborPayload: aMap
	"Payload per spec/types.cddl: {1: name, 2: id, ?3: [+ address], ?4: 1(int)}.
	 Unknown keys are ignored (forward compatibility)."

	| aName anId someAddresses aCreatedAt |
	(aMap isKindOf: AbstractDictionary) ifFalse: [^CborError signal: 'customer payload must be a map'].
	aName := aMap at: 1 ifAbsent: [nil].
	anId := aMap at: 2 ifAbsent: [nil].
	someAddresses := aMap at: 3 ifAbsent: [nil].
	aCreatedAt := aMap at: 4 ifAbsent: [nil].
	((aName isKindOf: CharacterCollection) and: [aName encodeAsUTF8 size between: 1 and: 200])
		ifFalse: [^CborError signal: 'customer name must be a text string of 1..200 bytes'].
	((anId isKindOf: Integer) and: [anId >= 0])
		ifFalse: [^CborError signal: 'customer id must be an unsigned integer'].
	(someAddresses isNil or: [(someAddresses isKindOf: Array) and: [someAddresses notEmpty
		and: [someAddresses allSatisfy: [:each | each isKindOf: CborTestAddress]]]])
		ifFalse: [^CborError signal: 'customer addresses must be a non-empty array of addresses'].
	(aCreatedAt isNil or: [aCreatedAt isKindOf: DateAndTimeANSI])
		ifFalse: [^CborError signal: 'customer createdAt must be a tag 1 date/time'].
	^self name: aName id: anId addresses: (someAddresses ifNil: [#()]) createdAt: aCreatedAt
%

category: 'private'
method: CborTestCustomer
setName: aString id: anInteger addresses: anArray createdAt: aDateAndTimeOrNil
	name := aString.
	id := anInteger.
	addresses := anArray.
	createdAt := aDateAndTimeOrNil
%

category: 'accessing'
method: CborTestCustomer
name
	^name
%

category: 'accessing'
method: CborTestCustomer
id
	^id
%

category: 'accessing'
method: CborTestCustomer
addresses
	^addresses
%

category: 'accessing'
method: CborTestCustomer
createdAt
	^createdAt
%

category: 'cbor'
method: CborTestCustomer
cborPayload
	"Optional fields are omitted when absent, as required by spec/types.cddl."

	| m |
	m := Dictionary new.
	m at: 1 put: name; at: 2 put: id.
	addresses isEmpty ifFalse: [m at: 3 put: addresses asArray].
	createdAt isNil ifFalse: [m at: 4 put: createdAt].
	^m
%

! ------------------- CborVectorTest (the #vectors method is generated: CborVectorTest-vectors.gs)
removeallmethods CborVectorTest
removeallclassmethods CborVectorTest

category: 'helpers'
method: CborVectorTest
registry
	"Tag assignments from spec/types.cddl."

	| r |
	r := CborTypeRegistry new.
	r register: CborTestPoint tag: 40001.
	r register: CborTestCustomer tag: 40002.
	r register: CborTestAddress tag: 40003.
	^r
%

category: 'helpers'
method: CborVectorTest
classForRule: ruleName
	ruleName = 'point' ifTrue: [^CborTestPoint].
	ruleName = 'customer' ifTrue: [^CborTestCustomer].
	ruleName = 'address' ifTrue: [^CborTestAddress].
	ruleName = 'messages' ifTrue: [^Array].
	^self error: 'unknown CDDL rule ', ruleName
%

category: 'helpers'
method: CborVectorTest
vectorsWhere: aBlock
	"Answer vectors as Arrays {name. rule. valid. roundtrip. bytes} that satisfy aBlock."

	^(self vectors
		collect: [:v | Array with: (v at: 1) with: (v at: 2) with: (v at: 3) with: (v at: 4)
			with: (Cbor bytesFromHex: (v at: 5))])
		select: aBlock
%

category: 'helpers'
method: CborVectorTest
isDomainObject: anObject
	^(anObject isKindOf: CborTestPoint)
		or: [(anObject isKindOf: CborTestCustomer) or: [anObject isKindOf: CborTestAddress]]
%

category: 'tests'
method: CborVectorTest
testVectorsArePresent
	self assert: (self vectorsWhere: [:v | v at: 3]) size >= 10.
	self assert: (self vectorsWhere: [:v | (v at: 3) not]) size >= 5
%

category: 'tests'
method: CborVectorTest
testValidVectorsDecodeToDomainObjects
	| r |
	r := self registry.
	(self vectorsWhere: [:v | v at: 3]) do: [:v | | decoded |
		decoded := r decode: (v at: 5).
		self assert: (decoded isKindOf: (self classForRule: (v at: 2)))
			description: (v at: 1), ': wrong class ', decoded class name.
		(v at: 2) = 'messages'
			ifTrue: [decoded do: [:each |
				self assert: (self isDomainObject: each) description: (v at: 1), ': element not converted']]]
%

category: 'tests'
method: CborVectorTest
testRoundTripVectors
	"Decoding to domain objects and re-encoding deterministically reproduces the bytes."

	| r |
	r := self registry.
	(self vectorsWhere: [:v | v at: 4]) do: [:v |
		self
			assert: (Cbor hexFromBytes: (r encodeCanonical: (r decode: (v at: 5))))
			equals: (Cbor hexFromBytes: (v at: 5))]
%

category: 'tests'
method: CborVectorTest
testInvalidVectorsAreRejected
	"An invalid vector must either signal CborError or not decode to the rule's class."

	| r |
	r := self registry.
	(self vectorsWhere: [:v | (v at: 3) not]) do: [:v | | result |
		result := [r decode: (v at: 5)] on: CborError do: [:ex | ex return: #rejected].
		self assert: (result == #rejected or: [(result isKindOf: (self classForRule: (v at: 2))) not])
			description: (v at: 1), ' was accepted']
%

category: 'tests'
method: CborVectorTest
testUnknownKeysAreIgnored
	| customer |
	customer := self registry decode: ((self vectorsWhere: [:v | (v at: 1) = 'customer-extension']) first at: 5).
	self assert: customer name equals: 'Ada'.
	self assert: customer id equals: 42
%

category: 'tests'
method: CborVectorTest
testFullCustomerContent
	| customer |
	customer := self registry decode: ((self vectorsWhere: [:v | (v at: 1) = 'customer-full']) first at: 5).
	self assert: customer name equals: 'Grace Hopper'.
	self assert: customer id equals: 1906.
	self assert: customer addresses size equals: 2.
	self assert: customer addresses first zip equals: '10115'.
	self assert: customer addresses last zip isNil.
	self assert: customer createdAt asPosixSeconds equals: 1363896240
%
