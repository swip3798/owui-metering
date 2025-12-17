<script lang="ts">
	import {
		Card,
		Heading,
		P,
		Spinner,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import type { PageProps } from './$types';
	import ChartCard from '$lib/components/ChartCard.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { onMount } from 'svelte';
	import type { ConfigColumns } from 'datatables.net-dt';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';

	const { data }: PageProps = $props();
	const transformChartData = async (
		chartDataPromise: Promise<
			{
				date: string;
				cost: number;
				input_token: number;
				output_token: number;
			}[]
		>
	) => {
		const chartData = await chartDataPromise;
		const categories = chartData.map((usage) => usage.date);
		const series = [
			{
				name: 'Cost',
				data: chartData.map((usage) => usage.cost),
				color: '#1A56DB'
			}
		];
		const totalCost = chartData.reduce((cost, usage) => cost + usage.cost, 0);
		return { categories, series, totalCost };
	};
	const chartData = $derived(transformChartData(data.dailyUsage));
	let columns: ConfigColumns[] = $state([]);
	onMount(() => {
		data.recentActivity.columns[0].render = (data: Date, type: string) => {
			if (type === 'display') {
				return data.toLocaleString();
			}
			return data;
		};
		data.recentActivity.columns[4].render = (data: string, type: string) => {
			if (type === 'display') {
				const [id, name] = data.split('|');
				return `<a href="/metering/user/${id}" class="decoration-solid underline" target="_blank">${name}</a>`;
			}
			return data;
		};
		columns = data.recentActivity.columns;
	});
</script>

<svelte:head>
	<title>Start - OWUI-Metering</title>
</svelte:head>
<div class="flex w-full flex-col gap-3">
	<div>
		<Heading class="mb-2">OWUI-Metering</Heading>
		<P>Your metering service for Open-Webui + OpenRouter!</P>
	</div>
	<div class="flex flex-row gap-2">
		<Card class="p-4">
			{#await data.credits}
				<Spinner class="m-auto" />
			{:then credits}
				{#if credits.provider != null}
					{#if credits.credits != null}
						<Heading tag="h2">
							${(credits.credits.total_credits - credits.credits.total_usage).toFixed(3)}</Heading
						><P>Current credits</P>
					{:else}
						<div class="flex flex-row gap-2">
							<span class="text-rose-600">
								<InfoCircleSolid />
							</span>
							<P>An error occured while loading available credits</P>
						</div>
					{/if}
				{:else}
					<P>Your set provider doesn't have credits</P>
				{/if}
			{/await}
		</Card>
		<Card class="w-full max-w-full p-4">
			{#await data.topModels}
				<Spinner class="m-auto" />
			{:then topModels}
				<Table>
					<TableHead>
						<TableHeadCell>Model</TableHeadCell>
						<TableHeadCell>Total tokens</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each topModels as model}
							<TableBodyRow>
								<TableBodyCell>{model.model}</TableBodyCell>
								<TableBodyCell>{model.tokens}</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			{:catch}
				<P>Error while collecting the top used models.</P>
			{/await}
		</Card>
	</div>
	{#await chartData}
		<Card class="w-full max-w-full p-4">
			<Spinner class="m-auto" />
		</Card>
	{:then chartData}
		<ChartCard
			series={chartData.series}
			categories={chartData.categories}
			bigValue={'$' + chartData.totalCost.toFixed(4)}
			explanation="Total cost on OpenRouter"
		/>
	{/await}
	<Card class="w-full min-w-full p-2">
		{#key columns}
			<DataTable
				data={data.recentActivity.rows}
				{columns}
				ordering={[[0, 'desc']]}
				tableId="activity-table"
			/>
		{/key}
	</Card>
</div>
