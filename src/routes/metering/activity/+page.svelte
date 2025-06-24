<script lang="ts">
	import DataTable from '$lib/components/DataTable.svelte';
	import { Heading } from 'flowbite-svelte';
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import type { ConfigColumns } from 'datatables.net-dt';

	const { data }: PageProps = $props();
	let columns: ConfigColumns[] = $state([]);
	onMount(() => {
		data.columns[0].render = (data: Date, type: string) => {
			if (type === 'display') {
				return data.toLocaleString();
			}
			return data;
		};
		data.columns[3].render = (data: string, type: string) => {
			if (type === 'display') {
				const [id, name] = data.split('|');
				return `<a href="/metering/user/${id}" class="decoration-solid underline" target="_blank">${name}</a>`;
			}
			return data;
		};
		columns = data.columns;
	});
</script>

<svelte:head>
	<title>Activity - OWUI-Metering</title>
</svelte:head>

<Heading tag="h1" class="mb-4">Activity</Heading>
{#key columns}
	<DataTable data={data.rows} {columns} ordering={[[0, 'desc']]} tableId="activity-table" />
{/key}
