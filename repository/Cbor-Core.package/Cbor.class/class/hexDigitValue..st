converting
hexDigitValue: aCharacter
	"Value 0..15 of a hex digit (either case). The kernel's Character>>digitValue
	 answers nil for letters, so this does not rely on it."

	| i |
	i := '0123456789abcdefABCDEF' indexOf: aCharacter.
	i = 0 ifTrue: [^CborError signal: 'invalid hex digit: ', aCharacter printString].
	^i <= 16 ifTrue: [i - 1] ifFalse: [i - 7]