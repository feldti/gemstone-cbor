private - decoding
digitsIn: aString from: start to: stop
	"Answer the decimal value of aString from start to stop, or nil if not all digits."

	| v |
	v := 0.
	start to: stop do: [:i |
		(aString at: i) isDigit ifFalse: [^nil].
		v := (v * 10) + (aString at: i) digitValue].
	^v