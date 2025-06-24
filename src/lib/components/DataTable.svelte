<script lang="ts">
	import DataTable, { type Api, type ConfigColumns } from 'datatables.net-dt';
	import { Input, Select } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	const {
		columns,
		data,
		tableId,
		ordering
	}: {
		columns: ConfigColumns[];
		data: (string | number | Date)[][];
		tableId: string;
		ordering?: [number, 'asc' | 'desc'][];
	} = $props();

	let table: Api<any> | null;
	onMount(() => {
		table = new DataTable(`#${tableId}`, {
			columns,
			data,
			layout: { topEnd: null, topStart: null },
			order: ordering
		});
	});
	let search = $state('');
	let pageSize = $state(10);
	let pageOptions = [
		{ value: 10, name: '10' },
		{ value: 25, name: '25' },
		{ value: 50, name: '50' },
		{ value: -1, name: 'All' }
	];

	$effect(() => {
		table?.search(search, false, true).draw();
	});
	$effect(() => {
		table?.page?.len(pageSize).draw();
	});
</script>

<div class="dark:text-white">
	<div class="flex flex-row items-stretch justify-between gap-5">
		<Select items={pageOptions} bind:value={pageSize} />
		<Input type="text" placeholder="Search..." bind:value={search} />
	</div>
	<table id={tableId} class="display"></table>
</div>
