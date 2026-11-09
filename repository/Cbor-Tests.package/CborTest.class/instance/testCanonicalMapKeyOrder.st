tests - collections
testCanonicalMapKeyOrder
	| d |
	d := Dictionary new.
	#('e' 'd' 'c' 'b' 'a') do: [:k | d at: k put: k asUppercase].
	self assertEncoding: d is: 'a56161614161626142616361436164614461656145'.
	d := Dictionary new.
	d at: 'aa' put: 1; at: 'b' put: 2; at: 10 put: 3; at: -1 put: 4; at: 100 put: 5.
	"RFC 8949 4.2.1: bytewise order of encoded keys: 0a, 1864, 20, 6162, 626161"
	self assertEncoding: d is: 'a50a031864052004616202626161' , '01'