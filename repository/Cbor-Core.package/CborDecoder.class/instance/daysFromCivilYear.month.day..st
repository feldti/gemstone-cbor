private - decoding
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