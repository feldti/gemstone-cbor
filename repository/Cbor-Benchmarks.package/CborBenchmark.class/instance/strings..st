data
strings: count
	^(1 to: count) collect: [:i |
		'Zeile ' , i printString , ': Lorem ipsum dolor sit amet, consectetur adipiscing elit']