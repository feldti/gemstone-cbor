private - decoding
parseRfc3339: aString
	"Parse YYYY-MM-DDTHH:MM:SS[.fraction](Z|+HH:MM|-HH:MM).
	 Answer {posixSeconds. offsetSeconds} or nil if aString is malformed."

	| s year month day hour minute second pos fracStart fraction offset offHours offMinutes sign days |
	s := aString asString.
	s size < 20 ifTrue: [^nil].
	((s at: 5) = $- and: [(s at: 8) = $- and: [(s at: 14) = $: and: [(s at: 17) = $:]]]) ifFalse: [^nil].
	('Tt ' includes: (s at: 11)) ifFalse: [^nil].
	year := self digitsIn: s from: 1 to: 4.
	month := self digitsIn: s from: 6 to: 7.
	day := self digitsIn: s from: 9 to: 10.
	hour := self digitsIn: s from: 12 to: 13.
	minute := self digitsIn: s from: 15 to: 16.
	second := self digitsIn: s from: 18 to: 19.
	(year isNil or: [month isNil or: [day isNil or: [hour isNil or: [minute isNil or: [second isNil]]]]]) ifTrue: [^nil].
	((month between: 1 and: 12) and: [(day between: 1 and: 31) and: [hour < 24 and: [minute < 60 and: [second < 61]]]]) ifFalse: [^nil].
	pos := 20.
	fraction := 0.
	(s at: pos) = $. ifTrue: [
		fracStart := pos + 1.
		pos := fracStart.
		[pos <= s size and: [(s at: pos) isDigit]] whileTrue: [pos := pos + 1].
		pos = fracStart ifTrue: [^nil].
		fraction := (self digitsIn: s from: fracStart to: pos - 1) / (10 raisedTo: pos - fracStart)].
	pos > s size ifTrue: [^nil].
	('Zz' includes: (s at: pos))
		ifTrue: [
			pos = s size ifFalse: [^nil].
			offset := 0]
		ifFalse: [
			(s size = (pos + 5) and: [('+-' includes: (s at: pos)) and: [(s at: pos + 3) = $:]]) ifFalse: [^nil].
			sign := (s at: pos) = $- ifTrue: [-1] ifFalse: [1].
			offHours := self digitsIn: s from: pos + 1 to: pos + 2.
			offMinutes := self digitsIn: s from: pos + 4 to: pos + 5.
			(offHours isNil or: [offMinutes isNil]) ifTrue: [^nil].
			offset := sign * ((offHours * 3600) + (offMinutes * 60))].
	days := self daysFromCivilYear: year month: month day: day.
	^Array
		with: (days * 86400) + (hour * 3600) + (minute * 60) + second - offset
			+ (fraction = 0 ifTrue: [0] ifFalse: [fraction asFloat])
		with: offset