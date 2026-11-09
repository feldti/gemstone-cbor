private
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