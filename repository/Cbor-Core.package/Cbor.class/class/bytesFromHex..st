converting
bytesFromHex: aString
	"Answer a ByteArray from a hex string; whitespace is ignored. Handy for tests and debugging."

	| digits bytes |
	digits := aString reject: [:c | c isSeparator].
	digits size odd ifTrue: [^CborError signal: 'odd number of hex digits'].
	bytes := ByteArray new: digits size // 2.
	1 to: bytes size do: [:i |
		bytes at: i put: ((self hexDigitValue: (digits at: i * 2 - 1)) * 16) + (self hexDigitValue: (digits at: i * 2))].
	^bytes