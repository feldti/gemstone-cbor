baseline
baseline: spec
	<baseline>
	spec for: #'common' do: [
		spec
			package: 'Cbor-Core';
			package: 'Cbor-Tests' with: [spec requires: #('Cbor-Core')];
			package: 'Cbor-Zinc-Examples' with: [spec requires: #('Cbor-Core' 'Cbor-Tests')].
		spec
			group: 'default' with: #('Core' 'Tests');
			group: 'Core' with: #('Cbor-Core');
			group: 'Tests' with: #('Cbor-Tests');
			group: 'Zinc' with: #('Cbor-Zinc-Examples')]