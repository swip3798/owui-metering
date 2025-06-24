<script lang="ts">
	import type { PageProps } from './$types';
	import DataTable from '$lib/components/DataTable.svelte';

	const { data }: PageProps = $props();
	const columns = [
		{ title: 'Name' },
		{ title: 'Context Window' },
		{ title: 'Created at' },
		{ title: 'Input Costs' },
		{ title: 'Output Costs' },
		{ title: 'Reasoning' }
	];
	const models = data.models.map((model) => {
		return [
			model.name,
			model.contextLength,
			model.created.toLocaleDateString(),
			model.pricing.prompt,
			model.pricing.completion,
			model.pricing.reasoning ?? 0
		];
	});
</script>

<svelte:head>
	<title>Model Overview - OWUI-Metering</title>
</svelte:head>

<DataTable {columns} data={models} tableId="model-table" />
