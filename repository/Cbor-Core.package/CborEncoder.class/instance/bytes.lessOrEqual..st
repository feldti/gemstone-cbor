private
bytes: a lessOrEqual: b
	"Bytewise lexicographic comparison (RFC 8949, 4.2.1)."

	1 to: (a size min: b size) do: [:i |
		(a at: i) = (b at: i) ifFalse: [^(a at: i) < (b at: i)]].
	^a size <= b size