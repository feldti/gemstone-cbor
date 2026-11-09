data
customers: count
	"Typical JSON-style documents with string keys."

	^(1 to: count) collect: [:i | | address customer |
		address := Dictionary new.
		address at: 'street' put: 'Hauptstr. ' , i printString;
			at: 'city' put: 'Berlin';
			at: 'zip' put: '10115'.
		customer := Dictionary new.
		customer at: 'name' put: 'Kunde ' , (self nextRandom: 99999) printString;
			at: 'id' put: (self nextRandom: 1000000);
			at: 'active' put: (self nextRandom: 2) = 0;
			at: 'addresses' put: (Array with: address);
			at: 'createdAt' put: 1700000000 + (self nextRandom: 10000000).
		customer]