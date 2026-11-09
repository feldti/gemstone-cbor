tests - floats
testFloatRoundTripRandomValues
	#(0.1 0.2 0.3 1.0e-10 123456.789 -98765.4321 1.0e-310 2.5e-45 1.401298464324817e-45 6.103515625e-5 3.0517578125e-5)
		do: [:f | self assert: (Cbor decode: (Cbor encode: f)) equals: f]