data
bytes: count
	| bytes |
	bytes := ByteArray new: count.
	1 to: count do: [:i | bytes at: i put: (self nextRandom: 256)].
	^bytes