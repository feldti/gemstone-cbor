encoding
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