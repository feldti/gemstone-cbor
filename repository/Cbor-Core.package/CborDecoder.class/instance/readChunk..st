private - reading
readChunk: count
	| bytes |
	bytes := [stream next: count] on: Error do: [:ex | ex return: nil].
	(bytes isNil or: [bytes size < count])
		ifTrue: [^self signalError: 'unexpected end of input'].
	^bytes asByteArray