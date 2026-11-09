private
writeUnsigned: anInteger bytes: byteCount
	"Write anInteger big-endian into byteCount bytes."

	byteCount - 1 to: 0 by: -1 do: [:i |
		stream nextPut: ((anInteger bitShift: i * -8) bitAnd: 255)]