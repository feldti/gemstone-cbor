tests
testBenchmarkRunsAndRoundTrips
	"Small scale run: every dataset round-trips and the report has one row per dataset."

	| bench report |
	bench := (CborBenchmark scale: 1/20) runs: 1; yourself.
	bench datasets do: [:assoc |
		self assert: (Cbor decode: (Cbor encode: assoc value)) equals: assoc value].
	report := bench report.
	self assert: (report occurrencesOf: Character lf) equals: bench datasets size + 1